import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";

const DISCOUNT_TYPE = v.union(
  v.literal("fixed"),
  v.literal("percentage"),
  v.literal("free_delivery"),
  v.literal("percent_off_items"),
  v.literal("percent_off_specific_items"),
  v.literal("bogo_same"),
  v.literal("bogo_gift"),
);

// ─── Admin queries ────────────────────────────────────────────────────────────

// Promo codes (requiresCode !== false)
export const list = query({
  args: { adminToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const all = await ctx.db.query("promoCodes").collect();
    return all
      .filter((p) => p.requiresCode !== false)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Campaigns (requiresCode === false)
export const listCampaigns = query({
  args: { adminToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const all = await ctx.db.query("promoCodes").collect();
    return all
      .filter((p) => p.requiresCode === false)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Active campaigns — public, used at checkout to auto-apply
export const listActiveCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("promoCodes").collect();
    const now = Date.now();
    return all.filter(
      (p) =>
        p.requiresCode === false &&
        p.active &&
        (p.expiresAt == null || now <= p.expiresAt)
    );
  },
});

// ─── validate (promo codes only) ─────────────────────────────────────────────

export const validate = query({
  args: {
    code: v.string(),
    orderSubtotal: v.number(),
    orderType: v.optional(v.union(v.literal("pickup"), v.literal("delivery"))),
    items: v.optional(v.array(v.object({
      menuItemId: v.string(),
      price: v.number(),
      categoryIds: v.array(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!promo) return { valid: false as const, reason: "Code invalide" };
    // Campaigns can't be entered as codes
    if (promo.requiresCode === false) return { valid: false as const, reason: "Code invalide" };
    if (!promo.active) return { valid: false as const, reason: "Code inactif" };
    if (promo.expiresAt && Date.now() > promo.expiresAt)
      return { valid: false as const, reason: "Code expiré" };
    if (promo.maxUsageCount != null && promo.usageCount >= promo.maxUsageCount)
      return { valid: false as const, reason: "Code épuisé" };
    if (promo.minOrderAmount != null && args.orderSubtotal < promo.minOrderAmount)
      return {
        valid: false as const,
        reason: `Minimum de commande: ${promo.minOrderAmount.toFixed(2)}€`,
      };

    // Time window check (happy hour)
    if (promo.timeWindow) {
      const nowParis = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" })
      );
      const hour = nowParis.getHours();
      const { startHour, endHour } = promo.timeWindow;
      if (hour < startHour || hour >= endHour) {
        const fmt = (h: number) => `${String(h).padStart(2, "0")}h`;
        return {
          valid: false as const,
          reason: `Disponible de ${fmt(startHour)} à ${fmt(endHour)}`,
        };
      }
    }

    // free_delivery
    if (promo.discountType === "free_delivery") {
      if (args.orderType === "pickup")
        return { valid: false as const, reason: "Valable uniquement pour la livraison" };
      return {
        valid: true as const,
        discountType: promo.discountType,
        discountValue: 0,
        discountAmount: 0,
        isFreeDelivery: true,
        description: promo.description,
      };
    }

    // percent_off_items
    if (promo.discountType === "percent_off_items") {
      const cats = promo.applicableCategoryIds ?? [];
      const eligibleSubtotal = (args.items ?? [])
        .filter((item) => item.categoryIds.some((c) => cats.includes(c)))
        .reduce((sum, item) => sum + item.price, 0);
      if (eligibleSubtotal <= 0)
        return { valid: false as const, reason: "Aucun article éligible dans votre panier" };
      const discountAmount = Math.min(
        Math.round((eligibleSubtotal * promo.discountValue) / 100 * 100) / 100,
        eligibleSubtotal,
      );
      return {
        valid: true as const,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        isFreeDelivery: false,
        applicableCategoryIds: cats,
        description: promo.description,
      };
    }

    // percent_off_specific_items
    if (promo.discountType === "percent_off_specific_items") {
      const ids = promo.applicableMenuItemIds ?? [];
      const eligibleSubtotal = (args.items ?? [])
        .filter((item) => ids.includes(item.menuItemId))
        .reduce((sum, item) => sum + item.price, 0);
      if (eligibleSubtotal <= 0)
        return { valid: false as const, reason: "Aucun article éligible dans votre panier" };
      const discountAmount = Math.min(
        Math.round((eligibleSubtotal * promo.discountValue) / 100 * 100) / 100,
        eligibleSubtotal,
      );
      return {
        valid: true as const,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
        isFreeDelivery: false,
        applicableMenuItemIds: ids,
        description: promo.description,
      };
    }

    // bogo_same: buy 2 same item, 1 free
    if (promo.discountType === "bogo_same") {
      const ids = promo.applicableMenuItemIds ?? [];
      const eligible = (args.items ?? []).filter(i => ids.length === 0 || ids.includes(i.menuItemId));
      const counts = new Map<string, { price: number; count: number }>();
      for (const item of eligible) {
        const e = counts.get(item.menuItemId);
        if (e) e.count++;
        else counts.set(item.menuItemId, { price: item.price, count: 1 });
      }
      let discountAmount = 0;
      counts.forEach((v) => { discountAmount += Math.floor(v.count / 2) * v.price; });
      if (discountAmount <= 0)
        return { valid: false as const, reason: "Ajoutez 2 articles identiques pour en avoir 1 offert" };
      return { valid: true as const, discountType: promo.discountType, discountValue: 0, discountAmount, isFreeDelivery: false, description: promo.description };
    }

    // bogo_gift: buy trigger item → gift item free
    if (promo.discountType === "bogo_gift") {
      const hasTrigger = (args.items ?? []).some(i => i.menuItemId === promo.bogoTriggerItemId);
      const giftItems = (args.items ?? []).filter(i => i.menuItemId === promo.bogoGiftItemId);
      if (!hasTrigger) return { valid: false as const, reason: "Ajoutez l'article déclencheur au panier" };
      if (giftItems.length === 0) return { valid: false as const, reason: "Ajoutez l'article offert au panier" };
      const discountAmount = Math.min(...giftItems.map(i => i.price));
      return { valid: true as const, discountType: promo.discountType, discountValue: 0, discountAmount, isFreeDelivery: false, description: promo.description };
    }

    // percentage / fixed
    const discountAmount =
      promo.discountType === "percentage"
        ? Math.min((args.orderSubtotal * promo.discountValue) / 100, args.orderSubtotal)
        : Math.min(promo.discountValue, args.orderSubtotal);

    return {
      valid: true as const,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      isFreeDelivery: false,
      description: promo.description,
    };
  },
});

// ─── CRUD mutations ───────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    adminToken: v.string(),
    code: v.string(),
    discountType: DISCOUNT_TYPE,
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUsageCount: v.optional(v.number()),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
    description: v.optional(v.string()),
    timeWindow: v.optional(v.object({ startHour: v.number(), endHour: v.number() })),
    applicableCategoryIds: v.optional(v.array(v.string())),
    applicableMenuItemIds: v.optional(v.array(v.string())),
    bogoTriggerItemId: v.optional(v.string()),
    bogoGiftItemId: v.optional(v.string()),
    requiresCode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const isCampaign = args.requiresCode === false;
    const normalizedCode = isCampaign
      ? `__campaign__${Date.now()}`
      : args.code.toUpperCase().trim();

    if (!isCampaign) {
      const existing = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q) => q.eq("code", normalizedCode))
        .first();
      if (existing) throw new Error("Ce code existe déjà");
    }

    return await ctx.db.insert("promoCodes", {
      code: normalizedCode,
      discountType: args.discountType,
      discountValue: ["free_delivery", "bogo_same", "bogo_gift"].includes(args.discountType) ? 0 : args.discountValue,
      minOrderAmount: args.minOrderAmount,
      maxUsageCount: args.maxUsageCount,
      usageCount: 0,
      active: args.active,
      expiresAt: args.expiresAt,
      description: args.description,
      timeWindow: args.timeWindow,
      applicableCategoryIds: args.applicableCategoryIds,
      applicableMenuItemIds: args.applicableMenuItemIds,
      bogoTriggerItemId: args.bogoTriggerItemId,
      bogoGiftItemId: args.bogoGiftItemId,
      requiresCode: args.requiresCode,
    });
  },
});

export const update = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("promoCodes"),
    code: v.string(),
    discountType: DISCOUNT_TYPE,
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUsageCount: v.optional(v.number()),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
    description: v.optional(v.string()),
    timeWindow: v.optional(v.object({ startHour: v.number(), endHour: v.number() })),
    applicableCategoryIds: v.optional(v.array(v.string())),
    applicableMenuItemIds: v.optional(v.array(v.string())),
    bogoTriggerItemId: v.optional(v.string()),
    bogoGiftItemId: v.optional(v.string()),
    requiresCode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const isCampaign = args.requiresCode === false;

    if (!isCampaign) {
      const normalizedCode = args.code.toUpperCase().trim();
      const existing = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q) => q.eq("code", normalizedCode))
        .first();
      if (existing && existing._id !== args.id) throw new Error("Ce code existe déjà");
      await ctx.db.patch(args.id, { code: normalizedCode });
    }

    await ctx.db.patch(args.id, {
      discountType: args.discountType,
      discountValue: ["free_delivery", "bogo_same", "bogo_gift"].includes(args.discountType) ? 0 : args.discountValue,
      minOrderAmount: args.minOrderAmount,
      maxUsageCount: args.maxUsageCount,
      active: args.active,
      expiresAt: args.expiresAt,
      description: args.description,
      timeWindow: args.timeWindow,
      applicableCategoryIds: args.applicableCategoryIds,
      applicableMenuItemIds: args.applicableMenuItemIds,
      bogoTriggerItemId: args.bogoTriggerItemId,
      bogoGiftItemId: args.bogoGiftItemId,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { adminToken: v.string(), id: v.id("promoCodes") },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { adminToken: v.string(), id: v.id("promoCodes"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.id, { active: args.active });
  },
});
