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
          src="/cover33.jpg"
          alt="Resto Istanbul Background"
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
            <h1 className="sr-only">Resto Istanbul, votre restaurant de kebab, tacos et burgers à Toul</h1>
            <h2 
              style={{ 
                fontFamily: '"Bebas Neue Pro", "Bebas Neue", sans-serif', 
                fontWeight: 900, 
                textShadow: '3px 3px 0px #000, 0 4px 10px rgba(0,0,0,0.5)'
              }} 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[86px] tracking-wide leading-tight mb-3 text-white uppercase"
            >
              Bienvenue chez<br />
              Resto Istanbul&nbsp;!
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              Installez-vous ou prenez votre repas à emporter et profitez de notre large choix de saveurs : kebabs traditionnels, tacos gourmands, assiettes copieuses et bien plus encore. Le point de rendez-vous des vrais gourmands.
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
                href="tel:0782814656"
                className="font-display text-xl tracking-wide inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-dark-900 transition-all"
              >
                <Phone className="w-5 h-5" />
                07 82 81 46 56
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
