import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ── Helpers ────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
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

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// Strip size suffixes like "33 CM", "29cm", "33cm" that the LLM sometimes appends to the name
const stripSize = (s: string) =>
  s.replace(/\s*(29\s*cm|33\s*cm)\s*/gi, "").trim();

// ── GET /api/vapi/menu ─────────────────────────────────────────────────────

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

// ── GET /api/vapi/menu/full ────────────────────────────────────────────────

http.route({
  path: "/api/vapi/menu/full",
  method: "OPTIONS",
  handler: httpAction(async () => options()),
});

http.route({
  path: "/api/vapi/menu/full",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const items = await ctx.runQuery(api.menuItems.list, {});
      const result = await Promise.all(
        items
          .filter((item: any) => item.active !== false && item.inStock !== false)
          .map(async (item: any) => {
            const toppingCategories = await ctx.runQuery(api.queries.getToppingsForMenuItem, { menuItemId: item._id });
            return {
              id: item._id,
              name: item.name,
              description: item.description ?? "",
              price: item.price,
              categories: item.categories ?? [],
              toppingCategories,
            };
          })
      );
      return json({ items: result });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  }),
});

// ── POST /api/vapi/order ───────────────────────────────────────────────────
// Utilisé par Retell AI (body.args) et VAPI (body direct).
//
// Structure attendue pour chaque item :
// {
//   "menuItemId": "...",   ← optionnel si name est fourni
//   "name": "Margherita",
//   "price": 8.50,         ← prix de base
//   "finalPrice": 13.00,   ← prix final (après taille + suppléments)
//   "supplements": "33cm, Extra Mozzarella"  ← texte libre, affiché dans l'admin
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
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Corps de requête invalide" }, 400);
    }

    // Retell AI wrappe les args dans body.args (parfois sérialisé en string JSON)
    const rawArgs = body.args ?? body;
    const data = typeof rawArgs === 'string' ? (() => { try { return JSON.parse(rawArgs); } catch { return {}; } })() : rawArgs;

    const firstName = data.firstName ?? data.customer?.firstName;
    const lastName  = data.lastName  ?? data.customer?.lastName ?? "";
    const phone     = data.phone     ?? data.customer?.phone;
    const orderType = data.orderType ?? data.type;
    const street    = data.street    ?? data.address?.street;
    const city      = data.city      ?? data.address?.city;
    const zipCode   = data.zipCode   ?? data.address?.zipCode;
    const items     = data.items;
    const note      = data.note ?? "";

    if (!firstName || !phone) {
      return json({ error: "Prénom et téléphone requis" }, 400);
    }
    if (!orderType || !["pickup", "delivery"].includes(orderType)) {
      return json({ error: "Type invalide: pickup ou delivery" }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "Aucun article dans la commande" }, 400);
    }
    if (orderType === "delivery" && (!street || !city || !zipCode)) {
      return json({ error: "Adresse de livraison incomplète" }, 400);
    }

    const type = orderType as "pickup" | "delivery";

    // Résolution des articles : menuItemId prioritaire, sinon fuzzy match par nom
    const allMenuItems = await ctx.runQuery(api.menuItems.list, {});

    const orderItems: any[] = [];
    for (const item of items) {
      // Résolution de l'article par ID ou fuzzy match par nom
      let resolved = item.menuItemId
        ? allMenuItems.find((m: any) => m._id === item.menuItemId)
        : null;

      if (!resolved && item.name) {
        const needle = normalize(item.name);
        const needleClean = normalize(stripSize(item.name));
        resolved =
          allMenuItems.find((m: any) => normalize(m.name) === needle) ??
          allMenuItems.find((m: any) => normalize(m.name) === needleClean) ??
          allMenuItems.find((m: any) =>
            normalize(m.name).includes(needle) || needle.includes(normalize(m.name))
          ) ??
          allMenuItems.find((m: any) =>
            normalize(m.name).includes(needleClean) || needleClean.includes(normalize(m.name))
          );
      }

      if (!resolved) {
        return json({ error: `Article introuvable: ${item.name}` }, 400);
      }

      // Résolution des toppings (taille + suppléments)
      const toppingIds: string[] = Array.isArray(item.toppingIds) ? item.toppingIds : [];
      let selectedToppings: { categoryId: string; toppingIds: string[] }[] = [];
      let toppingPriceTotal = 0;
      const toppingNames: string[] = [];

      if (toppingIds.length > 0) {
        const toppings = await ctx.runQuery(api.queries.getToppingsByIds, { toppingIds });

        // Grouper par categoryId pour le format attendu par createOrder
        const categoryMap = new Map<string, string[]>();
        for (const t of toppings) {
          if (!t) continue;
          const catId = t.categoryId as string;
          if (!categoryMap.has(catId)) categoryMap.set(catId, []);
          categoryMap.get(catId)!.push(t.toppingId as string);

          // Calcul du prix du topping
          if ((t as any).menuItemId) {
            const linkedItems = await ctx.runQuery(api.menuItems.list, {});
            const linked = linkedItems.find((m: any) => m._id === (t as any).menuItemId);
            if (linked) {
              toppingPriceTotal += (t as any).specialPrice !== undefined
                ? (t as any).specialPrice
                : linked.price;
              toppingNames.push(linked.name);
            }
          } else {
            toppingPriceTotal += (t as any).specialPrice !== undefined
              ? (t as any).specialPrice
              : ((t as any).price ?? 0);
            if ((t as any).name) toppingNames.push((t as any).name);
          }
        }

        selectedToppings = Array.from(categoryMap.entries()).map(([categoryId, ids]) => ({
          categoryId,
          toppingIds: ids,
        }));
      }

      const finalPrice = resolved.price + toppingPriceTotal;

      // Nom affiché dans l'admin : utilise supplements si fourni, sinon construit depuis les toppings
      const supplementLabel = item.supplements || toppingNames.join(", ");
      const displayName = supplementLabel
        ? `${resolved.name} (${supplementLabel})`
        : resolved.name;

      orderItems.push({
        menuItemId: resolved._id,
        name: displayName,
        price: resolved.price,
        finalPrice,
        selectedToppings: selectedToppings.length > 0 ? selectedToppings : undefined,
      });
    }

    const totalPrice = orderItems.reduce((sum: number, i: any) => sum + i.finalPrice, 0);

    try {
      const orderId = await ctx.runMutation(api.mutations.createOrder, {
        customer: {
          firstName,
          lastName: lastName ?? "",
          email: `tel.${phone.replace(/\D/g, "")}@commande-vocale.fr`,
          phone,
        },
        type,
        address: type === "delivery" ? {
          street,
          city,
          zipCode,
          instructions: note || undefined,
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
