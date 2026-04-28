"use client";

import { useState } from 'react';
import { ShoppingBag, Tag, Truck, Percent, CheckCircle2, X, Loader2, Zap } from 'lucide-react';
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
    orderType: 'pickup' | 'delivery';
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
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-display">
                    <ShoppingBag className="w-5 h-5 text-red-500" />
                    Mon Panier
                </h2>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-100 shadow-sm">
                    {orderItems.length} article{orderItems.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Items List */}
            <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-red-100 transition-colors">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-gray-200" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">{item.name}</p>
                                <span className="text-xs font-bold text-gray-400 shrink-0">{formatPrice(item.basePrice)}</span>
                            </div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                    {item.selectedToppings.map((topping: any, idx: number) => (
                                        <div key={`${topping.toppingId}-${idx}`} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-gray-400 truncate">
                                                + {topping.name}
                                            </span>
                                            {typeof topping.price === 'number' && topping.price > 0 && (
                                                <span className="text-[10px] text-red-400 font-bold flex-shrink-0">
                                                    +{topping.price.toFixed(2)}€
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-black text-gray-900 self-center">
                            {formatPrice(item.totalPrice)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Active Campaigns */}
            {appliedCampaigns.length > 0 && (
                <div className="px-6 pb-2 space-y-1.5">
                    {appliedCampaigns.map(c => (
                        <div key={c.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-green-700 font-semibold flex-1 truncate">
                                {c.description ?? (c.discountType === 'percentage' ? `-${c.discountValue}% sur la commande` : c.discountType === 'percent_off_items' ? `-${c.discountValue}% sur articles` : c.discountType === 'fixed' ? `-${c.discountValue.toFixed(2)}€` : 'Livraison offerte')}
                            </span>
                            <span className="text-xs font-bold text-green-700 shrink-0">
                                {c.isFreeDelivery ? 'Livraison offerte' : `-${formatPrice(c.computedDiscount)}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Promo Code */}
            {validatePromo && (
                <div className="px-6 pb-2">
                    {appliedPromoCode ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <div>
                                    <span className="text-sm font-bold text-green-700 font-mono">{appliedPromoCode}</span>
                                    {freeDeliveryFromPromo
                                        ? <span className="text-xs text-green-600 ml-2">Livraison offerte</span>
                                        : <span className="text-xs text-green-600 ml-2">-{formatPrice(discountAmount)}</span>
                                    }
                                </div>
                            </div>
                            <button onClick={handleRemovePromo} className="p-1 text-green-400 hover:text-green-700 transition">
                                <X className="w-4 h-4" />
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
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={!promoInput.trim() || isValidating}
                                    className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40 flex items-center gap-1.5"
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
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-3">
                {orderType === 'delivery' && freeDeliveryThreshold && freeDeliveryThreshold > 0 && (
                    <div className="mb-1">
                        <FreeDeliveryBar
                            currentTotal={subtotal}
                            threshold={freeDeliveryThreshold}
                        />
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Sous-total
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {campaignDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Promotions actives
                        </span>
                        <span className="font-bold">-{formatPrice(campaignDiscount)}</span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Code promo
                        </span>
                        <span className="font-bold">-{formatPrice(discountAmount)}</span>
                    </div>
                )}

                {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${!isDeliverySupported ? 'text-red-500' : ''}`} />
                            Frais de livraison
                        </span>
                        <span className={`font-bold ${!isDeliverySupported ? 'text-red-500' : 'text-gray-900'}`}>
                            {isDeliverySupported ? (shownDeliveryFee === 0 ? 'OFFERT' : formatPrice(shownDeliveryFee)) : 'Non supporté'}
                        </span>
                    </div>
                )}

                <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Total à payer</span>
                        <span className="text-3xl font-black text-red-600 font-display tabular-nums">
                            {formatPrice(displayTotal)}
                        </span>
                    </div>
                    {orderType === 'delivery' && shownDeliveryFee === 0 && isDeliverySupported && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase mb-2">Livraison Offerte</span>
                    )}
                </div>
            </div>
        </div>
    );
}
