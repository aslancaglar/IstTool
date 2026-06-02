import type { Metadata, Viewport } from 'next';
import AdminAuthLayout from '../../src/components/admin/AdminAuthLayout';

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

export const metadata: Metadata = {
    title: {
        default: 'Administration — Resto Istanbul',
        template: '%s | Admin Resto Istanbul',
    },
    description: "Tableau de bord d'administration Resto Istanbul",
    manifest: '/admin-manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'IstanbulAdmin',
    },
    icons: {
        icon: '/pwaicon2.png',
        apple: '/pwaicon2.png',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return <AdminAuthLayout>{children}</AdminAuthLayout>;
}
