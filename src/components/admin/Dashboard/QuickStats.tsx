"use client";

interface QuickStatsProps {
    pendingOrders: number;
    activeMenuItemsCount: number;
    popularItemsCount: number;
}

export default function QuickStats({
    pendingOrders,
    activeMenuItemsCount,
    popularItemsCount
}: QuickStatsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Statistiques Rapides</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Commandes en attente</span>
                    <span className="font-bold text-slate-900">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Articles Actifs</span>
                    <span className="font-bold text-slate-900">{activeMenuItemsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Articles Populaires</span>
                    <span className="font-bold text-slate-900">{popularItemsCount}</span>
                </div>
            </div>
        </div>
    );
}
