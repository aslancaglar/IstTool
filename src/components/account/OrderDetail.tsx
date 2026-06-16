"use client";

import { ArrowLeft, CheckCircle2, ChevronDown, FileDown, MapPin, Star, Store, Truck, User as UserIcon, Utensils } from 'lucide-react';
import { CancelledX, CompletedCheck, CookingPot, DeliveryScooter, PulsingClock, ReadyBag } from './StatusIcons';
import { useInvoiceDownload } from '../../hooks/useInvoiceDownload';

interface OrderDetailProps {
  order: any;
  user: { firstName?: string; lastName?: string; phone?: string; email?: string };
  sessionToken: string | null;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onBack: () => void;
  onLeaveReview: () => void;
}

const FLOW_PICKUP = ['pending', 'preparing', 'ready', 'completed'];
const FLOW_DELIVERY = ['pending', 'preparing', 'ready', 'delivering', 'completed'];
const STEP_LABELS: Record<string, string> = { pending: 'Reçue', preparing: 'Préparation', ready: 'Prêt', delivering: 'Livraison', completed: 'Terminée' };

const STATUS_CONF: Record<string, { icon: React.FC; title: string; subtitle: string; bg: string; accent: string; text: string; dot: string; progressBg: string }> = {
  pending:    { icon: PulsingClock,    title: 'En attente',      subtitle: 'Votre commande est en attente de confirmation.',  bg: 'from-amber-50 to-orange-50',  accent: 'text-amber-700',   text: 'text-amber-600',   dot: 'bg-amber-500',   progressBg: 'bg-amber-500' },
  preparing:  { icon: CookingPot,      title: 'En préparation',  subtitle: 'Notre chef prépare votre commande avec soin.',    bg: 'from-blue-50 to-indigo-50',   accent: 'text-blue-700',    text: 'text-blue-600',    dot: 'bg-blue-500',    progressBg: 'bg-blue-500' },
  ready:      { icon: ReadyBag,        title: 'Prête ! 🎉',       subtitle: 'Votre commande est prête ! Vous pouvez venir la récupérer.', bg: 'from-emerald-50 to-teal-50', accent: 'text-emerald-700', text: 'text-emerald-600', dot: 'bg-emerald-500', progressBg: 'bg-emerald-500' },
  delivering: { icon: DeliveryScooter, title: 'En livraison',    subtitle: 'Votre livreur est en route !',                    bg: 'from-violet-50 to-purple-50', accent: 'text-violet-700',  text: 'text-violet-600',  dot: 'bg-violet-500',  progressBg: 'bg-violet-500' },
  completed:  { icon: CompletedCheck,  title: 'Terminée',        subtitle: 'Merci et bon appétit !',                          bg: 'from-emerald-50 to-green-50', accent: 'text-emerald-700', text: 'text-emerald-600', dot: 'bg-emerald-500', progressBg: 'bg-emerald-500' },
  cancelled:  { icon: CancelledX,      title: 'Annulée',         subtitle: 'Cette commande a été annulée.',                   bg: 'from-red-50 to-rose-50',      accent: 'text-red-700',     text: 'text-red-600',     dot: 'bg-red-500',     progressBg: 'bg-red-500' },
};

export default function OrderDetail({ order, user, sessionToken, detailsOpen, onToggleDetails, onBack, onLeaveReview }: OrderDetailProps) {
  const isDelivery = order.type === 'delivery';
  const isDineIn = order.type === 'dine_in';
  const isCancelled = order.status === 'cancelled';
  const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
  const currentIdx = flow.indexOf(order.status);
  const progressPercent = isCancelled ? 0 : (currentIdx / (flow.length - 1)) * 100;
  const conf = STATUS_CONF[order.status] || STATUS_CONF.pending;
  const { download, downloadingId } = useInvoiceDownload();
  const isDownloading = downloadingId === order._id;

  const handleDownloadInvoice = async () => {
    if (!sessionToken) return;
    try {
      await download({ orderId: order._id, userToken: sessionToken });
    } catch (e: any) {
      alert(e?.message ?? "Erreur lors de la génération de la facture");
    }
  };

  const subtotal = order.items.reduce((sum: number, item: any) => sum + item.finalPrice, 0);
  const deliveryFee = isDelivery ? Math.max(0, order.totalPrice - subtotal) : 0;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux commandes
      </button>

      <div className={`bg-gradient-to-br ${conf.bg} rounded-3xl shadow-lg overflow-hidden`}>
        <div className="p-8 text-center flex flex-col items-center">
          <div className="mb-4">
            <conf.icon />
          </div>
          <h2 className={`text-2xl font-black mb-1 ${conf.accent}`}>{conf.title}</h2>
          <p className="text-slate-500 text-sm mb-1">{conf.subtitle}</p>
          <p className="text-xs text-slate-400 mt-2">
            Commande <span className="font-mono font-bold text-slate-700">#{(order._id as string).slice(-6).toUpperCase()}</span>
            {' · '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={onToggleDetails}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Articles commandés</h3>
            <span className="text-xs font-bold text-slate-500 tabular-nums">{order.items.length} {order.items.length > 1 ? 'articles' : 'article'}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`} />
        </button>
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: detailsOpen ? '800px' : '0', opacity: detailsOpen ? 1 : 0 }}
        >
          <div className="px-5 pb-5 space-y-4">
            {order.items.map((item: any, i: number) => (
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
                <span className="text-xl font-black text-slate-900 tabular-nums">{order.totalPrice.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDelivery && order.address && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <UserIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {user.phone} · {user.email}
              </p>
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-700">{order.address.street}</p>
                <p className="text-xs text-slate-400">{order.address.zipCode} {order.address.city}</p>
              </div>
            </div>

            {order.address.instructions && (
              <div className="mt-2 text-xs bg-orange-50 text-orange-700 px-3 py-2 rounded-lg font-medium border border-orange-100/50">
                <span className="font-bold mr-1">Note:</span> {order.address.instructions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isDelivery ? 'bg-violet-100' : isDineIn ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            {isDelivery ? <Truck className="w-4 h-4 text-violet-600" /> : isDineIn ? <Utensils className="w-4 h-4 text-blue-600" /> : <Store className="w-4 h-4 text-orange-600" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{isDelivery ? 'Livraison' : isDineIn ? 'Sur place' : 'À emporter'}</p>
            <p className="text-xs text-slate-400">
              {order.scheduledTime === 'asap' || !order.scheduledTime ? 'Dès que possible' : order.scheduledTime}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${order.paymentStatus === 'paid' ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <CheckCircle2 className={`w-4 h-4 ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-red-600'}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{order.paymentStatus === 'paid' ? 'Payé' : 'À payer'}</p>
            <p className="text-xs text-slate-400">{order.paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}</p>
          </div>
        </div>
      </div>

      {order.status === 'completed' && (
        <button
          onClick={onLeaveReview}
          className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-3"
        >
          <Star className="w-5 h-5" />
          Laisser un avis
        </button>
      )}

      {order.status === 'completed' && (
        <button
          onClick={handleDownloadInvoice}
          disabled={isDownloading || !sessionToken}
          className="w-full py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-4 h-4" />
          {isDownloading ? 'Génération…' : 'Télécharger la facture'}
        </button>
      )}
    </div>
  );
}
