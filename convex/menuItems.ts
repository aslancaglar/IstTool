import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { resolveImageUrl, resolveItemsWithImages } from "./lib/storage";
import { requireAdminSession } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    const sortedItems = items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const itemsWithImages = await resolveItemsWithImages(ctx, sortedItems);

    // Add topping category IDs for each item (sorted by display order)
    const itemsWithToppings = await Promise.all(
      itemsWithImages.map(async (item) => {
        const assignments = await ctx.db
          .query("menuItemToppings")
          .withIndex("by_menu_item", (q) => q.eq("menuItemId", item._id))
          .collect();
        // Sort by display order
        const sorted = assignments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        return {
          ...item,
          toppingCategoryIds: sorted.map((a) => a.toppingCategoryId),
        };
      })
    );

    return itemsWithToppings;
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .collect();

    // Filter items that have the requested category in their categories array
    const filteredItems = items.filter(item =>
      item.active !== false && item.inStock !== false && item.categories?.includes(args.category)
    );

    const sortedItems = filteredItems.sort((a, b) => {
      const orderA = a.categoryOrders?.find(o => o.category === args.category)?.order ?? (a.displayOrder || 0);
      const orderB = b.categoryOrders?.find(o => o.category === args.category)?.order ?? (b.displayOrder || 0);
      return orderA - orderB;
    });
    return resolveItemsWithImages(ctx, sortedItems);
  },
});

export const updateCategoryOrder = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("menuItems"),
    category: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const categoryOrders = item.categoryOrders || [];
    const existingIndex = categoryOrders.findIndex((o) => o.category === args.category);

    if (existingIndex >= 0) {
      categoryOrders[existingIndex].order = args.order;
    } else {
      categoryOrders.push({ category: args.category, order: args.order });
    }

    await ctx.db.patch(args.id, { categoryOrders });
  },
});

export const get = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      ...item,
      image: await resolveImageUrl(ctx, item),
    };
  },
});

export const getPopularItems = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("menuItems").collect();
    const popularItems = allItems.filter((item) => item.popular === true);
    return resolveItemsWithImages(ctx, popularItems);
  },
});

export const create = mutation({
  args: {
    adminToken: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    categories: v.array(v.string()),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    categoryOrders: v.optional(v.array(v.object({
      category: v.string(),
      order: v.number(),
    }))),
    active: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    platformPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const itemId = await ctx.db.insert("menuItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      image: args.image,
      imageStorageId: args.imageStorageId,
      categories: args.categories,
      popular: args.popular ?? false,
      displayOrder: args.displayOrder ?? 0,
      categoryOrders: args.categoryOrders,
      active: args.active ?? true,
      inStock: args.inStock ?? true,
      platformPrice: args.platformPrice,
    });
    return itemId;
  },
});

export const update = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("menuItems"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    categories: v.array(v.string()),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    categoryOrders: v.optional(v.array(v.object({
      category: v.string(),
      order: v.number(),
    }))),
    active: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
    platformPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const existingItem = await ctx.db.get(args.id);

    if (existingItem?.imageStorageId &&
      args.imageStorageId &&
      existingItem.imageStorageId !== args.imageStorageId) {
      await ctx.storage.delete(existingItem.imageStorageId);
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      image: args.image,
      imageStorageId: args.imageStorageId,
      categories: args.categories,
      popular: args.popular,
      displayOrder: args.displayOrder,
      categoryOrders: args.categoryOrders,
      active: args.active,
      inStock: args.inStock,
      platformPrice: args.platformPrice,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("menuItems"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const item = await ctx.db.get(args.id);
    if (item?.imageStorageId) {
      await ctx.storage.delete(item.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const removeImage = mutation({
  args: {
    id: v.id("menuItems"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    if (item.imageStorageId) {
      await ctx.storage.delete(item.imageStorageId);
    }

    await ctx.db.patch(args.id, {
      imageStorageId: undefined,
      image: "",
    });

    return { success: true };
  },
});

export const updateStock = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("menuItems"),
    inStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, { inStock: args.inStock });
  },
});

export const updateDisplayOrder = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("menuItems"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      displayOrder: args.displayOrder,
    });
    return args.id;
  },
});

export const updatePlatformPrices = mutation({
  args: {
    adminToken: v.string(),
    updates: v.array(v.object({
      id: v.id("menuItems"),
      platformPrice: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    for (const update of args.updates) {
      await ctx.db.patch(update.id, {
        platformPrice: update.platformPrice,
      });
    }
  },
});
