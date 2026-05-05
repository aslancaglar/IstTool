"use client";

import { Calendar, ChevronRight, Clock, MapPin, ShoppingBag, X } from 'lucide-react';

interface UserOrdersModalProps {
  isOpen: boolean;
  user: any;
  orders: any[] | undefined;
  selectedOrder: any;
  onSelectOrder: (order: any) => void;
  onBackToList: () => void;
  onClose: () => void;
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default function UserOrdersModal({ isOpen, user, orders, selectedOrder, onSelectOrder, onBackToList, onClose }: UserOrdersModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            {selectedOrder && (
              <button
                onClick={onBackToList}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedOrder ? `Détails de la commande #${selectedOrder._id.substring(0, 8).toUpperCase()}` : 'Historique des commandes'}
              </h2>
              <p className="text-sm text-slate-500">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {selectedOrder ? <OrderDetailView order={selectedOrder} /> : <OrderListView orders={orders} onSelect={onSelectOrder} />}
        </div>
      </div>
    </div>
  );
}

function OrderListView({ orders, onSelect }: { orders: any[] | undefined; onSelect: (o: any) => void }) {
  if (orders === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <p className="text-slate-500">Aucune commande trouvée pour ce client.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
      {orders.map((order) => (
        <button
          key={order._id}
          onClick={() => onSelect(order)}
          className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">#{order._id.substring(0, 8).toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'completed' ? 'bg-green-50 text-green-600' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{order.type === 'pickup' ? 'À emporter' : 'Livraison'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-red-600">{order.totalPrice.toFixed(2)}€</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{order.paymentMethod} • {order.paymentStatus}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-600 italic truncate max-w-[80%]">
              {order.items.map((item: any) => `${item.name} (x1)`).join(', ')}
            </p>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors group-hover:translate-x-1" />
          </div>
        </button>
      ))}
    </div>
  );
}

function OrderDetailView({ order }: { order: any }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-full text-red-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Statut & Paiement</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                order.status === 'completed' ? 'bg-green-50 text-green-600' :
                order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {order.status}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-700 uppercase">{order.paymentMethod}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                order.paymentStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-red-600">{order.totalPrice.toFixed(2)}€</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Service</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{order.type === 'pickup' ? 'À emporter' : 'Livraison'}</p>
          <p className="text-xs text-slate-500 mt-1">
            Prévu pour: <span className="text-red-600 font-bold">
              {order.scheduledTime === 'asap' || !order.scheduledTime
                ? 'Dès que possible'
                : new Date(order.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {order.type === 'delivery' && order.address && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Adresse de livraison</span>
          </div>
          <div className="text-sm text-slate-700 space-y-1">
            <p className="font-bold">{order.address.street}</p>
            <p>{order.address.zipCode} {order.address.city}</p>
            {order.address.instructions && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800">
                <span className="font-bold flex items-center gap-1 mb-1"><X className="w-3 h-3 rotate-45" /> Note:</span>
                {order.address.instructions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Articles</h4>
        <div className="space-y-2">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-bold text-slate-600">1x</span>
                    <p className="font-bold text-slate-900">{item.name}</p>
                  </div>
                  {item.selectedSize && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 px-8">Taille: {item.selectedSize}</p>
                  )}
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <div className="mt-2 px-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Suppléments:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedToppings.map((group: any, gIdx: number) =>
                          (group.toppingNames || group.toppingIds).map((name: string, i: number) => {
                            const price = group.toppingPrices?.[i] ?? null;
                            return (
                              <span key={`${gIdx}-${i}`} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                                {name}
                                {price !== null && price > 0 && <span className="text-red-400 font-bold">+{price.toFixed(2)}€</span>}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-900">{item.finalPrice.toFixed(2)}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
