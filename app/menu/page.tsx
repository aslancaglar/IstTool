"use client";


import { useEffect } from 'react';

import Image from 'next/image';
import AppLoaderWrapper from '../../src/components/AppLoaderWrapper';


import MenuFull from '../../src/components/MenuFull';

export default function MenuPage() {
    useEffect(() => {

        window.scrollTo(0, 0);
    }, []);

    return (
        <AppLoaderWrapper>
            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative h-[25vh] min-h-[220px] md:h-[35vh] md:min-h-[280px] pt-[72px] md:pt-[88px] pb-0 flex flex-col justify-center overflow-hidden">
                    <div className="absolute inset-0">


                        <Image
                            src="/cover33.jpg"
                            alt="Resto Istanbul Background"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />


                        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
                    </div>

                    <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-3 tracking-wide uppercase">
                            Notre Carte
                        </h1>
                    </div>
                </section>

                <MenuFull />
            </div>
        </AppLoaderWrapper>
    );
}
