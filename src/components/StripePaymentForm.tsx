"use client";
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
  clientSecret: string;
}

function CheckoutForm({ onSuccess, onError, amount }: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        // Return URL is required if you want to redirect, but since we handle it in the same page:
      },
    });

    if (error) {
      onError(error.message || 'Une erreur est survenue lors du paiement.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      onError('Statut du paiement inattendu.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />

      <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
        </svg>
        <span>Paiement sécurisé par Stripe</span>
      </div>

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Traitement du paiement...
          </>
        ) : (
          <>
            Payer {amount.toFixed(2)}€
          </>
        )}
      </button>
    </form>
  );
}

export default function StripePaymentForm({ onSuccess, onError, amount, clientSecret }: StripePaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#ef4444', // red-500
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} amount={amount} />
    </Elements>
  );
}
