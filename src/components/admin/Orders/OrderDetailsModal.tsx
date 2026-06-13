"use client";

import { useState, useEffect } from "react";
import {
    X, Clock, Package, CheckCircle, XCircle,
    User, Phone, Mail, MapPin, Trash2,
    Truck, ShoppingBag, CreditCard, Banknote,
    ChevronDown, ChevronUp, Copy, ExternalLink, Gift, Printer, Utensils, FileDown
} from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';
import { useInvoiceDownload } from '../../../hooks/useInvoiceDownload';
import { useAdminAuth } from '../../../context/AdminAuthContext';

interface OrderDetailsModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (
        orderId: Id<'orders'>,
        newStatus: string,
        options?: { prepTimeMinutes?: number; deliveryTimeMinutes?: number }
    ) => Promise<void>;
    onPaymentStatusChange?: (orderId: Id<'orders'>, paymentStatus: 'paid' | 'unpaid') => Promise<void>;
    onDeleteOrder: (orderId: Id<'orders'>) => Promise<void>;
    onReprint?: (orderId: Id<'orders'>) => Promise<void>;
    onUpdateTimes?: (orderId: Id<'orders'>, prepTimeMinutes: number, deliveryTimeMinutes?: number) => Promise<void>;
    toppings: any[] | undefined;
    toppingCategories: any[] | undefined;
    promoCodes?: any[] | undefined;
    campaigns?: any[] | undefined;
}

const STATUS_FLOW_PICKUP = ['pending', 'preparing', 'ready', 'completed'] as const;
const STATUS_FLOW_DELIVERY = ['pending', 'preparing', 'ready', 'delivering', 'completed'] as const;

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', icon: Clock, label: 'En attente' },
    preparing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Package, label: 'En préparation' },
    ready: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: ShoppingBag, label: 'Prête' },
    delivering: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', icon: Truck, label: 'En livraison' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle, label: 'Terminée' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle, label: 'Annulée' },
};

export default function OrderDetailsModal({
    order,
    isOpen,
    onClose,
    onStatusChange,
    onPaymentStatusChange,
    onDeleteOrder,
    onReprint,
    onUpdateTimes,
    toppings,
    toppingCategories,
    promoCodes,
    campaigns
}: OrderDetailsModalProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [pickedPrep, setPickedPrep] = useState<number>(25);
    const [savingTimes, setSavingTimes] = useState(false);
    const { adminToken } = useAdminAuth();
    const { download: downloadInvoice, downloadingId } = useInvoiceDownload();

    useEffect(() => {
        if (!isOpen) {
            setIsConfirmingDelete(false);
            setCopied(false);
            setIsCustomerDetailsOpen(false);
            setTimePickerOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (order) {
            setPickedPrep(order.prepTimeMinutes ?? 25);
        }
    }, [order?._id, order?.prepTimeMinutes]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !order) return null;

    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = config.icon;
    const isDelivery = order.type === 'delivery';
    const isDineIn = order.type === 'dine_in';
    const isPending = order.status === 'pending';
    const activeFlow = isDelivery ? STATUS_FLOW_DELIVERY : STATUS_FLOW_PICKUP;
    const currentIdx = activeFlow.indexOf(order.status as any);

    const copyPhone = () => {
        navigator.clipboard.writeText(order.customer.phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getNextStatus = () => {
        if (order.status === 'cancelled') return null;
        const idx = activeFlow.indexOf(order.status as any);
        if (idx < 0 || idx >= activeFlow.length - 1) return null;
        return activeFlow[idx + 1];
    };

    const nextStatus = getNextStatus();
    const nextConfig = nextStatus ? STATUS_CONFIG[nextStatus] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] sm:m-4 rounded-t-2xl">

                {/* ── HEADER ────────────────────────── */}
                <div className="relative px-5 pt-5 pb-4 border-b border-slate-100">
                    {/* Top-right actions */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
                        {onUpdateTimes && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'ready' && (
                            <button
                                onClick={() => setTimePickerOpen((v) => !v)}
                                className={`relative p-2 rounded-full transition-colors ${
                                    timePickerOpen
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title="Modifier le temps de préparation"
                            >
                                <Clock className="w-5 h-5" />
                                {isPending && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                                )}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Time picker popover */}
                    {timePickerOpen && onUpdateTimes && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setTimePickerOpen(false)}
                            />
                            <div className="absolute top-14 right-4 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        {isPending ? 'Accepter en' : 'Temps de préparation'}
                                    </p>
                                    <p className="text-2xl font-black text-emerald-700 tabular-nums mt-0.5">
                                        {pickedPrep} min
                                    </p>
                                </div>
                                <div className="p-3 grid grid-cols-4 gap-1.5">
                                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setPickedPrep(m)}
                                            className={`px-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                pickedPrep === m
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {m}m
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                                    <button
                                        onClick={() => setTimePickerOpen(false)}
                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setSavingTimes(true);
                                            try {
                                                if (isPending) {
                                                    await onStatusChange(order._id, 'preparing', {
                                                        prepTimeMinutes: pickedPrep,
                                                    });
                                                } else {
                                                    await onUpdateTimes(order._id, pickedPrep);
                                                }
                                                setTimePickerOpen(false);
                                            } finally {
                                                setSavingTimes(false);
                                            }
                                        }}
                                        disabled={savingTimes}
                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {savingTimes ? '...' : isPending ? 'Accepter' : 'Mettre à jour'}
                                    </button>
                                </div>
                                {order.acceptedAt && (
                                    <p className="px-4 pb-3 text-[11px] text-slate-400">
                                        Acceptée à {new Date(order.acceptedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Order ID + badges */}
                    <div className="flex items-center gap-2 flex-wrap pr-10 mb-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            #{order._id.slice(-6).toUpperCase()}
                        </h2>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                            isDelivery 
                                ? 'bg-violet-100 text-violet-700' 
                                : isDineIn
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                        }`}>
                            {isDelivery ? <Truck className="w-3 h-3" /> : isDineIn ? <Utensils className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                            {isDelivery ? 'Livraison' : isDineIn ? 'Sur Place' : 'Emporter'}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                {order.paymentMethod === 'cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                {order.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}
                                {order.paymentStatus === 'paid' ? ' ✓' : ' – À payer'}
                            </span>
                            {order.paymentMethod === 'cash' && onPaymentStatusChange && (
                                <button
                                    onClick={() => onPaymentStatusChange(order._id, order.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors border ${
                                        order.paymentStatus === 'paid'
                                            ? 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                                            : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                >
                                    {order.paymentStatus === 'paid' ? 'Non payé ?' : 'Marquer payé ✓'}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString('fr-FR', {
                            weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                        {order.scheduledTime && order.scheduledTime !== 'asap' && (
                            <span className="ml-2 font-bold text-amber-600">⏰ Prévu: {order.scheduledTime}</span>
                        )}
                    </p>

                    {/* Status stepper */}
                    <div className="flex items-center gap-1 mt-4">
                        {activeFlow.map((s, i) => {
                            const stepConfig = STATUS_CONFIG[s];
                            const StepIcon = stepConfig.icon;
                            const isActive = order.status === s;
                            const isPast = currentIdx >= 0 && i < currentIdx;
                            const isFuture = currentIdx >= 0 && i > currentIdx;
                            const isCancelled = order.status === 'cancelled';

                            return (
                                <div key={s} className="flex items-center flex-1">
                                    <button
                                        onClick={() => onStatusChange(order._id, s)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isActive
                                                ? `${stepConfig.bg} ${stepConfig.text} ring-2 ring-offset-1 ${stepConfig.border.replace('border-', 'ring-')}`
                                                : isPast
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : isCancelled
                                                        ? 'bg-slate-50 text-slate-400'
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                            }`}
                                    >
                                        <StepIcon className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{stepConfig.label}</span>
                                    </button>
                                    {i < activeFlow.length - 1 && (
                                        <div className={`w-4 h-0.5 mx-0.5 rounded-full shrink-0 ${isPast ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {order.status === 'cancelled' && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Commande annulée</span>
                        </div>
                    )}
                </div>

                {/* ── BODY ────────────────────────── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── ARTICLES ────────────────────────── */}
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" />
                            Articles ({order.items.length})
                        </h3>

                        <div className="space-y-2">
                            {order.items.map((item: any, index: number) => {
                                const isFree = item.isFree === true;

                                // Build toppings by category (only for paid items)
                                const toppingsByCategory: Record<string, { name: string; price: number }[]> = {};
                                if (!isFree && item.selectedToppings) {
                                    item.selectedToppings.forEach((toppingGroup: any) => {
                                        toppingGroup.toppingIds.forEach((tId: string, tIdx: number) => {
                                            const topping = toppings?.find(t => t.toppingId === tId);
                                            if (topping) {
                                                const categoryName = toppingCategories?.find(c => c.categoryId === topping.categoryId)?.name || 'Options';
                                                if (!toppingsByCategory[categoryName]) {
                                                    toppingsByCategory[categoryName] = [];
                                                }
                                                toppingsByCategory[categoryName].push({
                                                    name: topping.name,
                                                    price: topping.specialPrice !== undefined ? topping.specialPrice : (topping.price ?? 0),
                                                });
                                            }
                                        });
                                    });
                                }

                                if (isFree) {
                                    // All toppings: freeForBogo ones shown at €0, others charged
                                    const freeToppings: { name: string; price: number; isFreeForBogo: boolean }[] = [];

                                    // Collect toppingIds stored on this free item
                                    const storedIds = new Set<string>();
                                    if (item.selectedToppings) {
                                        item.selectedToppings.forEach((toppingGroup: any) => {
                                            toppingGroup.toppingIds.forEach((tId: string) => storedIds.add(tId));
                                        });
                                    }

                                    // For old orders: also pull freeForBogo toppings from the matching paid item
                                    const paidCounterpart = order.items.find(
                                        (other: any) => !other.isFree && other.menuItemId === item.menuItemId
                                    );
                                    if (paidCounterpart?.selectedToppings) {
                                        paidCounterpart.selectedToppings.forEach((toppingGroup: any) => {
                                            toppingGroup.toppingIds.forEach((tId: string) => {
                                                if (storedIds.has(tId)) return; // already included
                                                const topping = toppings?.find((t: any) => t.toppingId === tId);
                                                if (!topping) return;
                                                const cat = toppingCategories?.find((c: any) => c.categoryId === topping.categoryId);
                                                if (cat?.freeForBogo === true) storedIds.add(tId); // add freeForBogo ones
                                            });
                                        });
                                    }

                                    storedIds.forEach((tId) => {
                                        const topping = toppings?.find((t: any) => t.toppingId === tId);
                                        if (!topping) return;
                                        const cat = toppingCategories?.find((c: any) => c.categoryId === topping.categoryId);
                                        const isFreeForBogo = cat?.freeForBogo === true;
                                        const price = isFreeForBogo ? 0 : (topping.specialPrice !== undefined ? topping.specialPrice : (topping.price ?? 0));
                                        freeToppings.push({ name: topping.name, price, isFreeForBogo });
                                    });
                                    return (
                                        <div key={index} className="bg-emerald-50 rounded-xl p-3 border border-dashed border-emerald-200">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Gift className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">Offert</span>
                                                    <p className="font-bold text-emerald-800 text-base truncate">{item.name.replace(/ \(offert\)$/i, '')}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {paidCounterpart && (
                                                        <span className="text-base text-emerald-400 line-through tabular-nums">
                                                            {paidCounterpart.finalPrice.toFixed(2)}€
                                                        </span>
                                                    )}
                                                    <span className="text-base font-black text-emerald-600 tabular-nums">
                                                        {item.finalPrice > 0 ? `+${item.finalPrice.toFixed(2)}€` : 'Gratuit'}
                                                    </span>
                                                </div>
                                            </div>
                                            {freeToppings.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {freeToppings.map((t, tidx) => (
                                                        <span key={tidx} className="inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-emerald-700 font-medium">
                                                            {t.name}
                                                            {t.isFreeForBogo
                                                                ? <span className="text-emerald-400 font-bold">offert</span>
                                                                : t.price > 0 && <span className="text-emerald-600 font-bold">+{t.price.toFixed(2)}€</span>
                                                            }
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        {/* Item header */}
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <p className="font-bold text-slate-900 text-base">{item.name}</p>
                                            <p className="font-black text-slate-900 tabular-nums text-base shrink-0">
                                                {item.finalPrice.toFixed(2)}€
                                            </p>
                                        </div>

                                        {/* Base price line */}
                                        <p className="text-sm text-slate-500 mb-2 font-medium">Prix de base: {item.price.toFixed(2)}€</p>

                                        {/* Toppings - compact */}
                                        {Object.keys(toppingsByCategory).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Object.entries(toppingsByCategory).map(([cat, tops]) => (
                                                    tops.map((tp, tIdx) => (
                                                        <span
                                                            key={`${cat}-${tIdx}`}
                                                            className="inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm"
                                                        >
                                                            {tp.name}
                                                            {tp.price > 0 && (
                                                                <span className="text-red-500 font-bold">+{tp.price.toFixed(2)}€</span>
                                                            )}
                                                        </span>
                                                    ))
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── CUSTOMER & PROMOTIONS DETAILS DROPDOWN ────────────────────────── */}
                    <div className="px-5 py-4">
                        <button
                            onClick={() => setIsCustomerDetailsOpen(!isCustomerDetailsOpen)}
                            className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors p-3 rounded-xl border border-slate-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </p>
                                    <p className="text-xs text-slate-500">Informations client</p>
                                </div>
                            </div>
                            {isCustomerDetailsOpen ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {isCustomerDetailsOpen && (
                            <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 duration-200 fade-in">
                                {/* Customer Info */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={`tel:${order.customer.phone}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            {order.customer.phone}
                                        </a>
                                        <button
                                            onClick={copyPhone}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                            title="Copier le numéro"
                                        >
                                            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-600 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        {order.customer.email}
                                    </p>

                                    {/* Delivery address */}
                                    {isDelivery && order.address && (
                                        <div className="pt-3 mt-3 border-t border-slate-100">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    <MapPin className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900">{order.address.street}</p>
                                                        <p className="text-xs text-slate-500">{order.address.zipCode} {order.address.city}</p>
                                                        {order.address.instructions && (
                                                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                                <p className="text-xs text-amber-700">
                                                                    <span className="font-bold">📝 Note:</span> {order.address.instructions}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${order.address.street}, ${order.address.zipCode} ${order.address.city}`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0 flex flex-col items-center justify-center gap-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                                                    title="Ouvrir dans Google Maps"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Itinéraire</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Promotions Inline Badges (Always visible) */}
                        {(order.promoCode || (order.appliedCampaignIds && order.appliedCampaignIds.length > 0)) && (
                            <div className="mt-4 bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-2">
                                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <Gift className="w-3.5 h-3.5" /> Promotions Appliquées
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {/* Promo Code */}
                                    {order.promoCode && (
                                        <span className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm">
                                            <span className="font-black">{order.promoCode}</span>
                                            {promoCodes && (
                                                <span className="text-slate-500 text-[10px] border-l border-red-100 pl-1.5 ml-0.5">
                                                    {promoCodes.find(p => p.code === order.promoCode)?.description || 'Code promo'}
                                                </span>
                                            )}
                                        </span>
                                    )}

                                    {/* Automatic Campaigns */}
                                    {order.appliedCampaignIds && order.appliedCampaignIds.length > 0 && campaigns && (
                                        order.appliedCampaignIds.map((campaignId: string) => {
                                            const campaign = campaigns.find(c => c._id === campaignId);
                                            if (!campaign) return null;
                                            return (
                                                <span key={campaignId} className="inline-flex items-center gap-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm">
                                                    <span className="font-black uppercase text-[10px] bg-amber-100 px-1 py-0.5 rounded">Auto</span>
                                                    {campaign.description || 'Campagne'}
                                                </span>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ────────────────────────── */}
                <div className="border-t border-slate-200 bg-white">

                    {/* Total */}
                    <div className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isConfirmingDelete ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-red-600">Supprimer ?</span>
                                    <button
                                        onClick={() => onDeleteOrder(order._id)}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    >
                                        Oui
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        Non
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {onReprint && (
                                        <button
                                            onClick={() => onReprint(order._id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-200"
                                            title="Imprimer reçu"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            Imprimer
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (!adminToken) return;
                                            try {
                                                await downloadInvoice({ orderId: order._id, adminToken });
                                            } catch (e: any) {
                                                alert(e?.message ?? "Erreur lors de la génération de la facture");
                                            }
                                        }}
                                        disabled={!adminToken || downloadingId === order._id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
                                        title="Télécharger la facture PDF"
                                    >
                                        <FileDown className="w-3.5 h-3.5" />
                                        {downloadingId === order._id ? '…' : 'Facture'}
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-slate-500 font-medium">Total</span>
                            <span className="text-3xl font-black text-slate-900 tabular-nums">{order.totalPrice.toFixed(2)}€</span>
                        </div>
                    </div>

                    {/* Next action button */}
                    {nextStatus && nextConfig && (
                        <div className="px-5 pb-5 pt-1">
                            <button
                                onClick={async () => {
                                    if (isPending && nextStatus === 'preparing') {
                                        await onStatusChange(order._id, 'preparing', {
                                            prepTimeMinutes: pickedPrep,
                                        });
                                    } else {
                                        onStatusChange(order._id, nextStatus);
                                    }
                                }}
                                className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                                    isPending
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                }`}
                            >
                                {(() => {
                                    const NextIcon = nextConfig.icon;
                                    return <NextIcon className="w-5 h-5" />;
                                })()}
                                {nextStatus === 'preparing'
                                    ? 'Accepter & Préparer'
                                    : nextStatus === 'ready'
                                        ? 'Marquer Prête'
                                        : nextStatus === 'delivering'
                                            ? 'Mettre en Livraison'
                                            : 'Marquer Terminée'}
                            </button>
                            {isPending && (
                                <button
                                    onClick={() => onStatusChange(order._id, 'cancelled')}
                                    className="w-full mt-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors border border-red-100"
                                >
                                    <XCircle className="w-4 h-4 inline mr-2" />
                                    Refuser la commande
                                </button>
                            )}
                        </div>
                    )}

                    {order.status === 'completed' && (
                        <div className="px-5 pb-5 pt-1">
                            <div className="w-full py-3 rounded-xl text-center text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                Commande terminée ✓
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
