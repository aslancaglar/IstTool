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
    dineInEnabled: v.optional(v.boolean()),
    minimumAdvanceNotice: v.optional(v.number()),
    defaultPrepTimeMinutes: v.optional(v.number()),
    deliveryFees: v.optional(v.array(v.object({
      postalCode: v.string(),
      price: v.number(),
      name: v.optional(v.string()),
      freeDeliveryThreshold: v.optional(v.number()),
      deliveryTimeMinutes: v.optional(v.number()),
    }))),
    defaultDeliveryFee: v.optional(v.number()),
    freeDeliveryThreshold: v.optional(v.number()),
    galleryEnabled: v.optional(v.boolean()),
    reviewsEnabled: v.optional(v.boolean()),
    cashEnabled: v.optional(v.boolean()),
    stripeEnabled: v.optional(v.boolean()),
    printingEnabled: v.optional(v.boolean()),
    printingProvider: v.optional(v.union(v.literal("printnode"), v.literal("qz"))),
    printNodeApiKey: v.optional(v.string()),
    printerPickupId: v.optional(v.number()),
    printerDeliveryId: v.optional(v.number()),
    qzPrinterPickupName: v.optional(v.string()),
    qzPrinterDeliveryName: v.optional(v.string()),
    legalName: v.optional(v.string()),
    legalForm: v.optional(v.string()),
    siret: v.optional(v.string()),
    rcsCity: v.optional(v.string()),
    rcsNumber: v.optional(v.string()),
    shareCapital: v.optional(v.number()),
    tvaIntraNumber: v.optional(v.string()),
    legalAddress: v.optional(v.string()),
    invoicePrefix: v.optional(v.string()),
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
        dineInEnabled: args.dineInEnabled,
        minimumAdvanceNotice: args.minimumAdvanceNotice,
        defaultPrepTimeMinutes: args.defaultPrepTimeMinutes,
        deliveryFees: args.deliveryFees,
        defaultDeliveryFee: args.defaultDeliveryFee,
        freeDeliveryThreshold: args.freeDeliveryThreshold,
        galleryEnabled: args.galleryEnabled,
        reviewsEnabled: args.reviewsEnabled,
        cashEnabled: args.cashEnabled,
        stripeEnabled: args.stripeEnabled,
        printingEnabled: args.printingEnabled,
        printingProvider: args.printingProvider,
        printNodeApiKey: args.printNodeApiKey,
        printerPickupId: args.printerPickupId,
        printerDeliveryId: args.printerDeliveryId,
        qzPrinterPickupName: args.qzPrinterPickupName,
        qzPrinterDeliveryName: args.qzPrinterDeliveryName,
        legalName: args.legalName,
        legalForm: args.legalForm,
        siret: args.siret,
        rcsCity: args.rcsCity,
        rcsNumber: args.rcsNumber,
        shareCapital: args.shareCapital,
        tvaIntraNumber: args.tvaIntraNumber,
        legalAddress: args.legalAddress,
        invoicePrefix: args.invoicePrefix,
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
        dineInEnabled: args.dineInEnabled ?? true,
        minimumAdvanceNotice: args.minimumAdvanceNotice ?? 30,
        defaultPrepTimeMinutes: args.defaultPrepTimeMinutes ?? 25,
        deliveryFees: args.deliveryFees,
        defaultDeliveryFee: args.defaultDeliveryFee ?? 0,
        freeDeliveryThreshold: args.freeDeliveryThreshold ?? 0,
        galleryEnabled: args.galleryEnabled ?? true,
        reviewsEnabled: args.reviewsEnabled ?? true,
        cashEnabled: args.cashEnabled ?? true,
        stripeEnabled: args.stripeEnabled ?? true,
        printingEnabled: args.printingEnabled,
        printingProvider: args.printingProvider,
        printNodeApiKey: args.printNodeApiKey,
        printerPickupId: args.printerPickupId,
        printerDeliveryId: args.printerDeliveryId,
        qzPrinterPickupName: args.qzPrinterPickupName,
        qzPrinterDeliveryName: args.qzPrinterDeliveryName,
        legalName: args.legalName,
        legalForm: args.legalForm,
        siret: args.siret,
        rcsCity: args.rcsCity,
        rcsNumber: args.rcsNumber,
        shareCapital: args.shareCapital,
        tvaIntraNumber: args.tvaIntraNumber,
        legalAddress: args.legalAddress,
        invoicePrefix: args.invoicePrefix ?? "F{YYYY}-",
      });
      return id;
    }
  },
});

export const toggleOrderingAvailability = mutation({
  args: {
    adminToken: v.string(),
    pickupEnabled: v.boolean(),
    deliveryEnabled: v.boolean(),
    dineInEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const existing = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (!existing) {
      throw new Error("Restaurant info not found");
    }

    await ctx.db.patch(existing._id, {
      pickupEnabled: args.pickupEnabled,
      deliveryEnabled: args.deliveryEnabled,
      dineInEnabled: args.dineInEnabled,
    });
  },
});
