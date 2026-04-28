import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, requireUserSession } from "./lib/auth";

export const createOrder = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    customer: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    type: v.union(v.literal("pickup"), v.literal("delivery")),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      zipCode: v.string(),
      instructions: v.optional(v.string()),
    })),
    scheduledTime: v.string(),
    paymentMethod: v.union(v.literal("stripe"), v.literal("cash")),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid"), v.literal("failed")),
    stripePaymentIntentId: v.optional(v.string()),
    items: v.array(v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedSize: v.optional(v.union(
        v.literal("seul"),
        v.literal("frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    })),
    totalPrice: v.number(),
    promoCode: v.optional(v.string()),
    deliveryFee: v.optional(v.number()),
    itemCategoryIds: v.optional(v.array(v.object({
      menuItemId: v.string(),
      categoryIds: v.array(v.string()),
    }))),
    appliedCampaignIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const sessionUser = args.sessionToken
      ? await requireUserSession(ctx, args.sessionToken)
      : null;

    // ── Server-side price validation ──────────────────────────────
    const verifiedItems = [];
    let computedTotal = 0;

    for (const item of args.items) {
      // Look up the actual menu item from the database
      const menuItem = await ctx.db
        .query("menuItems")
        .filter((q) => q.eq(q.field("_id"), item.menuItemId))
        .first();

      if (!menuItem) {
        throw new Error(`Article introuvable: ${item.name}`);
      }

      if (menuItem.active === false) {
        throw new Error(`Article indisponible: ${menuItem.name}`);
      }

      // Calculate the verified price from the DB
      let verifiedPrice = menuItem.price;

      // Add topping surcharges if any
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        for (const toppingGroup of item.selectedToppings) {
          for (const toppingId of toppingGroup.toppingIds) {
            const topping = await ctx.db
              .query("toppings")
              .filter((q) => q.eq(q.field("toppingId"), toppingId))
              .first();
            
            if (!topping || topping.active === false) {
              throw new Error(`Garniture indisponible: ${toppingId}`);
            }

            if (topping.menuItemId) {
              const linkedItem = await ctx.db.get(topping.menuItemId);
              if (!linkedItem || linkedItem.inStock === false) {
                throw new Error(`Garniture indisponible (rupture): ${topping.name}`);
              }
              verifiedPrice += linkedItem.price;
            } else if (topping.price) {
              verifiedPrice += topping.price;
            }
          }
        }
      }

      // Verify the client-sent price matches (allow €0.02 tolerance for floating point)
      if (Math.abs(verifiedPrice - item.finalPrice) > 0.02) {
        throw new Error(
          `Prix incorrect pour ${menuItem.name}: attendu ${verifiedPrice.toFixed(2)}€, reçu ${item.finalPrice.toFixed(2)}€`
        );
      }

      computedTotal += verifiedPrice;
      verifiedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        selectedToppings: item.selectedToppings,
        finalPrice: verifiedPrice,
      });
    }

    // ── Campaign (automatic) validation ──────────────────────────
    let campaignDiscount = 0;
    let campaignFreeDelivery = false;

    if (args.appliedCampaignIds && args.appliedCampaignIds.length > 0) {
      const catMap = new Map((args.itemCategoryIds ?? []).map((x) => [x.menuItemId, x.categoryIds]));
      for (const campaignId of args.appliedCampaignIds) {
        const campaign = await ctx.db
          .query("promoCodes")
          .filter((q) => q.eq(q.field("_id"), campaignId))
          .first();
        if (!campaign || !campaign.active || campaign.requiresCode !== false) continue;
        if (campaign.expiresAt && Date.now() > campaign.expiresAt) continue;
        if (campaign.minOrderAmount != null && computedTotal < campaign.minOrderAmount) continue;
        if (campaign.timeWindow) {
          const nowParis = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
          const hour = nowParis.getHours();
          if (hour < campaign.timeWindow.startHour || hour >= campaign.timeWindow.endHour) continue;
        }
        if (campaign.discountType === "free_delivery") {
          campaignFreeDelivery = true;
        } else if (campaign.discountType === "percent_off_items") {
          const cats = campaign.applicableCategoryIds ?? [];
          const eligibleSubtotal = verifiedItems
            .filter((item) => (catMap.get(item.menuItemId) ?? []).some((c: string) => cats.includes(c)))
            .reduce((sum, item) => sum + item.finalPrice, 0);
          campaignDiscount += Math.min(
            Math.round((eligibleSubtotal * campaign.discountValue) / 100 * 100) / 100,
            eligibleSubtotal,
          );
        } else if (campaign.discountType === "percent_off_specific_items") {
          const ids = campaign.applicableMenuItemIds ?? [];
          const eligibleSubtotal = verifiedItems
            .filter((item) => ids.includes(item.menuItemId))
            .reduce((sum, item) => sum + item.finalPrice, 0);
          campaignDiscount += Math.min(
            Math.round((eligibleSubtotal * campaign.discountValue) / 100 * 100) / 100,
            eligibleSubtotal,
          );
        } else if (campaign.discountType === "bogo_same") {
          const ids = campaign.applicableMenuItemIds ?? [];
          const eligible = verifiedItems.filter(i => ids.length === 0 || ids.includes(i.menuItemId));
          const counts = new Map<string, { price: number; count: number }>();
          for (const item of eligible) {
            const e = counts.get(item.menuItemId);
            if (e) e.count++;
            else counts.set(item.menuItemId, { price: item.finalPrice, count: 1 });
          }
          counts.forEach((g) => { campaignDiscount += Math.floor(g.count / 2) * g.price; });
        } else if (campaign.discountType === "bogo_gift") {
          const hasTrigger = verifiedItems.some(i => i.menuItemId === campaign.bogoTriggerItemId);
          const giftItems = verifiedItems.filter(i => i.menuItemId === campaign.bogoGiftItemId);
          if (hasTrigger && giftItems.length > 0) {
            campaignDiscount += Math.min(...giftItems.map(i => i.finalPrice));
          }
        } else if (campaign.discountType === "percentage") {
          campaignDiscount += Math.min((computedTotal * campaign.discountValue) / 100, computedTotal);
        } else if (campaign.discountType === "fixed") {
          campaignDiscount += Math.min(campaign.discountValue, computedTotal);
        }
      }
      campaignDiscount = Math.round(campaignDiscount * 100) / 100;
    }
    // ── End campaign validation ───────────────────────────────────

    // ── Promo code validation ─────────────────────────────────────
    let discountAmount = 0;
    let appliedPromoCode: string | undefined;
    let promoUsageCount: number | undefined;
    let promoId: string | undefined;

    if (args.promoCode) {
      const normalizedCode = args.promoCode.toUpperCase().trim();
      const promo = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q) => q.eq("code", normalizedCode))
        .first();

      if (!promo || !promo.active) throw new Error("Code promo invalide ou inactif.");
      if (promo.expiresAt && Date.now() > promo.expiresAt) throw new Error("Code promo expiré.");
      if (promo.maxUsageCount != null && promo.usageCount >= promo.maxUsageCount) throw new Error("Code promo épuisé.");
      if (promo.minOrderAmount != null && computedTotal < promo.minOrderAmount) throw new Error(`Montant minimum requis: ${promo.minOrderAmount.toFixed(2)}€`);

      // Time window (happy hour) re-check
      if (promo.timeWindow) {
        const nowParis = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
        const hour = nowParis.getHours();
        if (hour < promo.timeWindow.startHour || hour >= promo.timeWindow.endHour) {
          const fmt = (h: number) => `${String(h).padStart(2, "0")}h`;
          throw new Error(`Code valable de ${fmt(promo.timeWindow.startHour)} à ${fmt(promo.timeWindow.endHour)}`);
        }
      }

      if (promo.discountType === "free_delivery") {
        if (args.type === "pickup") throw new Error("Code valable uniquement pour la livraison.");
        discountAmount = args.deliveryFee ?? 0;
      } else if (promo.discountType === "percent_off_items") {
        const cats = promo.applicableCategoryIds ?? [];
        const catMap = new Map((args.itemCategoryIds ?? []).map((x) => [x.menuItemId, x.categoryIds]));
        const eligibleSubtotal = verifiedItems
          .filter((item) => (catMap.get(item.menuItemId) ?? []).some((c) => cats.includes(c)))
          .reduce((sum, item) => sum + item.finalPrice, 0);
        discountAmount = Math.min(
          Math.round((eligibleSubtotal * promo.discountValue) / 100 * 100) / 100,
          eligibleSubtotal,
        );
      } else if (promo.discountType === "percent_off_specific_items") {
        const ids = promo.applicableMenuItemIds ?? [];
        const eligibleSubtotal = verifiedItems
          .filter((item) => ids.includes(item.menuItemId))
          .reduce((sum, item) => sum + item.finalPrice, 0);
        discountAmount = Math.min(
          Math.round((eligibleSubtotal * promo.discountValue) / 100 * 100) / 100,
          eligibleSubtotal,
        );
      } else if (promo.discountType === "bogo_same") {
        const ids = promo.applicableMenuItemIds ?? [];
        const eligible = verifiedItems.filter(i => ids.length === 0 || ids.includes(i.menuItemId));
        const counts = new Map<string, { price: number; count: number }>();
        for (const item of eligible) {
          const e = counts.get(item.menuItemId);
          if (e) e.count++;
          else counts.set(item.menuItemId, { price: item.finalPrice, count: 1 });
        }
        counts.forEach((g) => { discountAmount += Math.floor(g.count / 2) * g.price; });
      } else if (promo.discountType === "bogo_gift") {
        const hasTrigger = verifiedItems.some(i => i.menuItemId === promo.bogoTriggerItemId);
        const giftItems = verifiedItems.filter(i => i.menuItemId === promo.bogoGiftItemId);
        if (hasTrigger && giftItems.length > 0) {
          discountAmount = Math.min(...giftItems.map(i => i.finalPrice));
        }
      } else {
        discountAmount = promo.discountType === "percentage"
          ? Math.min((computedTotal * promo.discountValue) / 100, computedTotal)
          : Math.min(promo.discountValue, computedTotal);
        discountAmount = Math.round(discountAmount * 100) / 100;
      }

      appliedPromoCode = normalizedCode;
      promoUsageCount = promo.usageCount;
      promoId = promo._id;
    }
    // ── End promo validation ──────────────────────────────────────

    // Verify total price (allow tolerance for delivery fee which is validated separately)
    if (Math.abs(computedTotal - args.totalPrice) > 0.02 && args.type === "pickup") {
      throw new Error("Le total de la commande ne correspond pas aux prix du menu.");
    }
    // ── End price validation ──────────────────────────────────────

    const totalDiscountAmount = discountAmount + campaignDiscount;
    const effectiveDeliveryFee = campaignFreeDelivery ? 0 : (args.deliveryFee ?? 0);

    const finalTotal = args.type === "pickup"
      ? Math.max(0, computedTotal - totalDiscountAmount)
      : Math.max(0, computedTotal + effectiveDeliveryFee - totalDiscountAmount);

    const orderId = await ctx.db.insert("orders", {
      userId: sessionUser?.user._id,
      customer: args.customer,
      type: args.type,
      address: args.address,
      scheduledTime: args.scheduledTime,
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus,
      stripePaymentIntentId: args.stripePaymentIntentId,
      items: verifiedItems,
      totalPrice: finalTotal,
      promoCode: appliedPromoCode,
      discountAmount: totalDiscountAmount > 0 ? totalDiscountAmount : undefined,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Increment promo usage count
    if (promoId && promoUsageCount != null) {
      await ctx.db.patch(promoId as any, { usageCount: promoUsageCount + 1 });
    }
    return orderId;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid"), v.literal("failed")),
    stripePaymentIntentId: v.optional(v.string()),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.orderId, {
      paymentStatus: args.paymentStatus,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const addItemToOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
    item: v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedSize: v.optional(v.union(
        v.literal("seul"),
        v.literal("frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = [...order.items, args.item];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const removeItemFromOrder = mutation({
  args: {
    orderId: v.id("orders"),
    itemIndex: v.number(),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = order.items.filter((_, index) => index !== args.itemIndex);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivering"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "completed" && order.paymentMethod === "cash") {
      updates.paymentStatus = "paid";
    }

    await ctx.db.patch(args.orderId, updates);
    return args.orderId;
  },
});

export const clearOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.orderId, {
      items: [],
      totalPrice: 0,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.delete(args.orderId);
  },
});
