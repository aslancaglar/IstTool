import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

export const verifyAndConfirmPayment = action({
  args: {
    orderId: v.id("orders"),
    paymentIntentId: v.string(),
    expectedAmount: v.number(), // euros
  },
  handler: async (ctx, args) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe non configuré.");

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" as any });
    const pi = await stripe.paymentIntents.retrieve(args.paymentIntentId);

    if (pi.status !== "succeeded") {
      throw new Error("Paiement non confirmé par Stripe.");
    }

    const piAmountEuros = pi.amount / 100;
    if (Math.abs(piAmountEuros - args.expectedAmount) > 0.10) {
      throw new Error("Montant du paiement incorrect.");
    }

    await ctx.runMutation(internal.mutations.markOrderPaid, {
      orderId: args.orderId,
      stripePaymentIntentId: args.paymentIntentId,
    });
  },
});

export const createPaymentIntent = action({
  args: {
    amount: v.number(), // Amount in cents
  },
  handler: async (ctx, args) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not configured.");
      throw new Error("La configuration de paiement (Stripe) est manquante sur le serveur.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia" as any, // Bypass strict TS version check or use the expected exact string
    });

    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(args.amount * 100), // Stripe expects amounts in smallest currency unit (cents for EUR)
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
      throw new Error("Erreur lors de l'initialisation du paiement sécurisé.");
    }
  },
});
