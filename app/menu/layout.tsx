import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notre Carte | Kebab, Tacos & Burgers à Toul',
    description: 'Découvrez la carte de Resto Istanbul à Toul : Kebab, Tacos, burger, Durum -Wrap, Assiettes, Bowls. Commandez en ligne pour la livraison ou le click & collect à Toul.',
    alternates: {
        canonical: 'https://mondopizza.fr/menu',
    },
    openGraph: {
        title: 'Notre Carte | Resto Istanbul Toul',
        description: 'Kebab, Tacos, burger, Durum -Wrap, Assiettes, Bowls et plus. Commandez en ligne sur Resto Istanbul Toul.',
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
