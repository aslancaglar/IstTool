"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, ShoppingBag, User, LogOut } from 'lucide-react';
import OrderList from './OrderList';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import Image from 'next/image';
import OpenStatus from './OpenStatus';

const navLinks = [
  { href: '/', label: 'Accueil', type: 'route' as const },
  { href: '#apropos', label: 'À Propos', type: 'hash' as const },
  { href: '/menu', label: 'Menu', type: 'route' as const },
  { href: '#contact', label: 'Contact', type: 'hash' as const },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const { getItemCount, isInitialized } = useOrder();
  const { user, logout } = useAuth();
  const { openLoginModal } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHashNavigation = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 sm:py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 bg-primary-600 rounded-full shadow-2xl border border-white/5 transition-all duration-300">
        <div className="flex items-center justify-between h-16 relative">
          <Link href="/" className="absolute left-[-8px] top-1/2 -translate-y-1/2 z-10">
            <div className="flex-shrink-0 flex items-center relative w-[180px] sm:w-[195px] h-[75px]">
              <Image
                src="/LogoMondo.png"
                alt="Mondo Pizza"
                fill
                priority
                className="object-contain object-left drop-shadow-xl"
              />
            </div>
          </Link>
          
          {/* Spacer to preserve layout flow since logo is now absolute */}
          <div className="w-[180px] sm:w-[195px] shrink-0 h-full" />

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.type === 'route'
                ? pathname === link.href
                : pathname === '/' && typeof window !== 'undefined' && window.location.hash === link.href;

              if (link.type === 'route') {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-display text-lg tracking-wide transition-colors uppercase ${isActive ? 'text-secondary-400 font-bold' : 'text-white hover:text-white/70'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleHashNavigation(e, link.href)}
                  className={`font-display text-lg tracking-wide transition-colors uppercase ${isActive ? 'text-secondary-400 font-bold' : 'text-white hover:text-white/70'
                    }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <OpenStatus isScrolled={isScrolled} variant="desktop" />

            <div className="flex items-center gap-3 pr-2 border-r border-white/10">
              <button
                onClick={() => setIsOrderListOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 hover:bg-gray-50 transition-all shadow-md active:scale-95"
                aria-label="Voir la commande"
              >
                <ShoppingBag className="w-5 h-5" />
                {isInitialized && getItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary-600">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/account"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 hover:bg-gray-50 transition-all shadow-md active:scale-95"
                    title="Mon Compte"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => void logout()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all active:scale-95"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLoginModal(pathname || '/')}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 hover:bg-gray-50 transition-all shadow-md active:scale-95"
                  aria-label="Se connecter"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            <a
              href="tel:0387380945"
              className="inline-flex items-center gap-3 px-6 py-2.5 bg-white text-primary-700 font-display text-lg tracking-widest rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 uppercase"
            >
              <Phone className="w-4 h-4 text-primary-600" />
              03 87 38 09 45
            </a>
          </div>

          {/* Mobile Status - Always Visible - Absolutely Centered */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="pointer-events-auto">
              <OpenStatus isScrolled={isScrolled} variant="mobile" />
            </div>
          </div>

          {/* Mobile Menu Button Only - Cart removed (handled by MobileStickyCart) */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <Link
                href="/account"
                className="p-2 rounded-lg transition-colors text-white hover:bg-white/10"
                aria-label="Mon Compte"
              >
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal(pathname || '/')}
                className="p-2 rounded-lg transition-colors text-white hover:bg-white/10"
                aria-label="Se connecter"
              >
                <User className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-colors text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-2 bg-primary-600 rounded-2xl shadow-xl">
          <nav className="flex flex-col px-4 py-4">
            <div className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = link.type === 'route'
                  ? pathname === link.href
                  : pathname === '/' && typeof window !== 'undefined' && window.location.hash === link.href;

                if (link.type === 'route') {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`py-3 font-display text-lg tracking-wide transition-colors border-b border-white/20 last:border-0 uppercase ${isActive ? 'text-secondary-400 font-bold' : 'text-white hover:text-white/70'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      handleHashNavigation(e, link.href);
                    }}
                    className={`py-3 font-display text-lg tracking-wide transition-colors border-b border-white/20 last:border-0 uppercase ${isActive ? 'text-secondary-400 font-bold' : 'text-white hover:text-white/70'
                      }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* Removed OpenStatus from mobile hamburger menu */}

            {user ? (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-3 px-2">
                  <div className="bg-white/20 p-2 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{user.firstName} {user.lastName}</p>
                    <p className="text-white/60 text-xs">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 w-full py-3 px-4 text-white font-display text-lg tracking-wide hover:text-white/70 transition-colors uppercase border-b border-white/20"
                >
                  <User className="w-5 h-5 text-white" />
                  Mon Compte
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    void logout();
                  }}
                  className="flex items-center gap-2 w-full py-3 px-2 text-white font-display text-lg tracking-wide hover:text-white/70 transition-colors uppercase"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openLoginModal(pathname || '/');
                }}
                className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white font-display text-lg tracking-wide rounded-full hover:bg-white/30 transition-colors uppercase"
              >
                <User className="w-5 h-5" />
                Se connecter
              </button>
            )}

            <a
              href="tel:0387380945"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-display text-lg tracking-wide rounded-full hover:bg-gray-100 transition-colors uppercase"
            >
              <Phone className="w-5 h-5" />
              03 87 38 09 45
            </a>
          </nav>
        </div>
      )}

      <OrderList isOpen={isOrderListOpen} onClose={() => setIsOrderListOpen(false)} />
    </header>
  );
}
