import type { Metadata, Viewport } from 'next';
import '../src/index.css';

import ConvexClientProvider from './ConvexClientProvider';
import { AdminAuthProvider } from '../src/context/AdminAuthContext';
import { AuthProvider } from '../src/context/AuthContext';
import { VideoProvider } from '../src/context/VideoContext';
import { OrderProvider } from '../src/context/OrderContext';

import StoreLayout from './StoreLayout';
export const viewport: Viewport = {
    themeColor: '#B91C1C',
};

export const metadata: Metadata = {
    metadataBase: new URL('https://mondopizza.fr'),
    title: 'Mondo Pizza - Le vrai goût de la pizza italienne',
    description: 'Restaurant de pizza authentique. Savourez nos pizzas fraîches et faites maison avec des ingrédients de qualité. Commandez en ligne ou sur place.',
    icons: {
        icon: '/LogoMondo.png',
        shortcut: '/LogoMondo.png',
        apple: '/LogoMondo.png',
    },
    openGraph: {
        title: 'Mondo Pizza - Le vrai goût de la pizza',
        description: 'Restaurant de pizza authentique. Savourez nos pizzas fraîches et faites maison avec des ingrédients de qualité.',
        url: 'https://mondopizza.fr/',
        siteName: 'Mondo Pizza',
        images: [{ url: '/LogoMondo.png' }],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mondo Pizza - Le vrai goût de la pizza',
        description: 'Restaurant de pizza authentique. Pizzas fraîches et faites maison.',
        images: ['/LogoMondo.png'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Titan+One&family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ConvexClientProvider>
                    <AdminAuthProvider>
                        <AuthProvider>
                            <VideoProvider>
                                <OrderProvider>
                                    <StoreLayout>
                                        {children}
                                    </StoreLayout>
                                </OrderProvider>
                            </VideoProvider>
                        </AuthProvider>
                    </AdminAuthProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
