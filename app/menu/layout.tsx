import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notre Carte | Mondo Pizza',
    description: 'Découvrez notre carte de kebabs, sandwichs, assiettes et spécialités turques. Viandes fraîches et recettes traditionnelles à Florange.',
};

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
