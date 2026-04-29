"use client";

import React from 'react';
import { CreditCard, Wallet, Lock, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import StripePaymentForm from '../StripePaymentForm';
import { formatPrice } from '../../utils/formatters';

interface PaymentSectionProps {
    paymentMethod: 'stripe' | 'cash' | null;
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
    hideSubmitButton?: boolean;
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
    totalPrice,
    hideSubmitButton = false,
}: PaymentSectionProps) {
    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-400 to-violet-500">
                        <CreditCard className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">Mode de paiement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            setPaymentMethod('cash');
                            setShowStripeForm(false);
                            setStripeError(null);
                        }}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden ${
                            paymentMethod === 'cash'
                                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 ring-4 ring-amber-500/10'
                                : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            paymentMethod === 'cash'
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-500'
                        }`}>
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-amber-700' : 'text-gray-700'}`}>
                                Espèces / Carte
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Paiement à la récupération</p>
                        </div>
                        {paymentMethod === 'cash' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setPaymentMethod('stripe');
                            setStripeError(null);
                            if (!showStripeForm && !clientSecret) createPaymentIntent();
                        }}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden ${
                            paymentMethod === 'stripe'
                                ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 ring-4 ring-indigo-500/10'
                                : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            paymentMethod === 'stripe'
                                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
                        }`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className={`font-bold text-sm ${paymentMethod === 'stripe' ? 'text-indigo-700' : 'text-gray-700'}`}>
                                Carte Bancaire
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Cryptage sécurisé par Stripe</p>
                        </div>
                        {paymentMethod === 'stripe' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {paymentMethod === 'stripe' && showStripeForm && clientSecret && (
                <div className="p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <StripePaymentForm
                        clientSecret={clientSecret}
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                        amount={totalPrice}
                    />
                </div>
            )}

            {paymentMethod === 'stripe' && !showStripeForm && !clientSecret && !stripeError && (
                <div className="flex flex-col items-center justify-center p-10 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-200">
                    <Loader2 className="w-7 h-7 text-indigo-400 animate-spin mb-3" />
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Initialisation Stripe...</p>
                </div>
            )}

            {stripeError && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{stripeError}</p>
                </div>
            )}

            {paymentMethod === 'stripe' && showStripeForm && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 flex gap-3 items-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">Mode Test Activé</p>
                        <p className="text-indigo-600 text-[11px] leading-relaxed">
                            Utilisez la carte <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold text-indigo-700">4242 4242 4242 4242</span> avec n'importe quelle date et CVC.
                        </p>
                    </div>
                </div>
            )}

            {paymentMethod === 'cash' && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex gap-3 items-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center shrink-0 shadow">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <p className="text-amber-800 text-[11px] font-medium leading-relaxed">
                        En confirmant, vous vous engagez à régler votre commande de{' '}
                        <span className="font-bold text-amber-900">{formatPrice(totalPrice)}</span>{' '}
                        lors de la récupération.
                    </p>
                </div>
            )}

            {!hideSubmitButton && paymentMethod && (!showStripeForm || paymentMethod === 'cash') && (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (paymentMethod === 'stripe' && !showStripeForm)}
                    className={`w-full bg-gradient-to-r from-orange-500 to-rose-600 shadow-xl shadow-orange-500/25 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-rose-700 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 text-base ${
                        isSubmitting ? 'animate-pulse' : ''
                    }`}
                >
                    {isSubmitting
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
                        : <>{paymentMethod === 'stripe' ? 'Continuer' : 'Confirmer ma commande'} <ChevronRight className="w-5 h-5" /></>
                    }
                </button>
            )}
        </div>
    );
}
