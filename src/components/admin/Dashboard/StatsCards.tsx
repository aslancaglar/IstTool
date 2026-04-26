"use client";

import { Tag, Pizza, UtensilsCrossed, ShoppingCart, LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

interface StatsCardsProps {
    categoriesCount: number;
    menuItemsCount: number;
    toppingCategoriesCount: number;
    ordersCount: number;
}

export default function StatsCards({
    categoriesCount,
    menuItemsCount,
    toppingCategoriesCount,
    ordersCount
}: StatsCardsProps) {
    const stats = [
        {
            label: 'Total des Catégories',
            value: categoriesCount,
            icon: Tag,
            color: 'bg-blue-500',
        },
        {
            label: 'Total des Articles',
            value: menuItemsCount,
            icon: Pizza,
            color: 'bg-green-500',
        },
        {
            label: 'Catégories (Garnitures)',
            value: toppingCategoriesCount,
            icon: UtensilsCrossed,
            color: 'bg-yellow-500',
        },
        {
            label: 'Total des Commandes',
            value: ordersCount,
            icon: ShoppingCart,
            color: 'bg-red-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}
