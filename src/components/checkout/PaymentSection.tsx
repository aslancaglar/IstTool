"use client";

import React from 'react';
import { CreditCard, Wallet, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import StripePaymentForm from '../StripePaymentForm';
import { formatPrice } from '../../utils/formatters';

interface PaymentSectionProps {
    paymentMethod: 'stripe' | 'cash';
    setPaymentMethod: (method: 'stripe' | 'cash') => void;
    showStripeForm: boolean;
    setShowStripeForm: (show: boolean) => void;
    clientSecret: string | null;
    stripeError: string | null;
    setStripeError: (error: string | null) => void;
    createPaymentIntent: () => Promise<void>;
    handleStripeSuccess: (paymentIntentId: string) => Promise<void>;
    handleStripeError: (error: string) => void;
    handleSubmit: () => Promise<void>;
    isSubmitting: boolean;
    totalPrice: number;
}

export default function PaymentSection({
    paymentMethod,
    setPaymentMethod,
    showStripeForm,
    setShowStripeForm,
    clientSecret,
    stripeError,
    setStripeError,
    createPaymentIntent,
    handleStripeSuccess,
    handleStripeError,
    handleSubmit,
    isSubmitting,
    totalPrice
}: PaymentSectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 font-display uppercase tracking-wider text-sm">
                    <CreditCard className="w-5 h-5 text-red-500" />
                    Mode de paiement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            setPaymentMethod('cash');
                            setShowStripeForm(false);
                            setStripeError(null);
                        }}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-start gap-4 overflow-hidden ${paymentMethod === 'cash'
                            ? 'border-red-500 bg-red-50/50 text-red-600 ring-4 ring-red-500/10'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`p-3 rounded-2xl transition-all ${paymentMethod === 'cash' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                            }`}>
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm uppercase tracking-wide">Espèces / Carte</p>
                            <p className="text-[10px] opacity-70 mt-1 font-medium italic">Paiement lors de la récupération</p>
                        </div>
                        {paymentMethod === 'cash' && (
                            <div className="absolute top-4 right-4 text-red-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setPaymentMethod('stripe');
                            setStripeError(null);
                            if (!showStripeForm && !clientSecret) {
                                createPaymentIntent();
                            }
                        }}
                        className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-start gap-4 overflow-hidden ${paymentMethod === 'stripe'
                            ? 'border-red-500 bg-red-50/50 text-red-600 ring-4 ring-red-500/10'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`p-3 rounded-2xl transition-all ${paymentMethod === 'stripe' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                            }`}>
                            <Lock className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm uppercase tracking-wide">Carte Bancaire</p>
                            <p className="text-[10px] opacity-70 mt-1 font-medium italic">Cryptage sécurisé par Stripe</p>
                        </div>
                        {paymentMethod === 'stripe' && (
                            <div className="absolute top-4 right-4 text-red-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {paymentMethod === 'stripe' && showStripeForm && clientSecret && (
                <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <StripePaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                        amount={totalPrice}
                    />
                </div>
            )}

            {stripeError && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 animate-in shake duration-500">
                    <Info className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-800 text-xs font-medium">{stripeError}</p>
                </div>
            )}

            {paymentMethod === 'stripe' && !showStripeForm && !clientSecret && !stripeError && (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Initialisation Stripe...</p>
                </div>
            )}

            {paymentMethod === 'stripe' && showStripeForm && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-blue-800 font-bold text-xs uppercase tracking-wider mb-1">Mode Test Activé</p>
                        <p className="text-blue-700 text-[10px] leading-relaxed">
                            Utilisez la carte <span className="font-mono bg-white px-1 rounded font-bold">4242 4242 4242 4242</span> avec n'importe quelle date et CVC pour simuler un paiement.
                        </p>
                    </div>
                </div>
            )}

            {paymentMethod === 'cash' && (
                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        <Info className="w-5 h-5" />
                    </div>
                    <p className="text-amber-800 text-[10px] font-medium leading-relaxed uppercase tracking-tighter">
                        En cliquant sur "Confirmer", vous vous engagez à régler votre commande de <span className="font-bold underline">{formatPrice(totalPrice)}</span> lors de la récupération.
                    </p>
                </div>
            )}

            {(!showStripeForm || paymentMethod === 'cash') && (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (paymentMethod === 'stripe' && !showStripeForm)}
                    className={`w-full bg-red-600 shadow-xl shadow-red-600/20 text-white font-black py-4 rounded-2xl hover:bg-black hover:scale-[1.01] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-tighter text-sm ${isSubmitting ? 'animate-pulse' : ''
                        }`}
                >
                    {isSubmitting ? 'Traitement en cours...' : (paymentMethod === 'stripe' ? 'Continuer' : 'Confirmer ma commande')}
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}

function Info(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
    );
}
