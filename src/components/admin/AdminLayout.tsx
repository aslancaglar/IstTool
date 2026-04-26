"use client";
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  Pizza,
  Tag,
  UtensilsCrossed,
  Settings,
  ShoppingCart,
  Package,
  Menu as MenuIcon,
  X,
  LogOut,
  Layers,
  Star,
  Image,
  Globe,
  User,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedState) {
      setDesktopSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleDesktopSidebar = () => {
    const newState = !desktopSidebarCollapsed;
    setDesktopSidebarCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  const { admin, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Utilisateurs', icon: User },
    { path: '/admin/categories', label: 'Catégories', icon: Tag },
    { path: '/admin/menu-items', label: 'Articles', icon: Pizza },
    { path: '/admin/topping-categories', label: 'Catégories (Garnitures)', icon: Layers },
    { path: '/admin/toppings', label: 'Garnitures', icon: UtensilsCrossed },
    { path: '/admin/platform-prices', label: 'Prix des Plateformes', icon: Globe },
    { path: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { path: '/admin/kds', label: 'KDS Kanban', icon: Package },
    { path: '/admin/reviews', label: 'Avis', icon: Star },
    { path: '/admin/gallery', label: 'Galerie', icon: Image },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${desktopSidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">Administration</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-slate-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white">{admin?.username}</p>
              <p className="text-xs text-slate-400">Administrateur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ease-in-out ${desktopSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
              >
                <MenuIcon className="w-6 h-6" />
              </button>

              <button
                onClick={toggleDesktopSidebar}
                className="hidden lg:block text-slate-600 hover:text-slate-900"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Bonjour, <span className="font-semibold text-slate-900">{admin?.username}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
    </div>
  );
}
