"use client";
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { api } from '../../convex/_generated/api';
import Skeleton from './Skeleton';
import FadeIn from './FadeIn';

export default function Gallery() {
  const galleryImages = useQuery(api.gallery.listActive);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-extrabold mb-2">Nos Créations</p>
            <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-4xl md:text-5xl text-gray-900 mb-6 tracking-wide uppercase">
              Galerie
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos plats préparés avec passion et des ingrédients frais de qualité.
            </p>
          </div>
        </FadeIn>

        {!galleryImages ? (
          <FadeIn delay={200} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </FadeIn>
        ) : (
          <FadeIn delay={200} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <div
                key={image._id}
                className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-lg transition-all duration-500"
              >
                <Image
                  src={image.url || ''}
                  alt={image.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-white font-bold text-xl">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </FadeIn>
        )}
      </div>
    </section>
  );
}
