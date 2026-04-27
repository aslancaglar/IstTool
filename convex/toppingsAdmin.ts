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
    return toppings.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const listToppingsByCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    const toppings = await ctx.db
      .query("toppings")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return toppings.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
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
