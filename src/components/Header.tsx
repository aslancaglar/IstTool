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
  const { itemCount, isInitialized, isCartOpen, setIsCartOpen } = useOrder();
  const { user, logout } = useAuth();
  const { openLoginModal } = useAuthModal();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 50;
        setIsScrolled(prev => prev !== shouldBeScrolled ? shouldBeScrolled : prev);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleHashNavigation = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    if (pathname !== '/') {
      router.push('/' + hash);
      // Fallback smooth scroll in case Next.js native hash navigation is too fast or doesn't smooth scroll
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Update URL hash without jumping
      window.history.pushState(null, '', hash);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 sm:py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto pl-4 pr-3 sm:px-4 lg:px-6 bg-primary-600 rounded-full shadow-2xl border border-white/5 transition-all duration-300">
        
        {/* Desktop Header Layout */}
        <div className="hidden lg:flex items-center justify-between h-16 relative">
          <Link href="/" className="absolute left-[-8px] top-1/2 -translate-y-1/2 z-10">
            <div className="flex-shrink-0 flex items-center relative w-[195px] h-[75px]">
              <Image
                src="/logo-istanbul-kebab.webp"
                alt="Resto Istanbul"
                fill
                priority
                className="object-contain object-left drop-shadow-xl"
              />
            </div>
          </Link>
          
          {/* Spacer to preserve layout flow since logo is now absolute */}
          <div className="w-[195px] shrink-0 h-full" />

          <nav className="flex items-center gap-8">
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

          <div className="flex items-center gap-5">
            <OpenStatus isScrolled={isScrolled} variant="desktop" />

            <div className="flex items-center gap-3 pr-2 border-r border-white/10">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 hover:bg-gray-50 transition-all shadow-md active:scale-95"
                aria-label="Voir la commande"
              >
                <ShoppingBag className="w-5 h-5" />
                {isInitialized && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary-600">
                    {itemCount}
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
              href="tel:0782814656"
              className="inline-flex items-center gap-3 px-6 py-2.5 bg-white text-primary-700 font-display text-lg tracking-widest rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 uppercase"
            >
              <Phone className="w-4 h-4 text-primary-600" />
              07 82 81 46 56
            </a>
          </div>
        </div>

        {/* Mobile Header Layout (Left Logo, Center Status, Right Hamburger) */}
        <div className="lg:hidden grid grid-cols-3 items-center h-16 w-full relative">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <Link href="/" className="relative flex items-center w-[120px] h-[46px] left-[-8px]">
              <Image
                src="/logo-istanbul-kebab.webp"
                alt="Resto Istanbul"
                fill
                priority
                className="object-contain object-left drop-shadow-xl"
              />
            </Link>
          </div>

          {/* Center: Status */}
          <div className="flex justify-center min-w-0">
            <OpenStatus isScrolled={isScrolled} variant="mobile" />
          </div>

          {/* Right: Hamburger Menu & Account */}
          <div className="flex justify-end items-center gap-1 sm:gap-2 shrink-0">
            {user ? (
              <Link
                href="/account"
                className="hidden sm:block p-2 rounded-lg transition-colors text-white hover:bg-white/10"
                aria-label="Mon Compte"
              >
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal(pathname || '/')}
                className="hidden sm:block p-2 rounded-lg transition-colors text-white hover:bg-white/10"
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
                  className="flex items-center gap-2 w-full py-3 px-2 text-white font-display text-lg tracking-wide hover:text-white/70 transition-colors uppercase"
                >
                  <User className="w-5 h-5" />
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
                Mon compte
              </button>
            )}

            <a
              href="tel:0782814656"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-display text-lg tracking-wide rounded-full hover:bg-gray-100 transition-colors uppercase"
            >
              <Phone className="w-5 h-5" />
              07 82 81 46 56
            </a>
          </nav>
        </div>
      )}

      <OrderList isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
