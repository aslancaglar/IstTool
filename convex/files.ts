import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

// Generate a short-lived upload URL for file uploads
export const generateUploadUrl = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a download URL for a file
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
