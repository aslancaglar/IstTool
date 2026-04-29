import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notre Carte | Pizzas, Burgers & Tacos à Metz',
    description: 'Découvrez la carte de Mondo Pizza à Metz : pizzas artisanales à pâte fraîche, burgers, tacos, salades et desserts. Commandez en ligne pour la livraison ou le click & collect à Metz.',
    alternates: {
        canonical: 'https://mondopizza.fr/menu',
    },
    openGraph: {
        title: 'Notre Carte | Mondo Pizza Metz',
        description: 'Pizzas artisanales, burgers, tacos et plus encore. Commandez en ligne sur Mondo Pizza Metz.',
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
