"use client";

import { useState } from 'react';
import { ShoppingBag, Tag, Truck, Percent, CheckCircle2, X, Loader2, Sparkles, Gift, Calculator } from 'lucide-react';
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
    bogoFreeCount?: number;
}

interface BogoFreeItem {
    menuItemId: string;
    name: string;
    image?: string;
    selectedToppings?: { toppingId: string; name: string; price?: number }[];
    finalPrice: number;
}

interface OrderSummaryProps {
    orderItems: any[];
    subtotal: number;
    deliveryFee: number;
    effectiveDeliveryFee?: number;
    totalWithDelivery: number;
    orderType: 'pickup' | 'delivery' | 'dine_in' | null;
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
    bogoFreeItems?: BogoFreeItem[];
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
    bogoFreeItems = [],
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
    const bogoFreeTotal = bogoFreeItems.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);
    const displayTotal = orderType === 'delivery'
        ? Math.max(0, subtotal + shownDeliveryFee + bogoFreeTotal - totalDiscount)
        : Math.max(0, subtotal + bogoFreeTotal - totalDiscount);

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 overflow-hidden sticky top-24">
            {/* Header */}
            <div className="px-5 py-4 bg-primary-600 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2.5 uppercase tracking-widest">
                    <ShoppingBag className="w-4 h-4" />
                    Mon Panier
                </h2>
                <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold text-white">
                    {orderItems.length} article{orderItems.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Items */}
            <div className="p-5 space-y-3 max-h-[38vh] overflow-y-auto no-scrollbar">
                {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3 group p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 group-hover:border-primary-200 transition-colors shadow-sm">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">{item.name}</p>
                                <p className="text-sm font-black text-gray-900 shrink-0">{formatPrice(item.totalPrice)}</p>
                            </div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <div className="mt-0.5 space-y-0.5">
                                    {item.selectedToppings.map((topping: any, idx: number) => (
                                        <div key={`${topping.toppingId}-${idx}`} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-gray-400 truncate">+ {topping.name}</span>
                                            {typeof topping.price === 'number' && topping.price > 0 && (
                                                <span className="text-[10px] text-primary-500 font-bold shrink-0">+{topping.price.toFixed(2)}€</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {bogoFreeItems.map((item, idx) => (
                    <div key={`bogo-free-${item.menuItemId}-${idx}`} className="flex gap-3 p-2 rounded-xl bg-emerald-50/60 border border-dashed border-emerald-200 animate-in fade-in duration-300">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex-shrink-0 overflow-hidden border border-emerald-100 shadow-sm">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-emerald-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide">Offert</span>
                                    <p className="text-sm font-bold text-emerald-700 truncate">{item.name}</p>
                                </div>
                                <p className="text-sm font-black text-emerald-600 shrink-0">
                                    {item.finalPrice > 0 ? formatPrice(item.finalPrice) : '€0.00'}
                                </p>
                            </div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <div className="mt-0.5 space-y-0.5">
                                    {item.selectedToppings.map((topping, tidx) => (
                                        <div key={`${topping.toppingId}-${tidx}`} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-emerald-500 truncate">+ {topping.name}</span>
                                            {typeof topping.price === 'number' && topping.price > 0 && (
                                                <span className="text-[10px] text-emerald-600 font-bold shrink-0">+{topping.price.toFixed(2)}€</span>
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
                                {c.bogoFreeCount != null
                                    ? `${c.bogoFreeCount} offert${c.bogoFreeCount > 1 ? 's' : ''}`
                                    : c.isFreeDelivery ? 'Offerte' : `-${formatPrice(c.computedDiscount)}`}
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
            <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-2.5">
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
                    <span className="font-bold text-gray-800">{formatPrice(subtotal + bogoFreeTotal)}</span>
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

                {/* TVA Breakdown */}
                {(() => {
                    const DEFAULT_TVA = 10;
                    // Group TTC amounts by TVA rate
                    const tvaBuckets: Record<number, number> = {};
                    for (const item of orderItems) {
                        const rate = item.tvaPercent ?? DEFAULT_TVA;
                        tvaBuckets[rate] = (tvaBuckets[rate] || 0) + item.basePrice;
                        for (const t of item.selectedToppings) {
                            const tRate = t.tvaPercent ?? rate;
                            tvaBuckets[tRate] = (tvaBuckets[tRate] || 0) + (t.price ?? 0);
                        }
                    }
                    // Add bogo free items
                    for (const item of bogoFreeItems) {
                        if (item.finalPrice > 0) {
                            tvaBuckets[DEFAULT_TVA] = (tvaBuckets[DEFAULT_TVA] || 0) + item.finalPrice;
                        }
                    }

                    const rates = Object.keys(tvaBuckets).map(Number).sort((a, b) => a - b);
                    let totalHT = 0;
                    let totalTVA = 0;
                    const lines = rates.map(rate => {
                        const ttc = tvaBuckets[rate];
                        const ht = ttc / (1 + rate / 100);
                        const tva = ttc - ht;
                        totalHT += ht;
                        totalTVA += tva;
                        return { rate, ht, tva };
                    });

                    if (lines.length === 0) return null;

                    return (
                        <div className="pt-2 mt-1 border-t border-gray-200">
                            <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                        <Calculator className="w-3.5 h-3.5 text-gray-400" />
                                        <span>Taxes Incluses (TVA)</span>
                                    </div>
                                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-tight">Détail</span>
                                </div>
                                
                                <div className="space-y-2 pt-0.5">
                                    {lines.map(({ rate, ht, tva }) => (
                                        <div key={rate} className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 text-[10px]">
                                                Taux {rate}%
                                            </span>
                                            <div className="flex items-center gap-3 text-gray-500 font-mono">
                                                <span>HT <strong className="font-semibold text-gray-700">{formatPrice(ht)}</strong></span>
                                                <span className="text-gray-300">|</span>
                                                <span>TVA <strong className="font-semibold text-primary-600">{formatPrice(tva)}</strong></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-semibold text-gray-500">
                                    <span className="text-gray-400">Total Hors Taxes (HT)</span>
                                    <span className="font-mono text-gray-700">{formatPrice(totalHT)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="pt-4 mt-2 border-t border-gray-200 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-0.5">Total à payer</p>
                        <p className="text-3xl font-black text-gray-900 tabular-nums">
                            {formatPrice(displayTotal)}
                        </p>
                    </div>
                    {orderType === 'delivery' && shownDeliveryFee === 0 && isDeliverySupported && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full font-bold uppercase border border-emerald-100 mb-1">
                            Livraison Offerte
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
