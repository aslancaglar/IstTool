"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, adminToken, isLoading } = useAdminAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Register PWA service worker
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/admin-sw.js', { scope: '/admin/' })
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!isLoading && (!admin || !adminToken) && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [admin, adminToken, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-600 animate-pulse font-medium text-lg">Chargement...</div>
            </div>
        );
    }

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-600 animate-pulse font-medium text-lg">Chargement...</div>
            </div>
        );
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!admin || !adminToken) {
        return null;
    }

    return <AdminLayout>{children}</AdminLayout>;
}
