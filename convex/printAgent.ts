// Endpoints for the standalone print-agent (Node process running on the shop
// machine). Authenticated via a shared secret in Convex env var
// PRINT_AGENT_TOKEN — independent of admin sessions so the agent can run
// indefinitely without re-login.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { buildOrderReceipt, type OrderForReceipt } from "./lib/escpos";

function requireAgent(token: string) {
  const expected = process.env.PRINT_AGENT_TOKEN;
  if (!expected) {
    throw new Error("PRINT_AGENT_TOKEN not configured on Convex deployment");
  }
  if (token !== expected) {
    throw new Error("Invalid print-agent token");
  }
}

// Reactive subscription target. Returns IDs of pending+unprinted orders so the
// agent only re-runs print work when this list changes.
export const listUnprintedOrders = query({
  args: { agentToken: v.string() },
  handler: async (ctx, args) => {
    requireAgent(args.agentToken);
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.filter((o) => !o.printedAt).map((o) => o._id);
  },
});

// Atomic claim. Returns { claimed: true } exactly once per order; subsequent
// callers (or a stuck/crashed agent that retries) get { claimed: false }.
export const claim = mutation({
  args: { agentToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    requireAgent(args.agentToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) return { claimed: false };
    if (order.printedAt) return { claimed: false };
    await ctx.db.patch(args.orderId, { printedAt: Date.now() });
    return { claimed: true };
  },
});

// Renders the receipt and returns the base64 ESC/POS bytes + chosen QZ printer.
export const getPayload = query({
  args: { agentToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    requireAgent(args.agentToken);

    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!info) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const enriched = await enrichOrderForReceipt(ctx, order);
    const printerName = order.type === "delivery"
      ? info.qzPrinterDeliveryName
      : info.qzPrinterPickupName;

    const base64 = buildOrderReceipt(
      enriched as unknown as OrderForReceipt,
      { address: info.address, phone: info.phone },
    );

    return {
      orderId: args.orderId,
      printerName: printerName ?? null,
      base64,
    };
  },
});

// Local enrichment helper (mirror of the one in printing.ts — kept here to
// avoid cross-file imports of internal helpers).
async function enrichOrderForReceipt(ctx: any, order: any) {
  const enrichedItems = await Promise.all(order.items.map(async (item: any) => {
    let menuItem = await ctx.db
      .query("menuItems")
      .filter((q: any) => q.eq(q.field("_id"), item.menuItemId))
      .first();
    if (!menuItem) {
      menuItem = await ctx.db
        .query("menuItems")
        .filter((q: any) => q.eq(q.field("name"), item.name))
        .first();
    }
    const itemTva = menuItem?.tvaPercent ?? 10;

    if (!item.selectedToppings) return { ...item, tvaPercent: itemTva };

    const enrichedToppings = await Promise.all(item.selectedToppings.map(async (group: any) => {
      const details = await Promise.all(group.toppingIds.map(async (id: string) => {
        const t = await ctx.db.query("toppings").filter((q: any) => q.eq(q.field("toppingId"), id)).first();
        if (!t) return { name: id, price: 0, tvaPercent: itemTva };
        if (t.menuItemId) {
          const linked = await ctx.db.get(t.menuItemId);
          if (linked) {
            return {
              name: t.name || linked.name,
              price: t.specialPrice !== undefined ? t.specialPrice : linked.price,
              tvaPercent: t.tvaPercent ?? linked.tvaPercent ?? itemTva,
            };
          }
        }
        return {
          name: t.name,
          price: t.specialPrice !== undefined ? t.specialPrice : (t.price ?? 0),
          tvaPercent: t.tvaPercent ?? itemTva,
        };
      }));
      return {
        ...group,
        toppingNames: details.map((d) => d.name),
        toppingPrices: details.map((d) => d.price),
        toppingTvas: details.map((d) => d.tvaPercent),
      };
    }));

    return { ...item, tvaPercent: itemTva, selectedToppings: enrichedToppings };
  }));

  return { ...order, items: enrichedItems };
}
