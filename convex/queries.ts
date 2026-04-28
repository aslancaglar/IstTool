import { query } from "./_generated/server";
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
              name: t.name || menuItem.name, // Prefer topping's own name if set
              price: t.price !== undefined ? t.price : menuItem.price, // Prefer topping's own price if set
              displayOrder: t.displayOrder || 0
            };
          }
          
          return {
            id: t.toppingId,
            name: t.name,
            price: t.price,
            displayOrder: t.displayOrder || 0
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
          toppings: activeToppings,
        };
      })
    );

    return categoriesWithToppings.filter((c): c is NonNullable<typeof c> => c !== null);
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
                    price: topping.price !== undefined ? topping.price : linkedItem.price 
                  };
                }
              }
              return { name: topping.name, price: topping.price ?? 0 };
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

    // Admin can see everything
    if (args.adminToken) {
      try {
        await requireAdminSession(ctx, args.adminToken);
        return await enrichOrder(order);
      } catch { /* fall through */ }
    }

    // Authenticated user who owns the order can see everything
    if (args.sessionToken) {
      const user = await maybeGetUserFromSession(ctx, args.sessionToken);
      if (user && order.userId === user._id) {
        return await enrichOrder(order);
      }
    }

    // Unauthenticated / non-owner: return limited confirmation info, but include enriched items and address
    const enriched = await enrichOrder(order);
    return {
      _id: enriched._id,
      _creationTime: enriched._creationTime,
      status: enriched.status,
      type: enriched.type,
      scheduledTime: enriched.scheduledTime,
      totalPrice: enriched.totalPrice,
      createdAt: enriched.createdAt,
      items: enriched.items,
      address: enriched.address,
    };
  },
});

export const getAllOrders = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .collect();

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
                    price: topping.price !== undefined ? topping.price : linkedItem.price 
                  };
                }
              }
              return { name: topping.name, price: topping.price ?? 0 };
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

export const getMenuCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("menuCategories").collect();
    return categories
      .filter(cat => cat.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },
});
