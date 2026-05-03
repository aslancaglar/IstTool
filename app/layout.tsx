import type { Metadata, Viewport } from 'next';
import '../src/index.css';

import ConvexClientProvider from './ConvexClientProvider';
import { AdminAuthProvider } from '../src/context/AdminAuthContext';
import { AuthProvider } from '../src/context/AuthContext';
import { OrderProvider } from '../src/context/OrderContext';

import StoreLayout from './StoreLayout';
export const viewport: Viewport = {
    themeColor: '#B91C1C',
};

export const metadata: Metadata = {
    metadataBase: new URL('https://mondopizza.fr'),
    title: {
        default: 'Mondo Pizza Metz | Pizzas Artisanales, Burgers & Livraison à Metz',
        template: '%s | Mondo Pizza Metz',
    },
    description: 'Mondo Pizza à Metz : pizzas artisanales faites maison, burgers, tacos et livraison rapide. Pâte fraîche, ingrédients de qualité. Commandez en ligne ! ☎ 03 87 38 09 45',
    keywords: [
        'pizza metz',
        'pizzeria metz',
        'pizza livraison metz',
        'commander pizza metz',
        'pizza artisanale metz',
        'meilleure pizza metz',
        'pizza maison metz',
        'restaurant pizza metz',
        'mondo pizza',
        'pizza à emporter metz',
        'pizza moselle',
        'burger metz',
        'tacos metz',
        'livraison repas metz',
    ],
    authors: [{ name: 'Mondo Pizza Metz' }],
    creator: 'Mondo Pizza',
    publisher: 'Mondo Pizza',
    alternates: {
        canonical: 'https://mondopizza.fr',
    },
    icons: {
        icon: '/LogoMondo.png',
        shortcut: '/LogoMondo.png',
        apple: '/LogoMondo.png',
    },
    openGraph: {
        title: 'Mondo Pizza Metz | Pizzas Artisanales & Livraison',
        description: 'Pizzas artisanales faites maison à Metz. Pâte fraîche, ingrédients de qualité, livraison rapide. Commandez en ligne dès maintenant !',
        url: 'https://mondopizza.fr/',
        siteName: 'Mondo Pizza Metz',
        images: [{
            url: '/MondoHeroImage-min.jpg',
            width: 1200,
            height: 630,
            alt: 'Mondo Pizza Metz - Pizzas artisanales',
        }],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mondo Pizza Metz | Pizzas Artisanales & Livraison',
        description: 'Pizzas artisanales faites maison à Metz. Commandez en ligne !',
        images: ['/MondoHeroImage-min.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: undefined,
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Restaurant',
                            name: 'Mondo Pizza',
                            image: 'https://mondopizza.fr/MondoHeroImage-min.jpg',
                            url: 'https://mondopizza.fr',
                            telephone: '+33387380945',
                            priceRange: '€€',
                            servesCuisine: ['Pizza', 'Italienne', 'Burger', 'Tacos'],
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '20 Rue Saint-Pierre',
                                addressLocality: 'Metz',
                                postalCode: '57000',
                                addressRegion: 'Moselle',
                                addressCountry: 'FR',
                            },
                            geo: {
                                '@type': 'GeoCoordinates',
                                latitude: 49.1193,
                                longitude: 6.1757,
                            },
                            openingHoursSpecification: [
                                {
                                    '@type': 'OpeningHoursSpecification',
                                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                    opens: '11:00',
                                    closes: '14:00',
                                },
                                {
                                    '@type': 'OpeningHoursSpecification',
                                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                    opens: '17:30',
                                    closes: '23:00',
                                },
                                {
                                    '@type': 'OpeningHoursSpecification',
                                    dayOfWeek: ['Saturday', 'Sunday'],
                                    opens: '17:30',
                                    closes: '23:00',
                                },
                            ],
                            hasMenu: 'https://mondopizza.fr/menu',
                            acceptsReservations: false,
                            currenciesAccepted: 'EUR',
                            paymentAccepted: 'Cash, Credit Card',
                            sameAs: [],
                        }),
                    }}
                />
            </head>
            <body>
                <ConvexClientProvider>
                    <AdminAuthProvider>
                        <AuthProvider>
                            <OrderProvider>
                                <StoreLayout>
                                    {children}
                                </StoreLayout>
                            </OrderProvider>
                        </AuthProvider>
                    </AdminAuthProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
