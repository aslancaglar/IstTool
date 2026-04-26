"use client";

interface RecentOrdersProps {
    orders: any[] | undefined;
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Commandes Récentes</h2>
            {orders && orders.length > 0 ? (
                <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                        <div
                            key={order._id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                            <div>
                                <p className="font-medium text-slate-900">Commande #{order._id.slice(-6)}</p>
                                <p className="text-sm text-slate-600">{order.items.length} articles</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">{order.totalPrice.toFixed(2)}€</p>
                                <span
                                    className={`text-xs px-2 py-1 rounded ${order.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}
                                >
                                    {order.status === 'pending' ? 'En attente' : order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500">Aucune commande</p>
            )}
        </div>
    );
}
