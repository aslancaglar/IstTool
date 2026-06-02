import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";
import { requireAdminSession } from "./lib/auth";
import { snapshot } from "./data/snapshot";

// Helper to strip internal Convex fields
function clean(item: any) {
  if (!item) return null;
  const { _id, _creationTime, ...rest } = item;
  return rest;
}

// Internal helper functions
async function runSeedCategories(ctx: MutationCtx) {
  const categories = snapshot.menuCategories || [];
  for (const cat of categories) {
    await ctx.db.insert("menuCategories", clean(cat));
  }
}

async function runSeedToppingCategories(ctx: MutationCtx) {
  const categories = snapshot.toppingCategories || [];
  for (const cat of categories) {
    await ctx.db.insert("toppingCategories", clean(cat));
  }
}

async function runSeedToppings(ctx: MutationCtx) {
  const toppings = snapshot.toppings || [];
  for (const topping of toppings) {
    await ctx.db.insert("toppings", clean(topping));
  }
}

async function runSeedMenuItems(ctx: MutationCtx) {
  const items = snapshot.menuItems || [];
  for (const item of items) {
    await ctx.db.insert("menuItems", clean(item));
  }
}

async function runSeedToppingAssignments(ctx: MutationCtx) {
  const assignments = snapshot.menuItemToppings || [];
  for (const assignment of assignments) {
    await ctx.db.insert("menuItemToppings", clean(assignment));
  }
}

async function runSeedRestaurantInfo(ctx: MutationCtx) {
  const info = snapshot.restaurantInfo || [];
  for (const item of info) {
    await ctx.db.insert("restaurantInfo", clean(item));
  }
}

async function runSeedReviews(ctx: MutationCtx) {
  const reviews = snapshot.reviews || [];
  for (const r of reviews) {
    await ctx.db.insert("reviews", clean(r));
  }
}

async function runSeedGallery(ctx: MutationCtx) {
  const gallery = snapshot.gallery || [];
  for (const item of gallery) {
    await ctx.db.insert("gallery", clean(item));
  }
}

// Exported Mutations
export const clearAllData = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery", "orders", "promoCodes", "users", "userSessions"] as const;
    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }
    return { success: true };
  },
});

export const seedAll = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    // 1. Clear everything
    const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery"] as const;
    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }

    // 2. Run all seeds
    await runSeedCategories(ctx);
    await runSeedToppingCategories(ctx);
    await runSeedToppings(ctx);
    await runSeedMenuItems(ctx);
    await runSeedToppingAssignments(ctx);
    await runSeedRestaurantInfo(ctx);
    await runSeedReviews(ctx);
    await runSeedGallery(ctx);
    
    return { success: true };
  },
});

export const exportData = mutation({
  args: {
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.adminToken !== undefined) {
      await requireAdminSession(ctx, args.adminToken);
    }
    const menuCategories = await ctx.db.query("menuCategories").collect();
    const menuItems = await ctx.db.query("menuItems").collect();
    const toppingCategories = await ctx.db.query("toppingCategories").collect();
    const toppings = await ctx.db.query("toppings").collect();
    const menuItemToppings = await ctx.db.query("menuItemToppings").collect();
    const restaurantInfo = await ctx.db.query("restaurantInfo").collect();
    const reviews = await ctx.db.query("reviews").collect();
    const gallery = await ctx.db.query("gallery").collect();

    return {
      menuCategories,
      menuItems,
      toppingCategories,
      toppings,
      menuItemToppings,
      restaurantInfo,
      reviews,
      gallery,
    };
  },
});

export const importData = mutation({
  args: {
    adminToken: v.string(),
    data: v.any(),
    clearFirst: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    if (args.clearFirst) {
      const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery"] as const;
      for (const table of tables) {
        const items = await ctx.db.query(table).collect();
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
      }
    }

    const { data } = args;
    const insertItems = async (table: any, items: any[]) => {
      if (!items) return;
      for (const item of items) {
        const cleaned = clean(item);
        if (cleaned) {
          await ctx.db.insert(table, cleaned);
        }
      }
    };

    await insertItems("menuCategories", data.menuCategories);
    await insertItems("toppingCategories", data.toppingCategories);
    await insertItems("toppings", data.toppings);
    await insertItems("menuItems", data.menuItems);
    await insertItems("menuItemToppings", data.menuItemToppings);
    await insertItems("restaurantInfo", data.restaurantInfo);
    await insertItems("reviews", data.reviews);
    await insertItems("gallery", data.gallery);

    return { success: true };
  },
});


