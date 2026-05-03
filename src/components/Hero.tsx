import { ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import FadeIn from './FadeIn';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[45vh] flex items-center overflow-hidden pt-28 md:pt-28 pb-24"
    >
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

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn delay={200} className="max-w-2xl text-left">
            <h1 className="sr-only">Mondo Pizza, votre pizzeria authentique à Metz</h1>
            <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-6xl md:text-7xl lg:text-[86px] tracking-wide leading-tight mb-3 text-white uppercase text-stroke-title">
              Une bonne pizza,<br />
              <span className="text-secondary-400">ça te dit ?</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
              La pizzeria incontournable de Metz. Pizzas authentiques faites maison, livrées ou à emporter. On ne peut pas acheter le bonheur, mais nos pizzas, c'est à peu près la même chose.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/menu"
                className="font-display text-xl tracking-wide inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 uppercase"
              >
                Commander En Ligne
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:0387380945"
                className="font-display text-xl tracking-wide inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-dark-900 transition-all"
              >
                <Phone className="w-5 h-5" />
                03 87 38 09 45
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
