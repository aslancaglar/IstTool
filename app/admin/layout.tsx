import type { Metadata, Viewport } from 'next';
import AdminAuthLayout from '../../src/components/admin/AdminAuthLayout';

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

export const metadata: Metadata = {
    title: {
        default: 'Administration — Mondo Pizza',
        template: '%s | Admin Mondo Pizza',
    },
    description: "Tableau de bord d'administration Mondo Pizza",
    manifest: '/admin-manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'MondoAdmin',
    },
    icons: {
        icon: '/pwaicon.png',
        apple: '/pwaicon.png',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return <AdminAuthLayout>{children}</AdminAuthLayout>;
}
