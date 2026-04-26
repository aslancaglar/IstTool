import FadeIn from './FadeIn';
import Image from 'next/image';

export default function About() {
  return (
    <section id="apropos" className="py-20 relative overflow-hidden bg-warm-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn delay={100} direction="up">
            <p className="text-primary-600 font-extrabold mb-2">À Propos</p>
            <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-none tracking-wide uppercase">
              L'Incontournable<br />
              de la Pizza à Metz
            </h2>
            <div className="text-lg text-gray-700 mb-8 leading-relaxed space-y-4">
              <p>Bienvenue chez Mondo Pizza, l'adresse incontournable des amateurs de vraies pizzas à Metz !</p>
              <p>Passionnés par l'artisanat et le goût, nous préparons chaque jour notre pâte à la main et sélectionnons des ingrédients frais et de qualité pour vous offrir des recettes authentiques et généreuses. De l'incontournable Margherita à nos créations maison exclusives, chaque bouchée est une véritable invitation à la gourmandise.</p>
              <p>Savourez nos pizzas où vous le souhaitez :</p>
              <p>🍕 À emporter : Passez votre commande et venez nous rendre visite. Votre pizza vous attendra toute chaude, prête à être dévorée !</p>
              <p>🛵 En livraison : Vous préférez rester confortablement chez vous ? Profitez de notre service de livraison rapide pour déguster vos plats préférés directement à votre porte, partout dans Metz.</p>
            </div>


          </FadeIn>

          <FadeIn delay={300} direction="up" className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] min-h-[360px]">
              <Image
                src="/13692768-min.jpg"
                alt="Notre cuisine"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-3xl"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-500/20 rounded-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-500/20 rounded-3xl -z-10" />
            </div>

            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-primary-500 mb-1">25+</p>
              <p className="text-gray-700 font-medium">Années d'expérience</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
