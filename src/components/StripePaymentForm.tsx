"use client";
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Only initialize Stripe when a publishable key is configured. Calling
// loadStripe('') throws an IntegrationError and crashes the checkout page.
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export interface StripeFormHandle {
  submit: () => Promise<void>;
}

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
  clientSecret: string;
  hideInternalButton?: boolean;
  onProcessingChange?: (processing: boolean) => void;
}

interface CheckoutFormProps extends Omit<StripePaymentFormProps, 'clientSecret'> {
  formRef?: React.Ref<StripeFormHandle>;
}

function CheckoutForm({ onSuccess, onError, amount, hideInternalButton, onProcessingChange, formRef }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onProcessingChange?.(isLoading);
  }, [isLoading, onProcessingChange]);

  const submit = async () => {
    if (!stripe || !elements || isLoading) return;
    setIsLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {},
      });
      if (error) {
        onError(error.message || 'Une erreur est survenue lors du paiement.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Statut du paiement inattendu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(formRef, () => ({ submit }), [stripe, elements, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
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

      {!hideInternalButton && (
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
            <>Payer {amount.toFixed(2)}€</>
          )}
        </button>
      )}
    </form>
  );
}

const StripePaymentForm = forwardRef<StripeFormHandle, StripePaymentFormProps>(
  function StripePaymentForm({ onSuccess, onError, amount, clientSecret, hideInternalButton, onProcessingChange }, ref) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#ef4444',
        },
      },
    };

    if (!stripePromise) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Le paiement par carte est momentanément indisponible. Veuillez choisir le
          paiement en espèces ou réessayer plus tard.
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          onSuccess={onSuccess}
          onError={onError}
          amount={amount}
          hideInternalButton={hideInternalButton}
          onProcessingChange={onProcessingChange}
          formRef={ref}
        />
      </Elements>
    );
  }
);

export default StripePaymentForm;
