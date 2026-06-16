import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-04-22.dahlia" as any;

// Create a PaymentIntent for an existing order. Amount is derived from
// order.totalPrice (server-side); the client does not get to pick.
export const createPaymentIntent = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("La configuration de paiement (Stripe) est manquante sur le serveur.");
    }

    const order = await ctx.runQuery(internal.queries.getOrderInternal, { orderId: args.orderId });
    if (!order) throw new Error("Commande introuvable.");
    if (order.paymentMethod !== "stripe") throw new Error("Cette commande n'utilise pas le paiement par carte.");
    if (order.paymentStatus === "paid") throw new Error("Cette commande est déjà payée.");

    const stripe = new Stripe(stripeKey, {
      apiVersion: STRIPE_API_VERSION,
      httpClient: Stripe.createFetchHttpClient(),
    });
    const expectedCents = Math.round(order.totalPrice * 100);

    // Reuse a still-payable PI bound to this order if present and amount unchanged
    if (order.stripePaymentIntentId) {
      try {
        const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        const reusable =
          existing.status === "requires_payment_method" ||
          existing.status === "requires_confirmation" ||
          existing.status === "requires_action";
        if (reusable && existing.amount === expectedCents) {
          return { clientSecret: existing.client_secret };
        }
      } catch { /* fall through and create a fresh PI */ }
    }

    const pi = await stripe.paymentIntents.create({
      amount: expectedCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: args.orderId },
    });

    await ctx.runMutation(internal.mutations.attachPaymentIntent, {
      orderId: args.orderId,
      paymentIntentId: pi.id,
    });

    return { clientSecret: pi.client_secret };
  },
});

// Verify Stripe payment and mark the bound order as paid.
// Order id is taken from PI metadata, amount is compared to order.totalPrice
// — neither is supplied by the client.
export const verifyAndConfirmPayment = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe non configuré.");

    const stripe = new Stripe(stripeKey, {
      apiVersion: STRIPE_API_VERSION,
      httpClient: Stripe.createFetchHttpClient(),
    });
    const pi = await stripe.paymentIntents.retrieve(args.paymentIntentId);

    if (pi.status !== "succeeded") {
      throw new Error("Paiement non confirmé par Stripe.");
    }

    const orderId = pi.metadata?.orderId;
    if (!orderId) {
      throw new Error("PaymentIntent sans commande associée.");
    }

    const order = await ctx.runQuery(internal.queries.getOrderInternal, {
      orderId: orderId as any,
    });
    if (!order) throw new Error("Commande introuvable.");

    // Idempotent: a re-confirm on an already-paid order is fine
    if (order.paymentStatus === "paid") {
      return { orderId };
    }

    // Defense in depth: PI must be the one bound to this order
    if (order.stripePaymentIntentId !== pi.id) {
      throw new Error("PaymentIntent ne correspond pas à la commande.");
    }

    // Compare PI amount to the order total stored in the DB.
    const expectedCents = Math.round(order.totalPrice * 100);
    if (Math.abs(pi.amount - expectedCents) > 1) {
      throw new Error("Montant du paiement incorrect.");
    }

    await ctx.runMutation(internal.mutations.markOrderPaid, {
      orderId: orderId as any,
      stripePaymentIntentId: pi.id,
    });

    return { orderId };
  },
});
