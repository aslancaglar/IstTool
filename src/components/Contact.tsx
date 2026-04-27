"use client";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import FadeIn from './FadeIn';

export default function Contact() {
  const restaurantInfo = useQuery(api.restaurantInfo.get);

  if (!restaurantInfo) {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-primary-700 font-semibold mb-2">Contactez-nous</p>
            <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-4xl md:text-5xl text-gray-900 mb-6 tracking-wide uppercase">
              Nous Trouver
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Venez nous rendre visite ou passez commande par téléphone. Nous serons ravis de vous accueillir !
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-12">
          <FadeIn delay={200} className="grid md:grid-cols-2 gap-8">
            {/* Box 1 : Coordonnées */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Adresse</h3>
                  <p className="text-gray-600 whitespace-pre-line mt-1">{restaurantInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Téléphone</h3>
                  <a href={`tel:${restaurantInfo.phone?.replace(/\s/g, '')}`} className="text-gray-600 hover:text-primary-500 transition-colors mt-1 block">
                    {restaurantInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="break-all">
                  <h3 className="text-lg font-bold text-gray-900">Email</h3>
                  <a href={`mailto:${restaurantInfo.email}`} className="text-gray-600 hover:text-primary-500 transition-colors mt-1 block">
                    {restaurantInfo.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2 : Horaires */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Horaires</h3>
              </div>
              <div className="space-y-3">
                {restaurantInfo.hours?.map((h, index) => (
                  <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-800">{h.day}</span>
                    <span className="text-gray-600 text-right">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={400} className="relative w-full h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 bg-gray-200 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <iframe
                src={`https://maps.google.com/maps?width=100%25&height=600&hl=fr&q=${encodeURIComponent(restaurantInfo.address + ' Mondo Pizza')}&t=&z=15&ie=UTF8&iwloc=B&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mondo Pizza Restaurant Location"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
