import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const images = await ctx.db.query("gallery").order("desc").collect();
        return await Promise.all(
            images.map(async (image) => ({
                ...image,
                url: image.imageStorageId
                    ? await ctx.storage.getUrl(image.imageStorageId)
                    : image.image,
            }))
        );
    },
});

export const listActive = query({
    args: {},
    handler: async (ctx) => {
        const images = await ctx.db
            .query("gallery")
            .withIndex("by_active", (q) => q.eq("active", true))
            .collect();

        return await Promise.all(
            images.map(async (image) => ({
                ...image,
                url: image.imageStorageId
                    ? await ctx.storage.getUrl(image.imageStorageId)
                    : image.image,
            }))
        );
    },
});

export const create = mutation({
    args: {
        adminToken: v.string(),
        title: v.string(),
        image: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
        displayOrder: v.optional(v.number()),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);

        return await ctx.db.insert("gallery", {
            title: args.title,
            image: args.image,
            imageStorageId: args.imageStorageId,
            displayOrder: args.displayOrder,
            active: args.active,
        });
    },
});

export const update = mutation({
    args: {
        adminToken: v.string(),
        id: v.id("gallery"),
        title: v.optional(v.string()),
        displayOrder: v.optional(v.number()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);

        const { id, adminToken, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: {
        id: v.id("gallery"),
        adminToken: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdminSession(ctx, args.adminToken);

        const item = await ctx.db.get(args.id);
        if (item?.imageStorageId) {
            // Clean up storage if exists
            await ctx.storage.delete(item.imageStorageId);
        }
        await ctx.db.delete(args.id);
    },
});
