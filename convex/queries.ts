import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, maybeGetUserFromSession } from "./lib/auth";

// Re-export menu item queries from menuItems.ts for backwards compatibility
// Note: Prefer using api.menuItems.* directly in new code
export { list as getMenuItems, listByCategory as getMenuItemsByCategory, getPopularItems } from "./menuItems";

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

    const categoriesWithToppings = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = allCategories.find((c) => c.categoryId === categoryId);
        if (!category || category.active === false) return null;

        const toppings = await ctx.db
          .query("toppings")
          .withIndex("by_category", (q) => q.eq("categoryId", category.categoryId))
          .collect();

        const toppingData = await Promise.all(toppings.map(async (t) => {
          if (t.active === false) return null;
          
          if (t.menuItemId) {
            const menuItem = await ctx.db.get(t.menuItemId);
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
        }));

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
      })
    );

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

    // Helper to enrich a single order
    const enrichOrder = async (o: typeof order) => {
      const enrichedItems = await Promise.all(o.items.map(async (item) => {
        if (!item.selectedToppings) return item;
        const enrichedToppings = await Promise.all(item.selectedToppings.map(async (toppingGroup) => {
          const toppingDetails = await Promise.all(toppingGroup.toppingIds.map(async (id) => {
            const topping = await ctx.db.query("toppings").filter(q => q.eq(q.field("toppingId"), id)).first();
            if (topping) {
              if (topping.menuItemId) {
                const linkedItem = await ctx.db.get(topping.menuItemId);
                if (linkedItem) {
                  return { 
                    name: topping.name || linkedItem.name, 
                    price: topping.specialPrice !== undefined ? topping.specialPrice : linkedItem.price 
                  };
                }
              }
              return { 
                name: topping.name, 
                price: topping.specialPrice !== undefined ? topping.specialPrice : (topping.price ?? 0)
              };
            }
            return { name: id, price: 0 };
          }));
          return {
            ...toppingGroup,
            toppingNames: toppingDetails.map(t => t.name),
            toppingPrices: toppingDetails.map(t => t.price),
          };
        }));
        return { ...item, selectedToppings: enrichedToppings };
      }));
      return { ...o, items: enrichedItems };
    };

    const enrichedOrder = await enrichOrder(order);
    
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

    // Enrich orders with topping names
    return await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        if (!item.selectedToppings) return item;

        const enrichedToppings = await Promise.all(item.selectedToppings.map(async (toppingGroup) => {
          const toppingDetails = await Promise.all(toppingGroup.toppingIds.map(async (id) => {
            const topping = await ctx.db.query("toppings").filter(q => q.eq(q.field("toppingId"), id)).first();
            if (topping) {
              if (topping.menuItemId) {
                const linkedItem = await ctx.db.get(topping.menuItemId);
                if (linkedItem) {
                  return { 
                    name: topping.name || linkedItem.name, 
                    price: topping.specialPrice !== undefined ? topping.specialPrice : linkedItem.price 
                  };
                }
              }
              return { 
                name: topping.name, 
                price: topping.specialPrice !== undefined ? topping.specialPrice : (topping.price ?? 0)
              };
            }
            return { name: id, price: 0 };
          }));
          return {
            ...toppingGroup,
            toppingNames: toppingDetails.map(t => t.name),
            toppingPrices: toppingDetails.map(t => t.price),
          };
        }));

        return { ...item, selectedToppings: enrichedToppings };
      }));
      return { ...order, items: enrichedItems };
    }));
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

      const enrichedToppings = await Promise.all(item.selectedToppings.map(async (group) => {
        const details = await Promise.all(group.toppingIds.map(async (id) => {
          const t = await ctx.db.query("toppings").filter(q => q.eq(q.field("toppingId"), id)).first();
          if (!t) return { name: id, price: 0, tvaPercent: itemTva };
          if (t.menuItemId) {
            const linked = await ctx.db.get(t.menuItemId);
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
        }));
        return {
          ...group,
          toppingNames: details.map(d => d.name),
          toppingPrices: details.map(d => d.price),
          toppingTvaPercents: details.map(d => d.tvaPercent),
        };
      }));
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
