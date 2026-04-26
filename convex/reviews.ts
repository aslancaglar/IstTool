import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, requireUserSession } from "./lib/auth";

export const list = query({
    args: {
        adminToken: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);
        return await ctx.db.query("reviews").order("desc").collect();
    },
});

export const listActive = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_active", (q) => q.eq("active", true))
            .order("desc")
            .collect();
    },
});

export const getByOrder = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .first();
    },
});

export const create = mutation({
    args: {
        adminToken: v.string(),
        name: v.string(),
        rating: v.number(),
        comment: v.string(),
        date: v.string(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);

        return await ctx.db.insert("reviews", {
            name: args.name,
            rating: args.rating,
            comment: args.comment,
            date: args.date,
            active: args.active,
        });
    },
});

export const addOrderReview = mutation({
    args: {
        sessionToken: v.string(),
        orderId: v.id("orders"),
        rating: v.number(),
        comment: v.string(),
    },
    handler: async (ctx, args) => {
        const { user } = await requireUserSession(ctx, args.sessionToken);

        const order = await ctx.db.get(args.orderId);
        if (!order) {
            throw new Error("Commande introuvable.");
        }

        if (order.userId !== user._id) {
            throw new Error("Unauthorized");
        }

        if (order.status !== "completed") {
            throw new Error("Vous pouvez laisser un avis uniquement pour une commande terminée.");
        }

        const existing = await ctx.db
            .query("reviews")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .first();

        if (existing) {
            throw new Error("Vous avez déjà laissé un avis pour cette commande.");
        }

        return await ctx.db.insert("reviews", {
            userId: user._id,
            orderId: args.orderId,
            name: `${user.firstName} ${user.lastName}`,
            rating: args.rating,
            comment: args.comment,
            date: new Date().toLocaleDateString('fr-FR'),
            active: true, // Default to true for user ratings, or false if you want moderation
        });
    },
});

export const update = mutation({
    args: {
        adminToken: v.string(),
        id: v.id("reviews"),
        active: v.optional(v.boolean()),
        name: v.optional(v.string()),
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);

        const { id, adminToken, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: {
        id: v.id("reviews"),
        adminToken: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);
        await ctx.db.delete(args.id);
    },
});
