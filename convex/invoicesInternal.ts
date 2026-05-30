import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, requireUserSession } from "./lib/auth";

// Internal query: auth + load enriched order + restaurant info.
// Called by the Node action in convex/invoices.ts. Kept in its own (non-"use node")
// file because mutations/queries cannot live in Node-runtime files.
export const prepareInvoiceData = internalQuery({
  args: {
    orderId: v.id("orders"),
    adminToken: v.optional(v.string()),
    userToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Commande introuvable");

    if (args.adminToken) {
      await requireAdminSession(ctx, args.adminToken);
    } else if (args.userToken) {
      const { user } = await requireUserSession(ctx, args.userToken);
      if (order.userId !== user._id) {
        throw new Error("Unauthorized");
      }
    } else {
      throw new Error("Unauthorized");
    }

    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!info) throw new Error("Configuration restaurant introuvable");

    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        let menuItem = await ctx.db
          .query("menuItems")
          .filter((q) => q.eq(q.field("_id"), item.menuItemId as any))
          .first();
        if (!menuItem) {
          menuItem = await ctx.db
            .query("menuItems")
            .filter((q) => q.eq(q.field("name"), item.name))
            .first();
        }
        const itemTva = menuItem?.tvaPercent ?? 10;

        const toppings: Array<{ name: string; price: number; tvaPercent: number }> = [];
        for (const group of item.selectedToppings ?? []) {
          for (const id of group.toppingIds) {
            const t = await ctx.db
              .query("toppings")
              .filter((q) => q.eq(q.field("toppingId"), id))
              .first();
            if (!t) {
              toppings.push({ name: id, price: 0, tvaPercent: itemTva });
              continue;
            }
            if (t.menuItemId) {
              const linked = await ctx.db.get(t.menuItemId);
              if (linked) {
                toppings.push({
                  name: t.name || linked.name,
                  price: t.specialPrice !== undefined ? t.specialPrice : linked.price,
                  tvaPercent: t.tvaPercent ?? linked.tvaPercent ?? itemTva,
                });
                continue;
              }
            }
            toppings.push({
              name: t.name,
              price: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0),
              tvaPercent: t.tvaPercent ?? itemTva,
            });
          }
        }

        return {
          name: item.name,
          price: item.price,
          finalPrice: item.finalPrice,
          isFree: item.isFree,
          tvaPercent: itemTva,
          toppings,
        };
      }),
    );

    // Billing address resolution:
    //   delivery → use order.address (always present)
    //   pickup / dine_in → fall back to the linked user's profile address
    let billingAddress: { street: string; city: string; zipCode: string } | null = null;
    if (order.address) {
      billingAddress = {
        street: order.address.street,
        city: order.address.city,
        zipCode: order.address.zipCode,
      };
    } else if (order.userId) {
      const u = await ctx.db.get(order.userId);
      if (u && u.street && u.city && u.zipCode) {
        billingAddress = { street: u.street, city: u.city, zipCode: u.zipCode };
      }
    }

    return {
      order: {
        _id: order._id,
        customer: order.customer,
        type: order.type,
        address: order.address,
        billingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: enrichedItems,
        totalPrice: order.totalPrice,
        deliveryFee: order.deliveryFee,
        promoCode: order.promoCode,
        discountAmount: order.discountAmount,
        createdAt: order.createdAt,
      },
      info: {
        legalName: info.legalName,
        legalForm: info.legalForm,
        siret: info.siret,
        rcsCity: info.rcsCity,
        rcsNumber: info.rcsNumber,
        shareCapital: info.shareCapital,
        tvaIntraNumber: info.tvaIntraNumber,
        legalAddress: info.legalAddress ?? info.address,
        phone: info.phone,
        email: info.email,
      },
    };
  },
});

// Atomic + idempotent invoice numbering with yearly reset.
export const assignInvoiceNumber = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Commande introuvable");

    if (order.invoiceNumber) {
      return {
        invoiceNumber: order.invoiceNumber,
        invoicedAt: order.invoicedAt ?? order.createdAt,
      };
    }

    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!info) throw new Error("Configuration restaurant introuvable");

    const now = Date.now();
    const year = new Date(now).getFullYear();

    const previousCounter =
      info.invoiceCounterYear === year ? info.invoiceCounter ?? 0 : 0;
    const newCounter = previousCounter + 1;

    const prefixTemplate = info.invoicePrefix ?? "F{YYYY}-";
    const prefix = prefixTemplate.replace(/\{YYYY\}/g, String(year));
    const invoiceNumber = `${prefix}${String(newCounter).padStart(6, "0")}`;

    await ctx.db.patch(info._id, {
      invoiceCounter: newCounter,
      invoiceCounterYear: year,
    });
    await ctx.db.patch(args.orderId, {
      invoiceNumber,
      invoicedAt: now,
    });

    return { invoiceNumber, invoicedAt: now };
  },
});
