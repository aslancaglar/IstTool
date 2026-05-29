import { mutation, action, internalAction, internalQuery } from "./_generated/server";
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
export const printOrderReceipt = internalAction({
  args: { orderId: v.id("orders"), manual: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.queries.getRestaurantInfoInternal, {});
    if (!info?.printNodeApiKey) return;
    // printingEnabled only gates automatic prints — manual reprints always go through
    if (!args.manual && !info.printingEnabled) return;

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
          source: "MondoPizza",
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
