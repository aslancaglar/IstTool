"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthModal } from '../../src/context/AuthModalContext';
import {
    User as UserIcon,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronRight,
    Star,
    Clock,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    CheckCircle2,
    Truck,
    Store,
    AlertCircle,
    ChevronDown,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ── Animated SVG icons per status ─────────────────────────── */

const PulsingClock = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5">
            <animate attributeName="r" values="34;36;34" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="40" r="28" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite" />
        </circle>
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
        <rect x="22" y="34" width="36" height="20" rx="4" fill="#3B82F6" opacity="0.9" />
        <rect x="18" y="32" width="44" height="5" rx="2.5" fill="#2563EB" />
        <rect x="14" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
        <rect x="58" y="38" width="8" height="3" rx="1.5" fill="#2563EB" />
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
        <circle cx="50" cy="50" r="46" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2.5">
            <animate attributeName="r" values="44;46;44" dur="2s" repeatCount="indefinite" />
        </circle>
        <line x1="8" y1="72" x2="92" y2="72" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.4s" repeatCount="indefinite" />
        </line>
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
        <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0.5,-1.5;0,0;-0.5,-0.5;0,0" dur="0.6s" repeatCount="indefinite" />
            <circle cx="30" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="30" cy="66" r="2" fill="#7C3AED" />
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 30 66" to="360 30 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="30" y1="61" x2="30" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="25" y1="66" x2="35" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>
            <circle cx="62" cy="66" r="6" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <circle cx="62" cy="66" r="2" fill="#7C3AED" />
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0 62 66" to="360 62 66" dur="0.35s" repeatCount="indefinite" />
                <line x1="62" y1="61" x2="62" y2="71" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
                <line x1="57" y1="66" x2="67" y2="66" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
            </g>
            <path d="M30 66 L36 56 L50 54 L58 58 L62 66" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M36 60 L44 58 L44 63 L36 64 Z" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            <ellipse cx="46" cy="54" rx="5" ry="3" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1" />
            <path d="M40 53 Q46 50 52 53" fill="#6D28D9" stroke="#5B21B6" strokeWidth="1" strokeLinecap="round" />
            <line x1="58" y1="58" x2="62" y2="66" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="48" x2="62" y2="52" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <line x1="62" y1="52" x2="58" y2="58" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="64" cy="58" r="2" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.8">
                <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <path d="M44 52 L46 42 L50 40" fill="none" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 44 L56 48" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="36" r="5" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
            <path d="M52 35 Q55 36 52 38" fill="#A78BFA" stroke="#6D28D9" strokeWidth="0.8" />
            <rect x="32" y="42" width="10" height="10" rx="2" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.2" />
            <line x1="34" y1="45" x2="40" y2="45" stroke="#C4B5FD" strokeWidth="1" />
            <line x1="34" y1="48" x2="39" y2="48" stroke="#C4B5FD" strokeWidth="1" />
        </g>
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

const CompletedCheck = () => (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
        <circle cx="40" cy="40" r="36" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
        <path d="M25 40 L35 50 L55 30" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.6s" fill="freeze" />
            <animate attributeName="stroke-dasharray" from="0 50" to="50 0" dur="0.6s" fill="freeze" />
        </path>
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

type Tab = 'profile' | 'orders';

export default function AccountPage() {
    const { user, logout, updateUser, sessionToken, isLoading } = useAuth();
    const { openLoginModal } = useAuthModal();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Queries
    const orders = useQuery(
        api.auth.listUserOrders,
        user && sessionToken ? { userId: user.id as any, sessionToken } : 'skip'
    );
    const addReview = useMutation(api.reviews.addOrderReview);
    const updateProfile = useMutation(api.auth.updateUser);

    // Profile form state
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.street || '',
        city: user?.city || '',
        zipCode: user?.zipCode || ''
    });

    const selectedOrder = useMemo(() =>
        orders?.find(o => o._id === selectedOrderId),
        [orders, selectedOrderId]);

    useEffect(() => {
        if (!isLoading && !user) {
            openLoginModal('/account');
        }
    }, [isLoading, user, openLoginModal]);

    if (isLoading || !user) {
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({
                id: user.id as any,
                sessionToken: sessionToken ?? undefined,
                ...formData
            });
            updateUser(formData);
            setIsEditing(false);
            // In a real app, AuthContext should ideally refresh or the user object should be updated.
            // For now, we rely on the database state.
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erreur lors de la mise à jour du profil.');
        }
    };

    const handleSubmitRating = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderId || !sessionToken) return;

        setIsSubmittingRating(true);
        try {
            await addReview({
                sessionToken,
                orderId: selectedOrderId as any,
                rating,
                comment,
            });
            setIsRatingOpen(false);
            setRating(5);
            setComment('');
            alert('Merci pour votre avis !');
        } catch (error: any) {
            alert(error.message || 'Une erreur est survenue.');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'preparing': return 'bg-blue-100 text-blue-700';
            case 'ready': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'preparing': return 'En préparation';
            case 'ready': return 'Prêt';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <UserIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-gray-900">
                                Bonjour, {user.firstName}
                            </h1>
                            <p className="text-gray-500">Gérez votre profil et vos commandes</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:text-red-600 transition-all border border-gray-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>

                {/* Mobile Logout Button Removed from here */}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        <button
                            onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Mes Commandes
                        </button>
                        <button
                            onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            Mon Profil
                        </button>
                        {/* Logout Option positioned with tabs */}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 group"
                        >
                            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            Se déconnecter
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'orders' ? (
                            <div className="space-y-6">
                                {selectedOrderId && selectedOrder ? (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        {/* Back button */}
                                        <button
                                            onClick={() => setSelectedOrderId(null)}
                                            className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold transition-colors text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Retour aux commandes
                                        </button>

                                        {/* Main status card */}
                                        {(() => {
                                            const isDelivery = selectedOrder.type === 'delivery';
                                            const isCancelled = selectedOrder.status === 'cancelled';
                                            const FLOW_PICKUP = ['pending', 'preparing', 'completed'];
                                            const FLOW_DELIVERY = ['pending', 'preparing', 'delivering', 'completed'];
                                            const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
                                            const currentIdx = flow.indexOf(selectedOrder.status);
                                            const progressPercent = isCancelled ? 0 : ((currentIdx) / (flow.length - 1)) * 100;

                                            const statusConf: Record<string, { icon: React.FC; title: string; subtitle: string; bg: string; accent: string; text: string; dot: string; progressBg: string }> = {
                                                pending:    { icon: PulsingClock,    title: 'En attente',          subtitle: 'Votre commande est en attente de confirmation.',  bg: 'from-amber-50 to-orange-50',    accent: 'text-amber-700',   text: 'text-amber-600',   dot: 'bg-amber-500',   progressBg: 'bg-amber-500' },
                                                preparing:  { icon: CookingPot,      title: 'En préparation',     subtitle: 'Notre chef prépare votre commande avec soin.',    bg: 'from-blue-50 to-indigo-50',     accent: 'text-blue-700',    text: 'text-blue-600',    dot: 'bg-blue-500',    progressBg: 'bg-blue-500' },
                                                delivering: { icon: DeliveryScooter, title: 'En livraison',        subtitle: 'Votre livreur est en route !',                    bg: 'from-violet-50 to-purple-50',   accent: 'text-violet-700',  text: 'text-violet-600',  dot: 'bg-violet-500',  progressBg: 'bg-violet-500' },
                                                completed:  { icon: CompletedCheck,  title: 'Terminée',             subtitle: 'Merci et bon appétit !',                          bg: 'from-emerald-50 to-green-50',   accent: 'text-emerald-700', text: 'text-emerald-600', dot: 'bg-emerald-500', progressBg: 'bg-emerald-500' },
                                                cancelled:  { icon: CancelledX,      title: 'Annulée',              subtitle: 'Cette commande a été annulée.',                   bg: 'from-red-50 to-rose-50',        accent: 'text-red-700',     text: 'text-red-600',     dot: 'bg-red-500',     progressBg: 'bg-red-500' },
                                            };

                                            const conf = statusConf[selectedOrder.status] || statusConf.pending;
                                            const stepLabels: Record<string, string> = { pending: 'Reçue', preparing: 'Préparation', delivering: 'Livraison', completed: 'Terminée' };

                                            const subtotal = selectedOrder.items.reduce((sum: number, item: any) => sum + item.finalPrice, 0);
                                            const deliveryFee = isDelivery ? Math.max(0, selectedOrder.totalPrice - subtotal) : 0;

                                            return (
                                                <>
                                                    {/* Status hero card */}
                                                    <div className={`bg-gradient-to-br ${conf.bg} rounded-3xl shadow-lg overflow-hidden`}>
                                                        <div className="p-8 text-center flex flex-col items-center">
                                                            <div className="mb-4">
                                                                <conf.icon />
                                                            </div>
                                                            <h2 className={`text-2xl font-black mb-1 ${conf.accent}`}>{conf.title}</h2>
                                                            <p className="text-slate-500 text-sm mb-1">{conf.subtitle}</p>
                                                            <p className="text-xs text-slate-400 mt-2">
                                                                Commande <span className="font-mono font-bold text-slate-700">#{(selectedOrderId as string).slice(-6).toUpperCase()}</span>
                                                                {' · '}
                                                                {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>

                                                        {!isCancelled && (
                                                            <div className="px-8 pb-8">
                                                                <div className="relative h-1.5 bg-white/60 rounded-full overflow-hidden mb-4">
                                                                    <div
                                                                        className={`absolute inset-y-0 left-0 rounded-full ${conf.progressBg} transition-all duration-1000 ease-out`}
                                                                        style={{ width: `${progressPercent}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    {flow.map((step, i) => {
                                                                        const isActive = i === currentIdx;
                                                                        const isPast = i < currentIdx;
                                                                        return (
                                                                            <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                                                                                <div className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                                                    isPast ? 'bg-emerald-500'
                                                                                    : isActive ? `${conf.dot} ring-4 ring-offset-2 ${conf.dot.replace('bg-', 'ring-')}/20`
                                                                                    : 'bg-white/80'
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
                                                                                    {isActive && <span className={`absolute -inset-1 rounded-full ${conf.dot}/20 animate-ping`} />}
                                                                                </div>
                                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                                                    isActive ? conf.text : isPast ? 'text-emerald-600' : 'text-slate-400'
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

                                                    {/* Items collapsible */}
                                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                                        <button
                                                            onClick={() => setDetailsOpen(!detailsOpen)}
                                                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Articles commandés</h3>
                                                                <span className="text-xs font-bold text-slate-500 tabular-nums">{selectedOrder.items.length} {selectedOrder.items.length > 1 ? 'articles' : 'article'}</span>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <div
                                                            className="transition-all duration-300 ease-in-out overflow-hidden"
                                                            style={{ maxHeight: detailsOpen ? '800px' : '0', opacity: detailsOpen ? 1 : 0 }}
                                                        >
                                                            <div className="px-5 pb-5 space-y-4">
                                                                {selectedOrder.items.map((item: any, i: number) => (
                                                                    <div key={i} className="flex flex-col">
                                                                        <div className="flex justify-between items-start">
                                                                            <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                                                                            <span className="text-sm font-semibold text-slate-800 tabular-nums shrink-0">{(item.price || 0).toFixed(2)}€</span>
                                                                        </div>
                                                                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                                                                            <div className="flex flex-col gap-1 mt-1.5 pl-2.5 border-l-2 border-slate-100">
                                                                                {item.selectedToppings.flatMap((g: any, gi: number) =>
                                                                                    (g.toppingNames || g.toppingIds || []).map((name: string, ti: number) => {
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

                                                                <div className="border-t border-slate-100 pt-3 space-y-2">
                                                                    {isDelivery && deliveryFee > 0 && (
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-slate-500 font-medium">Frais de livraison</span>
                                                                            <span className="font-semibold text-slate-700 tabular-nums">{deliveryFee.toFixed(2)}€</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between items-center pt-1">
                                                                        <span className="text-base font-bold text-slate-800">Total</span>
                                                                        <span className="text-xl font-black text-slate-900 tabular-nums">{selectedOrder.totalPrice.toFixed(2)}€</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Delivery address & Customer Info */}
                                                    {isDelivery && selectedOrder.address && (
                                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                <UserIcon className="w-5 h-5 text-slate-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 space-y-2">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                                        {user?.firstName} {user?.lastName}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {user?.phone} · {user?.email}
                                                                    </p>
                                                                </div>
                                                                
                                                                <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                                                    <div>
                                                                        <p className="text-sm text-slate-700">{selectedOrder.address.street}</p>
                                                                        <p className="text-xs text-slate-400">{selectedOrder.address.zipCode} {selectedOrder.address.city}</p>
                                                                    </div>
                                                                </div>

                                                                {selectedOrder.address.instructions && (
                                                                    <div className="mt-2 text-xs bg-orange-50 text-orange-700 px-3 py-2 rounded-lg font-medium border border-orange-100/50">
                                                                        <span className="font-bold mr-1">Note:</span> {selectedOrder.address.instructions}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Order info & payment */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDelivery ? 'bg-violet-100' : 'bg-orange-100'}`}>
                                                                {isDelivery ? <Truck className="w-4 h-4 text-violet-600" /> : <Store className="w-4 h-4 text-orange-600" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{isDelivery ? 'Livraison' : 'À emporter'}</p>
                                                                <p className="text-xs text-slate-400">
                                                                    {selectedOrder.scheduledTime === 'asap' || !selectedOrder.scheduledTime ? 'Dès que possible' : selectedOrder.scheduledTime}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                                <CheckCircle2 className={`w-4 h-4 ${selectedOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-red-600'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{selectedOrder.paymentStatus === 'paid' ? 'Payé' : 'À payer'}</p>
                                                                <p className="text-xs text-slate-400">{selectedOrder.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Leave review button */}
                                                    {selectedOrder.status === 'completed' && (
                                                        <button
                                                            onClick={() => setIsRatingOpen(true)}
                                                            className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                                                        >
                                                            <Star className="w-5 h-5" />
                                                            Laisser un avis
                                                        </button>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                            <h2 className="text-xl font-display font-bold text-gray-900">Historique des commandes</h2>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {orders === undefined ? (
                                                <div className="p-12 text-center text-gray-400 animate-pulse">Chargement de vos commandes...</div>
                                            ) : orders.length === 0 ? (
                                                <div className="p-12 text-center space-y-4">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                                                    </div>
                                                    <p className="text-gray-500">Vous n'avez pas encore passé de commande.</p>
                                                    <button
                                                        onClick={() => router.push('/menu')}
                                                        className="px-6 py-2 bg-red-500 text-white font-bold rounded-full text-sm"
                                                    >
                                                        Voir le menu
                                                    </button>
                                                </div>
                                            ) : (
                                                orders.map((order) => (
                                                    <div
                                                        key={order._id}
                                                        onClick={() => { setSelectedOrderId(order._id); setDetailsOpen(false); }}
                                                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                                                                <ShoppingBag className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="font-mono font-bold text-gray-900">#{(order._id as any).substring(0, 8).toUpperCase()}</p>
                                                                <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                                            <div className="text-right">
                                                                <p className="font-black text-gray-900">{order.totalPrice.toFixed(2)}€</p>
                                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">{order.items.length} {order.items.length > 1 ? 'articles' : 'article'}</p>
                                                            </div>
                                                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h2 className="text-xl font-display font-bold text-gray-900">Informations personnelles</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-red-500 font-bold hover:underline"
                                        >
                                            Modifier
                                        </button>
                                    )}
                                </div>
                                <div className="p-8">
                                    {isEditing ? (
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Prénom</label>
                                                    <input
                                                        type="text"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Nom</label>
                                                    <input
                                                        type="text"
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Téléphone</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 space-y-4">
                                                <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Adresse par défaut</h3>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 ml-1">Rue</label>
                                                    <input
                                                        type="text"
                                                        value={formData.street}
                                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                        placeholder="N° et nom de rue"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Code Postal</label>
                                                        <input
                                                            type="text"
                                                            value={formData.zipCode}
                                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            placeholder="57000"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 ml-1">Ville</label>
                                                        <input
                                                            type="text"
                                                            value={formData.city}
                                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
                                                            placeholder="Metz"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                                                >
                                                    Enregistrer les modifications
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm shrink-0">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                                        <p className="font-bold text-gray-900">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm shrink-0">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Téléphone</p>
                                                        <p className="font-bold text-gray-900">{user.phone || 'Non renseigné'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-red-500" />
                                                    Mon Adresse de Livraison
                                                </h3>
                                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                                    {user.street ? (
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-gray-900 text-lg">{user.street}</p>
                                                            <p className="text-gray-500">{user.zipCode} {user.city}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">Aucune adresse enregistrée.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {isRatingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRatingOpen(false)} />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h2 className="text-2xl font-display font-black text-gray-900">Votre avis</h2>
                            <button onClick={() => setIsRatingOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitRating} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <p className="text-center text-gray-500 font-medium">Comment s'est passée votre commande ?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-orange-400' : 'text-gray-200'}`}
                                        >
                                            <Star className={`w-10 h-10 ${star <= rating ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Commentaire</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all min-h-[120px] resize-none"
                                    placeholder="Partagez votre expérience..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingRating}
                                className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSubmittingRating ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Publier l'avis
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
