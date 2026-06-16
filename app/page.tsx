import type { Metadata } from 'next';
import Hero from '../src/components/Hero';
import About from '../src/components/About';
import Menu from '../src/components/Menu';
import Reviews from '../src/components/Reviews';
import Gallery from '../src/components/Gallery';
import Contact from '../src/components/Contact';
import AppLoaderWrapper from '../src/components/AppLoaderWrapper';

export const metadata: Metadata = {
    title: 'Kebab, Tacos, Burger & Fast Food à Toul | Resto Istanbul',
    description: 'Resto Istanbul, votre fast food à Toul : kebab, tacos, burger, durum, assiettes et bowls savoureux. Commandez en ligne en click & collect ! ☎ 07 82 81 46 56',
    alternates: {
        canonical: 'https://restoistanbultoul.fr',
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
