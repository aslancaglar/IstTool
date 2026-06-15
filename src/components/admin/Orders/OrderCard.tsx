"use client";

import { Clock, Package, CheckCircle, XCircle, User, Truck, ShoppingBag, CreditCard, Banknote, ChevronRight, ArrowRight, Utensils } from 'lucide-react';

interface OrderCardProps {
    order: any;
    onClick: (orderId: string) => void;
    onStatusChange?: (orderId: string, status: string) => void;
}

export default function OrderCard({ order, onClick, onStatusChange }: OrderCardProps) {
    const isDelivery = order.type === 'delivery';
    const isDineIn = order.type === 'dine_in';

    const statusConfig: Record<string, { bg: string; text: string; border: string; accent: string; barBg: string; icon: any; label: string }> = {
        pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-l-amber-500',   accent: 'bg-amber-500',   barBg: 'bg-amber-50/80',   icon: Clock,        label: 'EN ATTENTE' },
        preparing:  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-l-blue-500',    accent: 'bg-blue-500',    barBg: 'bg-blue-50/80',    icon: Package,      label: 'EN PRÉPARATION' },
        ready:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', accent: 'bg-emerald-500', barBg: 'bg-emerald-50/80', icon: ShoppingBag,  label: 'PRÊTE' },
        delivering: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-l-violet-500',  accent: 'bg-violet-500',  barBg: 'bg-violet-50/80',  icon: Truck,        label: 'EN LIVRAISON' },
        completed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', accent: 'bg-emerald-500', barBg: 'bg-emerald-50/80', icon: CheckCircle,  label: 'TERMINÉE' },
        cancelled:  { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-l-slate-400',   accent: 'bg-slate-400',   barBg: 'bg-slate-50',      icon: XCircle,      label: 'ANNULÉE' },
    };

    // Flow depends on order type
    const FLOW_PICKUP    = ['pending', 'preparing', 'ready', 'completed'];
    const FLOW_DELIVERY  = ['pending', 'preparing', 'ready', 'delivering', 'completed'];
    const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;

    const currentIdx = flow.indexOf(order.status);
    const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;

    const nextBtnConfig: Record<string, { label: string; classes: string; icon: any }> = {
        preparing:  { label: 'Accepter & Préparer',   classes: 'bg-emerald-600 hover:bg-emerald-700 text-white',     icon: Package },
        ready:      { label: 'Marquer Prête',         classes: 'bg-emerald-600 hover:bg-emerald-700 text-white',     icon: ShoppingBag },
        delivering: { label: 'Mettre en Livraison',   classes: 'bg-violet-600 hover:bg-violet-700 text-white',       icon: Truck },
        completed:  { label: 'Marquer Terminée',       classes: 'bg-emerald-600 hover:bg-emerald-700 text-white',     icon: CheckCircle },
    };

    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const isPending = order.status === 'pending';
    const isCompleted = order.status === 'completed';
    const isCancelled = order.status === 'cancelled';
    const isActive = !isCompleted && !isCancelled;

    const timeSince = () => {
        const now = new Date();
        const created = new Date(order.createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'À l\'instant';
        if (diffMin < 60) return `il y a ${diffMin} min`;
        const diffH = Math.floor(diffMin / 60);
        return `il y a ${diffH}h${diffMin % 60 > 0 ? `${diffMin % 60}m` : ''}`;
    };

    const itemSummary = order.items?.map((item: any) => {
        const toppingCount = item.selectedToppings?.reduce((acc: number, g: any) => acc + (g.toppingIds?.length || 0), 0) || 0;
        return { name: item.name, toppingCount };
    }) || [];

    return (
        <div
            className={`relative w-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-l-4 ${config.border} ${isPending ? 'ring-2 ring-amber-200 shadow-amber-100/50 shadow-md' : ''}`}
        >
            {/* Main card area — clicking opens modal */}
            <div className="p-4 sm:p-5" onClick={() => onClick(order._id)}>
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                            #{order._id.slice(-6).toUpperCase()}
                        </span>
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {order.paymentMethod === 'cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {order.paymentStatus === 'paid' ? 'Payé' : 'À payer'}
                        </span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                        <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                            {order.totalPrice.toFixed(2)}€
                        </p>
                        {order.discountAmount > 0 && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                -{order.discountAmount.toFixed(2)}€
                            </span>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {itemSummary.map((item: any, i: number) => (
                        <span key={`${item.name}-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                            {item.name}
                            {item.toppingCount > 0 && (
                                <span className="text-[9px] bg-slate-200 text-slate-500 rounded px-1 font-bold">+{item.toppingCount}</span>
                            )}
                        </span>
                    ))}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm text-slate-500 min-w-0">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{order.customer?.firstName} {order.customer?.lastName}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-xs shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeSince()}
                        </span>
                        {isActive && order.prepTimeMinutes != null && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 shrink-0">
                                    ~{order.prepTimeMinutes + (isDelivery ? (order.deliveryTimeMinutes ?? 0) : 0)} min
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${config.bg} ${config.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Inline action bar — only for active orders */}
            {isActive && onStatusChange && (
                <div className={`flex items-center border-t border-slate-100 ${config.barBg}`}>
                    {/* Primary next-step button */}
                    {nextStatus && nextBtnConfig[nextStatus] && (() => {
                        const btn = nextBtnConfig[nextStatus];
                        const BtnIcon = btn.icon;
                        const isAcceptStep = isPending && nextStatus === 'preparing';
                        return (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAcceptStep) {
                                        onClick(order._id);
                                    } else {
                                        onStatusChange(order._id, nextStatus);
                                    }
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${btn.classes}`}
                            >
                                <BtnIcon className="w-3.5 h-3.5" />
                                {btn.label}
                            </button>
                        );
                    })()}

                    {/* Divider */}
                    {nextStatus && <div className="w-px h-8 bg-black/10 shrink-0" />}

                    {/* Cancel button */}
                    {!isCancelled && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onStatusChange(order._id, 'cancelled'); }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Annuler
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

