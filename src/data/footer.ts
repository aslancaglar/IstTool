import { Facebook, Instagram, Twitter } from 'lucide-react';

export const quickLinks = [
  { href: '/', label: 'Accueil', type: 'route' },
  { href: '/menu', label: 'Menu', type: 'route' },
  { href: '#gallery', label: 'Galerie', type: 'hash' },
  { href: '#apropos', label: 'A propos', type: 'hash' },
  { href: '#avis', label: 'Avis', type: 'hash' },
  { href: '#contact', label: 'Contact', type: 'hash' },
];

export const hours = [
  { day: 'Lundi - Samedi', time: '11h00 - 15h00 et 17h00 - 00h00' },
  { day: 'Dimanche', time: '17h00 - 00h00' },
];

export const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];
