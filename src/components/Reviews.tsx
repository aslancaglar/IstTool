"use client";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import FadeIn from './FadeIn';
import ReviewsCarousel from './ReviewsCarousel';

export default function Reviews() {
  const reviewsData = useQuery(api.reviews.listActive);

  return (
    <section id="avis" className="py-20 relative overflow-hidden bg-warm-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-extrabold mb-2">Témoignages</p>
            <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-4xl md:text-5xl text-gray-900 mb-6 tracking-wide uppercase">
              Ce Que Disent Nos Clients
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={200} direction="up" className="relative">
          <ReviewsCarousel reviewsData={reviewsData || []} />
        </FadeIn>
      </div>
    </section>
  );
}
