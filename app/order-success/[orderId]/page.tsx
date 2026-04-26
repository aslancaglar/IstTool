"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Package, Home, Clock, Truck, ShoppingBag, MapPin, Phone, ChevronDown } from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';

/* ── Animated SVG icons per status ─────────────────────────── */

const PulsingClock = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="28" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite" />
        </circle>
        {/* Clock face */}
        <circle cx="40" cy="40" r="3" fill="#D97706" />
        <line x1="40" y1="40" x2="40" y2="26" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="8s" repeatCount="indefinite" />
        </line>
        <line x1="40" y1="40" x2="52" y2="40" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="60s" repeatCount="indefinite" />
        </line>
    </svg>
);

const CookingPot = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Steam lines */}
        <path d="M28 30 Q28 22 32 20" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M28 30 Q28 22 32 20;M28 28 Q26 20 30 16;M28 30 Q28 22 32 20" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M40 28 Q40 20 44 18" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M40 28 Q40 20 44 18;M40 26 Q38 18 42 14;M40 28 Q40 20 44 18" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path d="M52 30 Q52 22 48 20" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <animate attributeName="d" values="M52 30 Q52 22 48 20;M52 28 Q54 20 50 16;M52 30 Q52 22 48 20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
        </path>
        {/* Pot body */}
        <rect x="22" y="34" width="36" height="20" rx="4" fill="#3B82F6" opacity="0.9" />
        <rect x="18" y="32" width="44" height="5" rx="2.5" fill="#2563EB" />
        {/* Pot handles */}
        <rect x="14" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
        <rect x="58" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
        {/* Bubbles */}
        <circle cx="32" cy="44" r="2" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="44;38;44" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="42" cy="46" r="1.5" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="46;39;46" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="43" r="1.8" fill="#93C5FD" opacity="0.6">
            <animate attributeName="cy" values="43;37;43" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="indefinite" />
        </circle>
    </svg>
);

const DeliveryScooter = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
        {/* Background circle */}
        <circle cx="50" cy="50" r="46" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2.5">
            <animate attributeName="r" values="44;46;44" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Road surface */}
        <line x1="8" y1="72" x2="92" y2="72" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.4s" repeatCount="indefinite" />
        </line>

        {/* Exhaust puffs */}
        <circle cx="22" cy="62" r="2" fill="#C4B5FD" opacity="0">
            <animate attributeName="cx" values="28;16;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;2.5;3.5" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="64" r="1.5" fill="#C4B5FD" opacity="0">
            <animate attributeName="cx" values="28;18;10" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" values="0.5;0.2;0" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="r" values="1;2;3" dur="1.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>

        {/* Motorcycle + rider group with bounce */}
        <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0.5,-1.5;0,0;-0.5,-0.5;0,0" dur="0.6s" repeatCount="indefinite" />

            {/* Rear wheel */}
            <circle cx="30" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="30" cy="66" r="2" fill="#7C3AED" />
            {/* Rear wheel spokes */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 30 66" to="360 30 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="30" y1="61" x2="30" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="25" y1="66" x2="35" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>

            {/* Front wheel */}
            <circle cx="62" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="62" cy="66" r="2" fill="#7C3AED" />
            {/* Front wheel spokes */}
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 62 66" to="360 62 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="62" y1="61" x2="62" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="57" y1="66" x2="67" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>

            {/* Motorcycle frame */}
            <path d="M30 66 L36 56 L50 54 L58 58 L62 66" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Engine block */}
            <path d="M36 60 L44 58 L44 63 L36 64 Z" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            {/* Fuel tank */}
            <ellipse cx="46" cy="54" rx="5" ry="3" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            {/* Seat */}
            <path d="M40 53 Q46 50 52 53" fill="#6D28D9" stroke="#5B21B6" strokeWidth="1" strokeLinecap="round" />
            {/* Front fork */}
            <line x1="58" y1="58" x2="62" y2="66" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            {/* Handlebar */}
            <line x1="56" y1="48" x2="62" y2="52" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <line x1="62" y1="52" x2="58" y2="58" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
            {/* Headlight */}
            <circle cx="64" cy="58" r="2" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8">
                <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite" />
            </circle>

            {/* Rider body */}
            <path d="M44 52 L46 42 L50 40" fill="none" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Rider arms to handlebar */}
            <path d="M48 44 L56 48" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" />
            {/* Rider head (helmet) */}
            <circle cx="50" cy="36" r="5" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
            {/* Helmet visor */}
            <path d="M52 35 Q55 36 52 38" fill="#A78BFA" stroke="#6D28D9" strokeWidth="0.8" />

            {/* Delivery box on back */}
            <rect x="32" y="42" width="10" height="10" rx="2" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.2" />
            <line x1="34" y1="45" x2="40" y2="45" stroke="#C4B5FD" strokeWidth="1" />
            <line x1="34" y1="48" x2="39" y2="48" stroke="#C4B5FD" strokeWidth="1" />
        </g>

        {/* Speed lines */}
        <line x1="14" y1="54" x2="22" y2="54" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="x1" values="18;10" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="24;18" dur="0.8s" repeatCount="indefinite" />
        </line>
        <line x1="12" y1="58" x2="20" y2="58" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="x1" values="16;8" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
            <animate attributeName="x2" values="22;14" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
        </line>
        <line x1="16" y1="50" x2="22" y2="50" stroke="#C4B5FD" strokeWidth="0.8" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0" dur="1s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="x1" values="20;12" dur="1s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="x2" values="26;18" dur="1s" repeatCount="indefinite" begin="0.5s" />
        </line>
    </svg>
);

const ReadyBag = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Bag */}
        <path d="M24 34 L24 58 Q24 60 26 60 L54 60 Q56 60 56 58 L56 34 Z" fill="#10B981" opacity="0.9" />
        <path d="M24 34 L56 34" stroke="#059669" strokeWidth="2" />
        {/* Handle */}
        <path d="M32 34 L32 28 Q32 22 40 22 Q48 22 48 28 L48 34" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
        {/* Checkmark */}
        <path d="M32 46 L38 52 L50 38" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dashoffset" from="30" to="0" dur="0.8s" fill="freeze" />
            <animate attributeName="stroke-dasharray" from="0 30" to="30 0" dur="0.8s" fill="freeze" />
        </path>
        {/* Sparkles */}
        <circle cx="18" cy="28" r="1.5" fill="#34D399" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="62" cy="30" r="1" fill="#34D399" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="60" cy="52" r="1.5" fill="#34D399" opacity="0">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
        </circle>
    </svg>
);

const CompletedCheck = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
        {/* Animated check */}
        <path d="M25 40 L35 50 L55 30" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.6s" fill="freeze" />
            <animate attributeName="stroke-dasharray" from="0 50" to="50 0" dur="0.6s" fill="freeze" />
        </path>
        {/* Celebration particles */}
        <circle cx="15" cy="20" r="2" fill="#34D399">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="1;2.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="65" cy="18" r="1.5" fill="#F59E0B">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="68" cy="55" r="2" fill="#3B82F6">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </circle>
        <circle cx="12" cy="58" r="1.5" fill="#EC4899">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
        </circle>
    </svg>
);

const CancelledX = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2.5" />
        <line x1="28" y1="28" x2="52" y2="52" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1="28" x2="28" y2="52" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

/* ── Status config ────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, {
    icon: React.FC;
    title: string;
    subtitle: string;
    bg: string;
    accent: string;
    text: string;
    dot: string;
    progressBg: string;
}> = {
    pending: {
        icon: PulsingClock,
        title: "Commande reçue !",
        subtitle: "Votre commande est en attente de confirmation par le restaurant.",
        bg: "from-amber-50 to-orange-50",
        accent: "text-amber-700",
        text: "text-amber-600",
        dot: "bg-amber-500",
        progressBg: "bg-amber-500",
    },
    preparing: {
        icon: CookingPot,
        title: "En préparation 👨‍🍳",
        subtitle: "Notre chef prépare votre commande avec soin.",
        bg: "from-blue-50 to-indigo-50",
        accent: "text-blue-700",
        text: "text-blue-600",
        dot: "bg-blue-500",
        progressBg: "bg-blue-500",
    },
    delivering: {
        icon: DeliveryScooter,
        title: "En cours de livraison 🛵",
        subtitle: "Votre livreur est en route ! Il arrive bientôt.",
        bg: "from-violet-50 to-purple-50",
        accent: "text-violet-700",
        text: "text-violet-600",
        dot: "bg-violet-500",
        progressBg: "bg-violet-500",
    },
    ready: {
        icon: ReadyBag,
        title: "Prête ! 🎉",
        subtitle: "Votre commande est prête à être récupérée.",
        bg: "from-emerald-50 to-teal-50",
        accent: "text-emerald-700",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
        progressBg: "bg-emerald-500",
    },
    completed: {
        icon: CompletedCheck,
        title: "Commande terminée ✅",
        subtitle: "Merci et bon appétit ! Nous espérons vous revoir bientôt.",
        bg: "from-emerald-50 to-green-50",
        accent: "text-emerald-700",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
        progressBg: "bg-emerald-500",
    },
    cancelled: {
        icon: CancelledX,
        title: "Commande annulée",
        subtitle: "Votre commande a été annulée. Contactez-nous pour toute question.",
        bg: "from-red-50 to-rose-50",
        accent: "text-red-700",
        text: "text-red-600",
        dot: "bg-red-500",
        progressBg: "bg-red-500",
    },
};

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
    const { orderId } = params;
    const order = useQuery(api.queries.getOrder, { orderId: orderId as Id<'orders'> });
    const [elapsedMin, setElapsedMin] = useState(0);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        if (!order) return;
        const update = () => {
            const diff = Math.floor((Date.now() - order.createdAt) / 60000);
            setElapsedMin(diff);
        };
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [order]);

    if (order === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                    <p className="text-sm text-slate-500 font-medium">Chargement de votre commande…</p>
                </div>
            </div>
        );
    }

    if (order === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3 font-display">Commande introuvable</h1>
                    <p className="text-gray-600 mb-8">Le lien de confirmation est invalide ou la commande n&apos;existe plus.</p>
                    <Link
                        href="/menu"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-bold text-sm"
                    >
                        <Package className="w-4 h-4" />
                        Voir le menu
                    </Link>
                </div>
            </div>
        );
    }

    const isDelivery = order.type === 'delivery';
    const isCancelled = order.status === 'cancelled';
    const FLOW_PICKUP = ['pending', 'preparing', 'completed'];
    const FLOW_DELIVERY = ['pending', 'preparing', 'delivering', 'completed'];
    const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
    const currentIdx = flow.indexOf(order.status);
    const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusSVG = statusConf.icon;

    const stepLabels: Record<string, string> = {
        pending: 'Reçue',
        preparing: 'Préparation',
        delivering: 'Livraison',
        completed: 'Terminée',
    };

    const progressPercent = isCancelled ? 0 : ((currentIdx) / (flow.length - 1)) * 100;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${statusConf.bg} flex items-start justify-center p-4 pt-32 pb-12 transition-colors duration-700`}>
            <div className="max-w-lg w-full space-y-5">

                {/* ── Main status card ─────────────────── */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 text-center">
                        {/* Animated icon */}
                        <div className="flex justify-center mb-5">
                            <StatusSVG />
                        </div>

                        {/* Title */}
                        <h1 className={`text-2xl sm:text-3xl font-black mb-2 ${statusConf.accent}`}>
                            {statusConf.title}
                        </h1>
                        <p className="text-slate-500 text-sm mb-1">
                            {statusConf.subtitle}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            Commande <span className="font-mono font-bold text-slate-700">#{orderId?.slice(-6).toUpperCase()}</span>
                            {' · '}
                            {elapsedMin < 1 ? 'À l\'instant' : `il y a ${elapsedMin} min`}
                        </p>
                    </div>

                    {/* ── Status timeline ─────────────────── */}
                    {!isCancelled && (
                        <div className="px-8 pb-8">
                            {/* Progress bar */}
                            <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                                <div
                                    className={`absolute inset-y-0 left-0 rounded-full ${statusConf.progressBg} transition-all duration-1000 ease-out`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            {/* Step dots with labels */}
                            <div className="flex justify-between">
                                {flow.map((step, i) => {
                                    const isActive = i === currentIdx;
                                    const isPast = i < currentIdx;
                                    const isFuture = i > currentIdx;

                                    return (
                                        <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                                            <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                isPast
                                                    ? 'bg-emerald-500'
                                                    : isActive
                                                        ? `${statusConf.dot} ring-4 ring-offset-2 ${statusConf.dot.replace('bg-', 'ring-')}/20`
                                                        : 'bg-slate-200'
                                            }`}>
                                                {isPast ? (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : isActive ? (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                                ) : (
                                                    <div className="w-2 h-2 bg-slate-300 rounded-full" />
                                                )}
                                                {isActive && (
                                                    <span className={`absolute -inset-1 rounded-full ${statusConf.dot}/20 animate-ping`} />
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                isActive ? statusConf.text : isPast ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                                {stepLabels[step]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Order info card (collapsible) ──────────────────── */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Toggle header */}
                    <button
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Détails de la commande</h3>
                            <span className="text-xs font-bold text-slate-500 tabular-nums">{order.totalPrice.toFixed(2)}€</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Collapsible content */}
                    <div
                        className="transition-all duration-300 ease-in-out overflow-hidden"
                        style={{ maxHeight: detailsOpen ? '800px' : '0', opacity: detailsOpen ? 1 : 0 }}
                    >
                        <div className="px-5 pb-5 space-y-4">
                            {/* Order type */}
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDelivery ? 'bg-violet-100' : 'bg-orange-100'}`}>
                                    {isDelivery ? <Truck className="w-4 h-4 text-violet-600" /> : <ShoppingBag className="w-4 h-4 text-orange-600" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {isDelivery ? 'Livraison à domicile' : 'À emporter'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {order.scheduledTime === 'asap' || !order.scheduledTime
                                            ? 'Dès que possible'
                                            : `Prévu à ${new Date(order.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                </div>
                            </div>

                            {/* Delivery address */}
                            {isDelivery && order.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{order.address.street}</p>
                                        <p className="text-xs text-slate-400">{order.address.zipCode} {order.address.city}</p>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            {order.items && order.items.length > 0 && (
                                <div className="border-t border-slate-100 pt-4 space-y-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-semibold text-slate-800">{item.name || 'Produit'}</span>
                                                <span className="text-sm font-semibold text-slate-800 tabular-nums shrink-0">
                                                    {(item.price || 0).toFixed(2)}€
                                                </span>
                                            </div>
                                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                                <div className="flex flex-col gap-1 mt-1.5 pl-2.5 border-l-2 border-slate-100">
                                                    {item.selectedToppings.map((g: any, gi: number) =>
                                                        g.toppingNames?.map((name: string, ti: number) => {
                                                            const toppingPrice = g.toppingPrices?.[ti] || 0;
                                                            return (
                                                                <div key={`${gi}-${ti}`} className="flex justify-between items-center">
                                                                    <span className="text-xs text-slate-500 font-medium">{name}</span>
                                                                    {toppingPrice > 0 && (
                                                                        <span className="text-xs text-slate-400 tabular-nums shrink-0">+{toppingPrice.toFixed(2)}€</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Totals */}
                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                {isDelivery && (() => {
                                    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.finalPrice || 0), 0) || 0;
                                    const deliveryFee = Math.max(0, order.totalPrice - subtotal);
                                    if (deliveryFee > 0) {
                                        return (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Frais de livraison</span>
                                                <span className="font-semibold text-slate-700 tabular-nums">{deliveryFee.toFixed(2)}€</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-base font-bold text-slate-800">Total</span>
                                    <span className="text-xl font-black text-slate-900 tabular-nums">{order.totalPrice.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Actions ─────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/menu"
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors font-bold text-sm shadow-lg"
                    >
                        <Package className="w-4 h-4" />
                        Menu
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-bold text-sm shadow-lg"
                    >
                        <Home className="w-4 h-4" />
                        Accueil
                    </Link>
                </div>

                {/* Contact help */}
                <div className="text-center">
                    <p className="text-xs text-slate-400">
                        Un souci ? Appelez-nous au{' '}
                        <a href="tel:0387380945" className="font-bold text-slate-600 hover:underline">
                            03 87 38 09 45
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
