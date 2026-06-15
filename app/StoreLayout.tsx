"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import HolidayNotification from '../src/components/HolidayNotification';
import { AuthModalProvider, useAuthModal } from '../src/context/AuthModalContext';

// Lazy-load heavy components that are not needed on initial paint
const MobileStickyCart = dynamic(() => import('../src/components/MobileStickyCart'), { ssr: false });
const AuthModal = dynamic(() => import('../src/components/AuthModal'), { ssr: false });

function AuthModalUrlSync() {
    const pathname = usePathname();
    const router = useRouter();
    const { openAuthModal } = useAuthModal();

    useEffect(() => {
        const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
        const urlParams = new URLSearchParams(currentSearch);
        const authMode = urlParams.get('auth');
        if (authMode !== 'login' && authMode !== 'signup') {
            return;
        }

        const redirectPath = urlParams.get('redirect') || pathname || '/';
        openAuthModal(authMode, redirectPath);

        const nextParams = new URLSearchParams(urlParams.toString());
        nextParams.delete('auth');
        nextParams.delete('redirect');

        const nextQuery = nextParams.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [pathname, openAuthModal, router]);

    return null;
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isCheckout = pathname === '/checkout';
    const isOrderSuccess = pathname?.startsWith('/order-success');
    const hideFooter = isCheckout || isOrderSuccess;

    // Force scroll to top on route change to fix Next.js scroll restoration bug
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    if (isAdmin) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <AuthModalProvider>
            <AuthModalUrlSync />
            <Header />
            <HolidayNotification />
            <main className="min-h-screen">
                {children}
            </main>
            {!hideFooter && <Footer />}
            {!isCheckout && <MobileStickyCart />}
            <AuthModal />
        </AuthModalProvider>
    );
}
