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
        default: 'Resto Istanbul Toul | Kebab, Tacos, Burgers à Toul',
        template: '%s | Resto Istanbul Toul',
    },
    description: 'Resto Istanbul à Toul : Kebab, Tacos, burger, Durum -Wrap, Assiettes, Bowls et plus. Ingrédients de qualité. Commandez en ligne à emporter ! ☎ 07 82 81 46 56',
    keywords: [
        'kebab toul',
        'tacos toul',
        'burger toul',
        'commander kebab toul',
        'kebab authentique toul',
        'meilleur kebab toul',
        'durum toul',
        'assiettes toul',
        'bowls toul',
        'restaurant fast food toul',
        'resto istanbul',
        'resto istanbul toul',
    ],
    authors: [{ name: 'Resto Istanbul Toul' }],
    creator: 'Resto Istanbul',
    publisher: 'Resto Istanbul',
    alternates: {
        canonical: 'https://mondopizza.fr',
    },
    icons: {
        icon: '/logo-istanbul-kebab.png',
        shortcut: '/logo-istanbul-kebab.png',
        apple: '/logo-istanbul-kebab.png',
    },
    openGraph: {
        title: 'Resto Istanbul Toul | Kebab, Tacos, Burgers',
        description: 'Resto Istanbul à Toul : Kebab, Tacos, burger, Durum -Wrap, Assiettes, Bowls et plus. Ingrédients de qualité. Commandez en ligne à emporter !',
        url: 'https://mondopizza.fr/',
        siteName: 'Resto Istanbul Toul',
        images: [{
            url: '/MondoHeroImage-min.jpg',
            width: 1200,
            height: 630,
            alt: 'Resto Istanbul Toul - Kebab, Tacos, Burgers',
        }],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Resto Istanbul Toul | Kebab, Tacos, Burgers',
        description: 'Resto Istanbul à Toul : Kebab, Tacos, burger, Durum -Wrap, Assiettes, Bowls et plus. Commandez en ligne !',
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
                            name: 'Resto Istanbul Toul',
                            image: 'https://mondopizza.fr/MondoHeroImage-min.jpg',
                            url: 'https://mondopizza.fr',
                            telephone: '+33782814656',
                            priceRange: '€€',
                            servesCuisine: ['Kebab', 'Tacos', 'Burger', 'Turkish', 'Fast Food'],
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '20 Rue Saint-Pierre',
                                addressLocality: 'Toul',
                                postalCode: '54200',
                                addressRegion: 'Meurthe-et-Moselle',
                                addressCountry: 'FR',
                            },
                            geo: {
                                '@type': 'GeoCoordinates',
                                latitude: 48.6750,
                                longitude: 5.8881,
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
