"use client";

import { useState } from 'react';
import { ShoppingBag, Tag, Truck, Percent, CheckCircle2, X, Loader2, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import FreeDeliveryBar from '../FreeDeliveryBar';

interface PromoResult {
  valid: boolean;
  reason?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  isFreeDelivery?: boolean;
  description?: string;
}

interface AppliedCampaign {
    id: string;
    description?: string;
    discountType: string;
    discountValue: number;
    computedDiscount: number;
    isFreeDelivery: boolean;
}

interface OrderSummaryProps {
    orderItems: any[];
    subtotal: number;
    deliveryFee: number;
    effectiveDeliveryFee?: number;
    totalWithDelivery: number;
    orderType: 'pickup' | 'delivery' | null;
    isDeliverySupported: boolean;
    freeDeliveryThreshold?: number;
    onPromoApplied?: (code: string, discount: number, isFreeDelivery?: boolean) => void;
    onPromoRemoved?: () => void;
    appliedPromoCode?: string;
    discountAmount?: number;
    freeDeliveryFromPromo?: boolean;
    validatePromo?: (code: string) => Promise<PromoResult>;
    appliedCampaigns?: AppliedCampaign[];
    campaignDiscount?: number;
}

export default function OrderSummary({
    orderItems,
    subtotal,
    deliveryFee,
    effectiveDeliveryFee,
    orderType,
    isDeliverySupported,
    freeDeliveryThreshold,
    onPromoApplied,
    onPromoRemoved,
    appliedPromoCode,
    discountAmount = 0,
    freeDeliveryFromPromo = false,
    validatePromo,
    appliedCampaigns = [],
    campaignDiscount = 0,
}: OrderSummaryProps) {
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoInput.trim() || !validatePromo) return;
        setIsValidating(true);
        setPromoError('');
        try {
            const result = await validatePromo(promoInput.trim());
            if (result.valid) {
                onPromoApplied?.(promoInput.trim().toUpperCase(), result.discountAmount ?? 0, result.isFreeDelivery);
                setPromoInput('');
            } else {
                setPromoError(result.reason ?? 'Code invalide');
            }
        } catch {
            setPromoError('Erreur de validation');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoError('');
        onPromoRemoved?.();
    };

    const shownDeliveryFee = effectiveDeliveryFee ?? deliveryFee;
    const totalDiscount = discountAmount + campaignDiscount;
    const displayTotal = orderType === 'delivery'
        ? Math.max(0, subtotal + shownDeliveryFee - totalDiscount)
        : Math.max(0, subtotal - totalDiscount);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-orange-50 to-rose-50 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow">
                        <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    </div>
                    Mon Panier
                </h2>
                <span className="bg-white px-2.5 py-1 rounded-full text-xs font-bold text-orange-500 border border-orange-100 shadow-sm">
                    {orderItems.length} article{orderItems.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Items */}
            <div className="p-5 space-y-3 max-h-[38vh] overflow-y-auto no-scrollbar">
                {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3 group p-2 rounded-xl hover:bg-orange-50/50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-orange-200 transition-colors shadow-sm">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-gray-200" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">{item.name}</p>
                                <p className="text-sm font-black text-gray-900 shrink-0">{formatPrice(item.totalPrice)}</p>
                            </div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <div className="mt-0.5 space-y-0.5">
                                    {item.selectedToppings.map((topping: any, idx: number) => (
                                        <div key={`${topping.toppingId}-${idx}`} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-gray-400 truncate">+ {topping.name}</span>
                                            {typeof topping.price === 'number' && topping.price > 0 && (
                                                <span className="text-[10px] text-orange-400 font-bold shrink-0">+{topping.price.toFixed(2)}€</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Campaigns */}
            {appliedCampaigns.length > 0 && (
                <div className="px-5 pb-3 space-y-2">
                    {appliedCampaigns.map(c => (
                        <div key={c.id} className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-3 py-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs text-emerald-700 font-semibold flex-1 truncate">
                                {c.description ?? (c.discountType === 'percentage' ? `-${c.discountValue}%` : c.discountType === 'fixed' ? `-${c.discountValue.toFixed(2)}€` : 'Livraison offerte')}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 shrink-0">
                                {c.isFreeDelivery ? 'Offerte' : `-${formatPrice(c.computedDiscount)}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Promo Code */}
            {validatePromo && (
                <div className="px-5 pb-3">
                    {appliedPromoCode ? (
                        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                    <span className="text-sm font-bold text-emerald-700 font-mono">{appliedPromoCode}</span>
                                    {freeDeliveryFromPromo
                                        ? <span className="text-xs text-emerald-600 ml-2">Livraison offerte</span>
                                        : <span className="text-xs text-emerald-600 ml-2">-{formatPrice(discountAmount)}</span>
                                    }
                                </div>
                            </div>
                            <button onClick={handleRemovePromo} className="p-1 text-emerald-400 hover:text-emerald-700 rounded-full hover:bg-emerald-100 transition">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                    <input
                                        value={promoInput}
                                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                        placeholder="Code promo"
                                        className="w-full pl-8 pr-3 py-2.5 text-sm border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 font-mono bg-white transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={!promoInput.trim() || isValidating}
                                    className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                                >
                                    {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Percent className="w-3.5 h-3.5" />}
                                    Appliquer
                                </button>
                            </div>
                            {promoError && (
                                <p className="text-xs text-red-500 font-medium px-1">{promoError}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Totals */}
            <div className="p-5 bg-gradient-to-b from-gray-50/50 to-orange-50/30 border-t border-gray-100 space-y-2.5">
                {orderType === 'delivery' && freeDeliveryThreshold && freeDeliveryThreshold > 0 && (
                    <div className="mb-2">
                        <FreeDeliveryBar currentTotal={subtotal} threshold={freeDeliveryThreshold} />
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Sous-total
                    </span>
                    <span className="font-bold text-gray-800">{formatPrice(subtotal)}</span>
                </div>

                {campaignDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Promotions actives
                        </span>
                        <span className="font-bold text-emerald-600">-{formatPrice(campaignDiscount)}</span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" />
                            Code promo
                        </span>
                        <span className="font-bold text-emerald-600">-{formatPrice(discountAmount)}</span>
                    </div>
                )}

                {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                        <span className={`flex items-center gap-1.5 ${!isDeliverySupported ? 'text-red-500' : 'text-gray-500'}`}>
                            <Truck className="w-3.5 h-3.5" />
                            Frais de livraison
                        </span>
                        <span className={`font-bold ${!isDeliverySupported ? 'text-red-500' : shownDeliveryFee === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {isDeliverySupported ? (shownDeliveryFee === 0 ? 'OFFERT' : formatPrice(shownDeliveryFee)) : 'Non supporté'}
                        </span>
                    </div>
                )}

                <div className="pt-4 mt-2 border-t border-orange-100 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-0.5">Total à payer</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent tabular-nums">
                            {formatPrice(displayTotal)}
                        </p>
                    </div>
                    {orderType === 'delivery' && shownDeliveryFee === 0 && isDeliverySupported && (
                        <span className="text-[10px] bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2.5 py-1.5 rounded-full font-bold uppercase border border-emerald-200 mb-1">
                            Livraison Offerte
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
