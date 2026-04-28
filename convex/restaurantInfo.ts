import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return info;
  },
});

export const upsert = mutation({
  args: {
    adminToken: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    hours: v.optional(v.array(v.object({
      day: v.string(),
      time: v.string(),
    }))),
    socialLinks: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    holidays: v.optional(v.array(v.object({
      startDate: v.string(),
      endDate: v.string(),
      name: v.optional(v.string()),
      active: v.boolean(),
    }))),
    pickupEnabled: v.optional(v.boolean()),
    deliveryEnabled: v.optional(v.boolean()),
    minimumAdvanceNotice: v.optional(v.number()),
    deliveryFees: v.optional(v.array(v.object({
      postalCode: v.string(),
      price: v.number(),
      name: v.optional(v.string()),
      freeDeliveryThreshold: v.optional(v.number()),
    }))),
    defaultDeliveryFee: v.optional(v.number()),
    freeDeliveryThreshold: v.optional(v.number()),
    galleryEnabled: v.optional(v.boolean()),
    reviewsEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const existing = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        address: args.address,
        phone: args.phone,
        email: args.email,
        hours: args.hours,
        socialLinks: args.socialLinks,
        holidays: args.holidays,
        pickupEnabled: args.pickupEnabled,
        deliveryEnabled: args.deliveryEnabled,
        minimumAdvanceNotice: args.minimumAdvanceNotice,
        deliveryFees: args.deliveryFees,
        defaultDeliveryFee: args.defaultDeliveryFee,
        freeDeliveryThreshold: args.freeDeliveryThreshold,
        galleryEnabled: args.galleryEnabled,
        reviewsEnabled: args.reviewsEnabled,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("restaurantInfo", {
        key: "main",
        address: args.address,
        phone: args.phone,
        email: args.email,
        hours: args.hours,
        socialLinks: args.socialLinks,
        holidays: args.holidays,
        pickupEnabled: args.pickupEnabled ?? true,
        deliveryEnabled: args.deliveryEnabled ?? true,
        minimumAdvanceNotice: args.minimumAdvanceNotice ?? 30,
        deliveryFees: args.deliveryFees,
        defaultDeliveryFee: args.defaultDeliveryFee ?? 0,
        freeDeliveryThreshold: args.freeDeliveryThreshold ?? 0,
        galleryEnabled: args.galleryEnabled ?? true,
        reviewsEnabled: args.reviewsEnabled ?? true,
      });
      return id;
    }
  },
});
