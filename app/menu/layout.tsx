import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notre Carte | Pizzas, Burgers & Tacos à Metz',
    description: 'Découvrez la carte de Resto Istanbul à Metz : plats savoureux, burgers, tacos, salades et desserts. Commandez en ligne pour la livraison ou le click & collect à Metz.',
    alternates: {
        canonical: 'https://mondopizza.fr/menu',
    },
    openGraph: {
        title: 'Notre Carte | Resto Istanbul Metz',
        description: 'Plats savoureux, burgers, tacos et plus encore. Commandez en ligne sur Resto Istanbul Metz.',
        url: 'https://mondopizza.fr/menu',
    },
};


export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
