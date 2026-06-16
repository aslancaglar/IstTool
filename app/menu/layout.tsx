import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notre Carte – Kebab, Tacos & Burger',
    description: 'Découvrez la carte de Resto Istanbul à Toul : kebabs, tacos, burgers, durum, assiettes et bowls. Commandez en ligne en click & collect à Toul.',
    alternates: {
        canonical: 'https://restoistanbultoul.fr/menu',
    },
    openGraph: {
        title: 'Notre Carte – Kebab, Tacos & Burger à Toul | Resto Istanbul',
        description: 'Kebab, tacos, burger, durum, assiettes et bowls à Toul. Commandez en ligne en click & collect sur Resto Istanbul.',
        url: 'https://restoistanbultoul.fr/menu',
    },
};


export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
