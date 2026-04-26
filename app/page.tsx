import Hero from '../src/components/Hero';
import About from '../src/components/About';
import Menu from '../src/components/Menu';
import Reviews from '../src/components/Reviews';
import Gallery from '../src/components/Gallery';
import Contact from '../src/components/Contact';
import AppLoaderWrapper from '../src/components/AppLoaderWrapper';

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
