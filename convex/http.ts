import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ── Helpers ────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Vapi-Secret",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function options() {
  return new Response(null, { status: 204, headers: CORS });
}

// Simple shared secret check for write endpoints
function checkSecret(req: Request): Response | null {
  const secret = req.headers.get("X-Vapi-Secret");
  if (!process.env.VAPI_SECRET || secret !== process.env.VAPI_SECRET) {
    return json({ error: "Non autorisé" }, 401);
  }
  return null;
}

// ── GET /api/vapi/menu ─────────────────────────────────────────────────────
// VAPI calls this at the start of each call to read the live menu.

http.route({
  path: "/api/vapi/menu",
  method: "OPTIONS",
  handler: httpAction(async () => options()),
});

http.route({
  path: "/api/vapi/menu",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const items = await ctx.runQuery(api.menuItems.list, {});
      const simplified = items
        .filter((item: any) => item.active !== false && item.inStock !== false)
        .map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description ?? "",
          price: item.price,
          categories: item.categories ?? [],
        }));
      return json({ items: simplified });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }),
});

// ── POST /api/vapi/order ───────────────────────────────────────────────────
// VAPI calls this when the customer confirms their order.
//
// Expected body:
// {
//   "customer": { "firstName": "Jean", "lastName": "Dupont", "phone": "+33612345678" },
//   "type": "pickup" | "delivery",
//   "address": { "street": "...", "city": "...", "zipCode": "..." },  // delivery only
//   "items": [
//     { "menuItemId": "<id>", "name": "Margherita", "price": 10.50 }
//   ],
//   "note": "Sans oignons"   // optional, appended to last item instructions
// }

http.route({
  path: "/api/vapi/order",
  method: "OPTIONS",
  handler: httpAction(async () => options()),
});

http.route({
  path: "/api/vapi/order",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const denied = checkSecret(req);
    if (denied) return denied;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Corps de requête invalide" }, 400);
    }

    const { customer, type, address, items, note } = body;

    if (!customer?.firstName || !customer?.phone) {
      return json({ error: "Nom et téléphone du client requis" }, 400);
    }
    if (!type || !["pickup", "delivery"].includes(type)) {
      return json({ error: "Type de commande invalide (pickup ou delivery)" }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "Aucun article dans la commande" }, 400);
    }
    if (type === "delivery" && (!address?.street || !address?.city || !address?.zipCode)) {
      return json({ error: "Adresse de livraison incomplète" }, 400);
    }

    // Build order items — one entry per item (quantity handled by repetition)
    const orderItems = items.map((item: any) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      finalPrice: item.price,
    }));

    // Total computed from items (server will re-validate against DB)
    const totalPrice = orderItems.reduce((sum: number, i: any) => sum + i.price, 0);

    try {
      const orderId = await ctx.runMutation(api.mutations.createOrder, {
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName ?? "",
          email: `tel.${customer.phone.replace(/\D/g, "")}@commande-vapi.fr`,
          phone: customer.phone,
        },
        type,
        address: type === "delivery" ? {
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          instructions: note ?? undefined,
        } : undefined,
        scheduledTime: "asap",
        paymentMethod: "cash",
        paymentStatus: "unpaid",
        items: orderItems,
        totalPrice,
      });

      return json({ success: true, orderId });
    } catch (e: any) {
      return json({ error: e.message }, 400);
    }
  }),
});

export default http;
