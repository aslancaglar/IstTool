import { mutation, action, query, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";
import { buildOrderReceipt, type OrderForReceipt } from "./lib/escpos";

const PRINTNODE_BASE = "https://api.printnode.com";

function authHeader(apiKey: string): string {
  return "Basic " + btoa(`${apiKey}:`);
}

// Internal: validate admin AND return the API key in one round-trip.
// Throws on bad/missing admin token.
export const getApiKeyForAdminInternal = internalQuery({
  args: { adminToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return info?.printNodeApiKey ?? null;
  },
});

// Admin: list printers from PrintNode for the settings UI.
// Accepts an optional `apiKey` so the user can test BEFORE saving to DB.
export const listPrinters = action({
  args: { adminToken: v.string(), apiKey: v.optional(v.string()) },
  handler: async (
    ctx,
    args,
  ): Promise<{ printers: Array<{ id: number; name: string; state: string }>; error?: string }> => {
    // Use the key passed from the form; fall back to the saved one in DB.
    let apiKey = args.apiKey?.trim() || null;
    if (!apiKey) {
      apiKey = await ctx.runQuery(internal.printing.getApiKeyForAdminInternal, {
        adminToken: args.adminToken,
      });
    } else {
      // Still validate admin even when key comes from the form
      await ctx.runQuery(internal.printing.getApiKeyForAdminInternal, {
        adminToken: args.adminToken,
      });
    }
    if (!apiKey) {
      return { printers: [], error: "Aucune clé API configurée." };
    }

    try {
      const res = await fetch(`${PRINTNODE_BASE}/printers`, {
        headers: { Authorization: authHeader(apiKey) },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("PrintNode listPrinters failed:", res.status, body);
        if (res.status === 401 || res.status === 403) {
          return { printers: [], error: `Clé API invalide (HTTP ${res.status}). Vérifiez votre clé sur printnode.com.` };
        }
        return { printers: [], error: `Erreur PrintNode (HTTP ${res.status}): ${body.slice(0, 120)}` };
      }
      const data = (await res.json()) as Array<any>;
      const printers = data.map((p) => ({
        id: p.id as number,
        name: p.computer?.name ? `${p.name} (${p.computer.name})` : p.name,
        state: (p.state as string) ?? "unknown",
      }));
      return { printers };
    } catch (e: any) {
      console.error("PrintNode listPrinters error:", e);
      return { printers: [], error: `Erreur réseau: ${e.message ?? e}` };
    }
  },
});

// Admin: schedule a reprint of an existing order.
export const reprintOrder = mutation({
  args: { adminToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.scheduler.runAfter(0, internal.printing.printOrderReceipt, {
      orderId: args.orderId,
      manual: true,
    });
  },
});

// Internal: render a receipt and ship it to PrintNode.
// Fire-and-forget — never throws (orders must succeed even if printing fails).
// When the provider is "qz", this is a no-op; the admin browser handles printing
// via the QZ Tray websocket on the local machine.
export const printOrderReceipt = internalAction({
  args: { orderId: v.id("orders"), manual: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.queries.getRestaurantInfoInternal, {});
    if (!info) return;
    // printingEnabled only gates automatic prints — manual reprints always go through
    if (!args.manual && !info.printingEnabled) return;

    // QZ Tray is browser-side; the admin dashboard auto-print loop handles it.
    if (info.printingProvider === "qz") return;

    if (!info.printNodeApiKey) return;

    const order = await ctx.runQuery(internal.queries.getEnrichedOrderInternal, {
      orderId: args.orderId,
    });
    if (!order) return;

    const printerId = order.type === "delivery" ? info.printerDeliveryId : info.printerPickupId;
    if (!printerId) {
      console.warn(`No printer configured for order type "${order.type}"`);
      return;
    }

    const content = buildOrderReceipt(
      order as unknown as OrderForReceipt,
      { address: info.address, phone: info.phone },
    );

    try {
      const res = await fetch(`${PRINTNODE_BASE}/printjobs`, {
        method: "POST",
        headers: {
          Authorization: authHeader(info.printNodeApiKey),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          printerId,
          title: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
          contentType: "raw_base64",
          content,
          source: "RestoIstanbul",
        }),
      });
      if (!res.ok) {
        console.error("PrintNode printjob failed:", res.status, await res.text());
      }
    } catch (e) {
      console.error("PrintNode printjob error:", e);
    }
  },
});

// QZ Tray support — browser-driven printing.

// Atomic claim: returns { claimed: true } once per order. Used by the auto-print
// loop in /admin/orders so two open tabs don't both send the same receipt.
export const markOrderPrinted = mutation({
  args: { orderId: v.id("orders"), adminToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) return { claimed: false };
    if (order.printedAt) return { claimed: false };
    await ctx.db.patch(args.orderId, { printedAt: Date.now() });
    return { claimed: true };
  },
});

// Returns the ESC/POS base64 payload + chosen QZ printer name for one order.
// The admin browser fetches this then sends to QZ Tray over the local websocket.
export const getReceiptPayload = query({
  args: { orderId: v.id("orders"), adminToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!info) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Reuse the same enrichment that the PrintNode action uses.
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

// A short test receipt admins can fire from the settings page.
export const getTestReceiptPayload = query({
  args: { adminToken: v.string(), target: v.union(v.literal("pickup"), v.literal("delivery")) },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const info = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!info) return null;

    const printerName = args.target === "delivery"
      ? info.qzPrinterDeliveryName
      : info.qzPrinterPickupName;

    // ESC @ (init) + a few lines + ESC d 4 (feed) + GS V 1 (partial cut)
    const ESC = 0x1b, GS = 0x1d, LF = 0x0a;
    const text = `Test d'impression\n${info.address ?? ""}\n${info.phone ?? ""}\nOK !\n`;
    const bytes: number[] = [ESC, 0x40];
    for (const ch of text) bytes.push(ch.charCodeAt(0));
    bytes.push(LF, LF, LF, LF, GS, 0x56, 0x01);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const base64 = btoa(bin);

    return { printerName: printerName ?? null, base64 };
  },
});

// Local helper that mirrors getEnrichedOrderInternal but inside this file's
// query context (since query handlers can't ctx.runQuery internal queries).
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
