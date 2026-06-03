"use client";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { quickLinks } from '../data/footer';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image'; // Added this import

export default function Footer() {
  const restaurantInfo = useQuery(api.restaurantInfo.get);

  // Fallback or derived values
  const hours = restaurantInfo?.hours || [];
  const socialLinks = restaurantInfo?.socialLinks || {};

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-dark-950" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <a href="#accueil" className="inline-flex mb-3">
              {/* Logo */}
              <div className="relative w-[100px] h-[100px]">
                <Image
                  src="/logo-istanbul-kebab.png"
                  alt="Resto Istanbul Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </a>
            <h2 className="font-display text-3xl tracking-wider text-white mb-4">RESTO ISTANBUL</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Le vrai goût de la cuisine authentique. Des saveurs exceptionnelles préparées avec passion depuis plus de 25 ans.
            </p>
            <div className="flex gap-3">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-normal text-white mb-6">Liens Rapides</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-display font-normal text-white mb-6">Horaires</h3>
            {hours.length > 0 ? (
              <ul className="space-y-3">
                {hours.map((item, index) => (
                  <li key={index} className="text-gray-400">
                    <span className="block font-medium text-gray-300">
                      {item.day}
                    </span>
                    <span>{item.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Chargement...</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-display font-normal text-white mb-6">Contact</h3>
            {restaurantInfo ? (
              <ul className="space-y-3 text-gray-400">
                {restaurantInfo.address && (
                  <li>{restaurantInfo.address}</li>
                )}
                {restaurantInfo.phone && (
                  <li>
                    <a
                      href={`tel:${restaurantInfo.phone.replace(/\s/g, '')}`}
                      className="hover:text-primary-500 transition-colors"
                    >
                      {restaurantInfo.phone}
                    </a>
                  </li>
                )}
                {restaurantInfo.email && (
                  <li>
                    <a
                      href={`mailto:${restaurantInfo.email}`}
                      className="hover:text-primary-500 transition-colors"
                    >
                      {restaurantInfo.email}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-gray-400">Chargement...</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} <span style={{ fontFamily: '"Titan One", cursive' }}>Resto Istanbul</span>. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
