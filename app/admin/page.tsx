"use client";

import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import Link from 'next/link';
import { api } from '../../convex/_generated/api';
import StatsCards from '../../src/components/admin/Dashboard/StatsCards';
import RecentOrders from '../../src/components/admin/Dashboard/RecentOrders';
import QuickStats from '../../src/components/admin/Dashboard/QuickStats';
import { useAdminAuth } from '../../src/context/AdminAuthContext';
import { Package } from 'lucide-react';

export default function DashboardPage() {
  const { adminToken } = useAdminAuth();
  const categories = useQuery(api.categories.list);
  const menuItems = useQuery(api.menuItems.list);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const orders = useQuery(api.queries.getAllOrders, adminToken ? { adminToken } : "skip");

  const pendingOrders = useMemo(() =>
    orders?.filter((order) => order.status === 'pending').length || 0,
    [orders]
  );

  const activeMenuItemsCount = useMemo(() =>
    menuItems?.filter((item) => item.active !== false).length || 0,
    [menuItems]
  );

  const popularItemsCount = useMemo(() =>
    menuItems?.filter((item) => item.popular === true).length || 0,
    [menuItems]
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue dans l'interface d'administration de votre restaurant</p>
          <Link
            href="/admin/kds"
            className="mt-4 inline-flex items-center gap-2 bg-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            <Package className="w-4 h-4" />
            Ouvrir KDS Kanban
          </Link>
        </div>

        <StatsCards
          categoriesCount={categories?.length || 0}
          menuItemsCount={menuItems?.length || 0}
          toppingCategoriesCount={toppingCategories?.length || 0}
          ordersCount={orders?.length || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders orders={orders} />
          <QuickStats
            pendingOrders={pendingOrders}
            activeMenuItemsCount={activeMenuItemsCount}
            popularItemsCount={popularItemsCount}
          />
        </div>
      </div>
    </>
  );
}
