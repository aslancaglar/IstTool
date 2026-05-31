import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, maybeGetUserFromSession } from "./lib/auth";

// Re-export menu item queries from menuItems.ts for backwards compatibility
// Note: Prefer using api.menuItems.* directly in new code
export { list as getMenuItems, listByCategory as getMenuItemsByCategory, getPopularItems } from "./menuItems";

// ---------------------------------------------------------------------------
// Topping enrichment helpers
//
// Resolving order toppings used to issue one full-table scan per topping id
// (`.filter(...).first()`) plus a `ctx.db.get` per linked menu item — an N+1
// pattern repeated across getOrder, getAllOrders and getEnrichedOrderInternal.
// These helpers load the (bounded) toppings table once and batch the linked
// menu-item lookups, so resolving a topping becomes an in-memory map lookup.
// ---------------------------------------------------------------------------

type ToppingMaps = {
  toppingById: Map<string, any>;
  menuItemById: Map<string, any>;
};

async function loadToppingMaps(ctx: any): Promise<ToppingMaps> {
  const toppings = await ctx.db.query("toppings").collect();
  const toppingById = new Map<string, any>(toppings.map((t: any) => [t.toppingId, t]));

  const linkedIds = Array.from(
    new Set(toppings.filter((t: any) => t.menuItemId).map((t: any) => t.menuItemId))
  );
  const linkedItems = await Promise.all(linkedIds.map((id) => ctx.db.get(id as any)));
  const menuItemById = new Map<string, any>();
  linkedItems.forEach((item: any, i: number) => {
    if (item) menuItemById.set(linkedIds[i] as string, item);
  });

  return { toppingById, menuItemById };
}

function resolveTopping(
  id: string,
  itemTva: number,
  maps: ToppingMaps
): { name: string; price: number; tvaPercent: number } {
  const t = maps.toppingById.get(id);
  if (!t) return { name: id, price: 0, tvaPercent: itemTva };

  if (t.menuItemId) {
    const linked = maps.menuItemById.get(t.menuItemId);
    if (linked) {
      return {
        name: t.name || linked.name,
        price: t.specialPrice !== undefined ? t.specialPrice : linked.price,
        tvaPercent: t.tvaPercent ?? linked.tvaPercent ?? itemTva,
      };
    }
  }

  return {
    name: t.name,
    price: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0),
    tvaPercent: t.tvaPercent ?? itemTva,
  };
}

// Enrich an order's items with resolved topping names/prices. Shape matches the
// public-facing orders (getOrder / getAllOrders): no per-topping tva fields.
function enrichOrderItems(items: any[], maps: ToppingMaps): any[] {
  return items.map((item) => {
    if (!item.selectedToppings) return item;
    const enrichedToppings = item.selectedToppings.map((group: any) => {
      const details: ReturnType<typeof resolveTopping>[] = group.toppingIds.map(
        (id: string) => resolveTopping(id, 0, maps)
      );
      return {
        ...group,
        toppingNames: details.map((d) => d.name),
        toppingPrices: details.map((d) => d.price),
      };
    });
    return { ...item, selectedToppings: enrichedToppings };
  });
}

export const getToppingCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("toppingCategories").collect();
    return categories
      .filter(cat => cat.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const getToppingsForMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    // Get assignments and sort them by displayOrder
    const assignments = await ctx.db
      .query("menuItemToppings")
      .withIndex("by_menu_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    const sortedAssignments = assignments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    // Deduplicate category IDs to prevent duplicate categories from being displayed
    const categoryIds = Array.from(new Set(sortedAssignments.map((a) => a.toppingCategoryId)));

    const allCategories = await ctx.db.query("toppingCategories").collect();

    // Load toppings for every category first, then batch-load all linked menu
    // items in one pass (instead of a ctx.db.get per topping).
    const categoryToppings = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = allCategories.find((c) => c.categoryId === categoryId);
        if (!category || category.active === false) return null;
        const toppings = await ctx.db
          .query("toppings")
          .withIndex("by_category", (q) => q.eq("categoryId", category.categoryId))
          .collect();
        return { category, toppings };
      })
    );

    const linkedIds = Array.from(
      new Set(
        categoryToppings
          .filter((c): c is NonNullable<typeof c> => c !== null)
          .flatMap((c) => c.toppings)
          .filter((t) => t.active !== false && t.menuItemId)
          .map((t) => t.menuItemId!)
      )
    );
    const linkedItems = await Promise.all(linkedIds.map((id) => ctx.db.get(id)));
    const menuItemById = new Map<string, any>();
    linkedItems.forEach((item, i) => {
      if (item) menuItemById.set(linkedIds[i] as string, item);
    });

    const categoriesWithToppings = categoryToppings.map((entry) => {
        if (!entry) return null;
        const { category, toppings } = entry;

        const toppingData = toppings.map((t) => {
          if (t.active === false) return null;

          if (t.menuItemId) {
            const menuItem = menuItemById.get(t.menuItemId);
            if (!menuItem || menuItem.inStock === false) return null;
            return {
              id: t.toppingId,
              name: t.name || menuItem.name,
              price: t.specialPrice !== undefined ? t.specialPrice : menuItem.price, // Final price for website
              specialPrice: t.specialPrice,
              displayOrder: t.displayOrder || 0,
              tvaPercent: t.tvaPercent ?? menuItem.tvaPercent,
            };
          }

          return {
            id: t.toppingId,
            name: t.name,
            price: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0), // Final price for website
            specialPrice: t.specialPrice,
            displayOrder: t.displayOrder || 0,
            tvaPercent: t.tvaPercent,
          };
        });

        const activeToppings = toppingData
          .filter((t): t is NonNullable<typeof t> => t !== null)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(({ displayOrder, ...rest }) => rest);

        if (activeToppings.length === 0) return null;

        return {
          id: category.categoryId,
          name: category.name,
          minSelection: category.minSelection,
          maxSelection: category.maxSelection,
          freeForBogo: category.freeForBogo ?? false,
          toppings: activeToppings,
        };
      });

    return categoriesWithToppings.filter((c): c is NonNullable<typeof c> => c !== null);
  },
});

export const getToppingsByIds = query({
  args: { toppingIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.toppingIds) {
      const topping = await ctx.db
        .query("toppings")
        .filter((q) => q.eq(q.field("toppingId"), id))
        .first();
      if (topping) results.push(topping);
    }
    return results;
  },
});

export const getOrder = query({
  args: {
    orderId: v.id("orders"),
    sessionToken: v.optional(v.string()),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const maps = await loadToppingMaps(ctx);
    const enrichedOrder = { ...order, items: enrichOrderItems(order.items, maps) };
    
    // Admin can see everything (including DB internal fields)
    if (args.adminToken) {
      try {
        await requireAdminSession(ctx, args.adminToken);
        return enrichedOrder;
      } catch { /* fall through */ }
    }

    // Authenticated user who owns the order
    if (args.sessionToken) {
      const user = await maybeGetUserFromSession(ctx, args.sessionToken);
      if (user && order.userId === user._id) {
        return enrichedOrder;
      }
    }

    // Unauthenticated / non-owner: return confirmation info including items
    // (We exclude userId and session links, but show order details)
    return {
      _id: enrichedOrder._id,
      _creationTime: enrichedOrder._creationTime,
      status: enrichedOrder.status,
      type: enrichedOrder.type,
      scheduledTime: enrichedOrder.scheduledTime,
      totalPrice: enrichedOrder.totalPrice,
      deliveryFee: enrichedOrder.deliveryFee,
      discountAmount: enrichedOrder.discountAmount,
      items: enrichedOrder.items,
      address: enrichedOrder.address,
      customer: {
        firstName: enrichedOrder.customer.firstName,
        lastName: enrichedOrder.customer.lastName,
      },
      createdAt: enrichedOrder.createdAt,
      prepTimeMinutes: enrichedOrder.prepTimeMinutes,
      deliveryTimeMinutes: enrichedOrder.deliveryTimeMinutes,
      acceptedAt: enrichedOrder.acceptedAt,
    };
  },
});

export const getAllOrders = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .collect();

    // Hide orders that haven't completed Stripe checkout — they aren't real
    // orders until the customer pays.
    const orders = allOrders.filter((o) => o.status !== "awaiting_payment");

    // Enrich orders with topping names (topping maps loaded once for all orders)
    const maps = await loadToppingMaps(ctx);
    return orders.map((order) => ({ ...order, items: enrichOrderItems(order.items, maps) }));
  },
});

// Server-only: load an order without auth checks. Callable from actions only.
export const getOrderInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Server-only: load restaurant settings (incl. PrintNode key). Callable from actions only.
export const getRestaurantInfoInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
  },
});

// Server-only: load order with topping names/prices resolved. Used by the
// printing action to render receipts.
export const getEnrichedOrderInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const maps = await loadToppingMaps(ctx);

    const enrichedItems = await Promise.all(order.items.map(async (item) => {
      let menuItem = await ctx.db
        .query("menuItems")
        .filter((q) => q.eq(q.field("_id"), item.menuItemId as any))
        .first();

      if (!menuItem) {
        menuItem = await ctx.db
          .query("menuItems")
          .filter((q) => q.eq(q.field("name"), item.name))
          .first();
      }

      const itemTva = menuItem?.tvaPercent ?? 10;

      if (!item.selectedToppings) {
        return { ...item, tvaPercent: itemTva };
      }

      const enrichedToppings = item.selectedToppings.map((group) => {
        const details = group.toppingIds.map((id) => resolveTopping(id, itemTva, maps));
        return {
          ...group,
          toppingNames: details.map(d => d.name),
          toppingPrices: details.map(d => d.price),
          toppingTvaPercents: details.map(d => d.tvaPercent),
        };
      });
      return { ...item, tvaPercent: itemTva, selectedToppings: enrichedToppings };
    }));

    return { ...order, items: enrichedItems };
  },
});

export const getMenuCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("menuCategories").collect();
    return categories
      .filter(cat => cat.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },
});
