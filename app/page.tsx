import type { Metadata } from 'next';
import Hero from '../src/components/Hero';
import About from '../src/components/About';
import Menu from '../src/components/Menu';
import Reviews from '../src/components/Reviews';
import Gallery from '../src/components/Gallery';
import Contact from '../src/components/Contact';
import AppLoaderWrapper from '../src/components/AppLoaderWrapper';

export const metadata: Metadata = {
    title: 'Resto Istanbul Toul | Kebab, Tacos & Burgers à Toul',
    description: 'Resto Istanbul, le meilleur restaurant de kebab, tacos et burgers à Toul ! Plats savoureux, Durum -Wrap, Assiettes, Bowls, et click & collect. Commandez en ligne maintenant.',
    alternates: {
        canonical: 'https://mondopizza.fr',
    },
};



export default function HomePage() {
    return (
        <AppLoaderWrapper>
            <Hero />
            <About />
            <Menu showHeader={true} reducedHeaderSpacing={true} />
            <Reviews />
            <Gallery />
            <Contact />
        </AppLoaderWrapper>
    );
}
