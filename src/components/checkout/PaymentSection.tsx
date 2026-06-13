"use client";

import React from 'react';
import { CreditCard, Wallet, Lock, CheckCircle2, ChevronRight, AlertCircle, Loader2, Store, Banknote } from 'lucide-react';
import StripePaymentForm, { type StripeFormHandle } from '../StripePaymentForm';
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
    cashEnabled?: boolean;
    stripeEnabled?: boolean;
    stripeFormRef?: React.Ref<StripeFormHandle>;
    onStripeProcessingChange?: (processing: boolean) => void;
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
    cashEnabled = true,
    stripeEnabled = true,
    stripeFormRef,
    onStripeProcessingChange,
}: PaymentSectionProps) {
    const bothEnabled = cashEnabled && stripeEnabled;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-5 py-4 bg-primary-600 flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">Mode de paiement</span>
            </div>

            <div className="p-5 md:p-8 space-y-5">
                <div className={`grid gap-3 ${bothEnabled ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {cashEnabled && (
                        <button
                            onClick={() => {
                                setPaymentMethod('cash');
                                setShowStripeForm(false);
                                setStripeError(null);
                            }}
                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start gap-3 bg-white ${
                                paymentMethod === 'cash'
                                    ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md shadow-primary-500/10'
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className={`p-3 rounded-full transition-all duration-300 ${
                                paymentMethod === 'cash'
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'
                            }`}>
                                <div className="flex -space-x-1 items-center justify-center">
                                    <Banknote className="w-4 h-4" />
                                    <CreditCard className="w-4 h-4 opacity-70 scale-90" />
                                </div>
                            </div>
                            <div className="text-left">
                                <p className={`font-bold text-sm tracking-wide ${paymentMethod === 'cash' ? 'text-primary-700' : 'text-gray-700'}`}>
                                    Paiement au comptoir
                                </p>
                                <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-snug">Réglez sur place (Espèces, CB, Tickets Resto)</p>
                            </div>
                            {paymentMethod === 'cash' && (
                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </button>
                    )}

                    {stripeEnabled && (
                        <button
                            onClick={() => {
                                setPaymentMethod('stripe');
                                setStripeError(null);
                                if (!showStripeForm && !clientSecret) createPaymentIntent();
                            }}
                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-start gap-3 bg-white ${
                                paymentMethod === 'stripe'
                                    ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md shadow-primary-500/10'
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className={`p-3 rounded-full transition-all duration-300 ${
                                paymentMethod === 'stripe'
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'
                            }`}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className={`font-bold text-sm tracking-wide ${paymentMethod === 'stripe' ? 'text-primary-700' : 'text-gray-700'}`}>
                                    Carte Bancaire
                                </p>
                                <p className="text-[12px] font-medium text-gray-500 mt-0.5">Cryptage sécurisé par Stripe</p>
                            </div>
                            {paymentMethod === 'stripe' && (
                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </button>
                    )}
                </div>

            {paymentMethod === 'stripe' && showStripeForm && clientSecret && (
                <div className="p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4 duration-500">
                    <StripePaymentForm
                        ref={stripeFormRef}
                        clientSecret={clientSecret}
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                        amount={totalPrice}
                        hideInternalButton
                        onProcessingChange={onStripeProcessingChange}
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

            {paymentMethod === 'stripe' && showStripeForm && process.env.NODE_ENV === 'development' && (
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
                        <div className="flex items-center justify-center gap-1">
                            <Banknote className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-amber-800 text-[11px] font-medium leading-relaxed">
                        Le règlement de votre commande d'un montant de{' '}
                        <span className="font-bold text-amber-900">{formatPrice(totalPrice)}</span>{' '}
                        s'effectuera directement au comptoir lors de votre venue.
                    </p>
                </div>
            )}

            {!hideSubmitButton && paymentMethod && (!showStripeForm || paymentMethod === 'cash') && (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (paymentMethod === 'stripe' && !showStripeForm)}
                    className={`w-full bg-emerald-600 shadow-md shadow-emerald-500/20 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 text-base ${
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
        </div>
    );
}
