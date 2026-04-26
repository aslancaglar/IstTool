"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../src/context/AdminAuthContext';
import AdminLayout from '../../src/components/admin/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, adminToken, isLoading } = useAdminAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
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

    // Login page doesn't get the sidebar layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Prevent rendering protected content while redirecting
    if (!admin || !adminToken) {
        return null;
    }

    // All other admin pages get the sidebar layout
    return <AdminLayout>{children}</AdminLayout>;
}
