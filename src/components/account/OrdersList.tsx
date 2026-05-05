"use client";

import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrdersListProps {
  orders: any[] | undefined;
  onSelect: (orderId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersList({ orders, onSelect }: OrdersListProps) {
  const router = useRouter();

  return (
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
              onClick={() => onSelect(order._id)}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
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
  );
}
