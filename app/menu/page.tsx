"use client";


import { useEffect } from 'react';

import Image from 'next/image';
import AppLoaderWrapper from '../../src/components/AppLoaderWrapper';


import Menu from '../../src/components/Menu';

export default function MenuPage() {
    useEffect(() => {

        window.scrollTo(0, 0);
    }, []);

    return (
        <AppLoaderWrapper>
            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative h-[28vh] min-h-[200px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">


                        <Image
                            src="/MondoHeroImage-min.jpg"
                            alt="Mondo Pizza Background"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />


                        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
                    </div>

                    <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-16 md:pt-20">
                        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-3 tracking-wide uppercase">
                            Notre Carte
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-light">
                            Découvrez nos spécialités authentiques
                        </p>
                    </div>
                </section>

                <Menu reducedTopPadding={true} />
            </div>
        </AppLoaderWrapper>
    );
}
