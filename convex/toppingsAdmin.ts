import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

export const listToppingCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("toppingCategories").collect();
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const getToppingCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("toppingCategories")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();
    return category;
  },
});

export const createToppingCategory = mutation({
  args: {
    adminToken: v.string(),
    categoryId: v.string(),
    name: v.string(),
    minSelection: v.number(),
    maxSelection: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    freeForBogo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const id = await ctx.db.insert("toppingCategories", {
      categoryId: args.categoryId,
      name: args.name,
      minSelection: args.minSelection,
      maxSelection: args.maxSelection,
      displayOrder: args.displayOrder ?? 0,
      active: args.active ?? true,
      freeForBogo: args.freeForBogo ?? false,
    });
    return id;
  },
});

export const updateToppingCategory = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("toppingCategories"),
    categoryId: v.string(),
    name: v.string(),
    minSelection: v.number(),
    maxSelection: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    freeForBogo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      categoryId: args.categoryId,
      name: args.name,
      minSelection: args.minSelection,
      maxSelection: args.maxSelection,
      displayOrder: args.displayOrder,
      active: args.active,
      freeForBogo: args.freeForBogo,
    });
    return args.id;
  },
});

export const removeToppingCategory = mutation({
  args: {
    id: v.id("toppingCategories"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});

export const listToppings = query({
  args: {},
  handler: async (ctx) => {
    const toppings = await ctx.db.query("toppings").collect();
    const enriched = await Promise.all(toppings.map(async (t) => {
      if (t.menuItemId) {
        const menuItem = await ctx.db.get(t.menuItemId);
        if (menuItem) {
          return { 
            ...t, 
            name: t.name || menuItem.name, 
            effectivePrice: t.specialPrice !== undefined ? t.specialPrice : menuItem.price 
          };
        }
      }
      return { 
        ...t, 
        effectivePrice: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0) 
      };
    }));
    return enriched.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const listToppingsByCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    const toppings = await ctx.db
      .query("toppings")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    const enriched = await Promise.all(toppings.map(async (t) => {
      if (t.menuItemId) {
        const menuItem = await ctx.db.get(t.menuItemId);
        if (menuItem) {
          return { 
            ...t, 
            name: t.name || menuItem.name, 
            effectivePrice: t.specialPrice !== undefined ? t.specialPrice : menuItem.price 
          };
        }
      }
      return { 
        ...t, 
        effectivePrice: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0) 
      };
    }));
    return enriched.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const createTopping = mutation({
  args: {
    adminToken: v.string(),
    toppingId: v.string(),
    name: v.string(),
    price: v.optional(v.number()),
    categoryId: v.string(),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    menuItemId: v.optional(v.id("menuItems")),
    specialPrice: v.optional(v.number()),
    tvaPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const id = await ctx.db.insert("toppings", {
      toppingId: args.toppingId,
      name: args.name,
      price: args.price,
      categoryId: args.categoryId,
      displayOrder: args.displayOrder ?? 0,
      active: args.active ?? true,
      menuItemId: args.menuItemId,
      specialPrice: args.specialPrice,
      tvaPercent: args.tvaPercent,
    });
    return id;
  },
});

export const updateTopping = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("toppings"),
    toppingId: v.string(),
    name: v.string(),
    price: v.optional(v.number()),
    categoryId: v.string(),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    menuItemId: v.optional(v.id("menuItems")),
    specialPrice: v.optional(v.number()),
    tvaPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      toppingId: args.toppingId,
      name: args.name,
      price: args.price,
      categoryId: args.categoryId,
      displayOrder: args.displayOrder,
      active: args.active,
      menuItemId: args.menuItemId,
      specialPrice: args.specialPrice,
      tvaPercent: args.tvaPercent,
    });
    return args.id;
  },
});

export const updateToppingCategoryDisplayOrder = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("toppingCategories"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, { displayOrder: args.displayOrder });
  },
});

export const updateToppingDisplayOrder = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("toppings"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, { displayOrder: args.displayOrder });
  },
});

export const removeTopping = mutation({
  args: {
    id: v.id("toppings"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});

// Menu Item Topping Assignments
export const getMenuItemToppingCategories = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("menuItemToppings")
      .withIndex("by_menu_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();
    // Sort by display order and return category IDs
    const sorted = assignments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return sorted.map((a) => a.toppingCategoryId);
  },
});

export const setMenuItemToppingCategories = mutation({
  args: {
    adminToken: v.string(),
    menuItemId: v.id("menuItems"),
    categoryIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    // Remove all existing assignments
    const existing = await ctx.db
      .query("menuItemToppings")
      .withIndex("by_menu_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    for (const assignment of existing) {
      await ctx.db.delete(assignment._id);
    }

    // Add new assignments with display order based on array position
    for (let i = 0; i < args.categoryIds.length; i++) {
      await ctx.db.insert("menuItemToppings", {
        menuItemId: args.menuItemId,
        toppingCategoryId: args.categoryIds[i],
        displayOrder: i,
      });
    }
  },
});
