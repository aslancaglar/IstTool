"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Skeleton from './Skeleton';
import MenuItem from './MenuItem';

function getCurrentParisHour(): number {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getHours();
}

// Lazy-load the heavy modal component because it is rarely viewed on initial page load
const MenuItemModal = dynamic(() => import('./MenuItemModal'), { ssr: false });

export default function MenuFull() {
  const menuCategories = useQuery(api.queries.getMenuCategories);
  const allMenuItems = useQuery(api.queries.getMenuItems);
  const activeCampaigns = useQuery(api.promoCodes.listActiveCampaigns);

  // Active campaigns filtered by time window
  const effectiveCampaigns = useMemo(() => {
    if (!activeCampaigns) return [];
    const hour = getCurrentParisHour();
    return activeCampaigns.filter(c =>
      !c.timeWindow || (hour >= c.timeWindow.startHour && hour < c.timeWindow.endHour)
    );
  }, [activeCampaigns]);

  // Returns discount info for a given item
  const getItemPromo = useCallback((item: { _id: string; categories?: string[] }): { discountPercent: number; promoBadge?: string } => {
    let discountPercent = 0;
    let promoBadge: string | undefined;
    for (const c of effectiveCampaigns) {
      if (c.discountType === 'percentage') {
        discountPercent = Math.max(discountPercent, c.discountValue);
      } else if (c.discountType === 'percent_off_items') {
        const cats = c.applicableCategoryIds ?? [];
        if ((item.categories ?? []).some(cat => cats.includes(cat))) {
          discountPercent = Math.max(discountPercent, c.discountValue);
        }
      } else if (c.discountType === 'percent_off_specific_items') {
        const ids: string[] = (c as any).applicableMenuItemIds ?? [];
        if (ids.includes(item._id as string)) {
          discountPercent = Math.max(discountPercent, c.discountValue);
        }
      } else if (c.discountType === 'bogo_same') {
        const ids: string[] = (c as any).applicableMenuItemIds ?? [];
        if (ids.length === 0 || ids.includes(item._id as string)) {
          promoBadge = '1 ACHETÉ = 1 OFFERT';
        }
      } else if (c.discountType === 'bogo_gift') {
        const triggerItemId: string = (c as any).bogoTriggerItemId ?? '';
        const giftItemId: string = (c as any).bogoGiftItemId ?? '';
        if (item._id === triggerItemId) {
          const giftItem = allMenuItems?.find(m => m._id === giftItemId);
          promoBadge = giftItem ? `+ ${giftItem.name} offert` : 'Offre cadeau';
        } else if (item._id === giftItemId) {
          const triggerItem = allMenuItems?.find(m => m._id === triggerItemId);
          promoBadge = triggerItem ? `Offert avec ${triggerItem.name}` : 'Peut être offert';
        }
      }
    }
    return { discountPercent, promoBadge };
  }, [effectiveCampaigns, allMenuItems]);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const mobilePillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = useCallback((item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  // Only show categories that have at least one active item in stock
  const availableCategories = useMemo(() => {
    if (!menuCategories || !allMenuItems) return [];
    return menuCategories.filter(category => {
      return allMenuItems.some(item =>
        item.categories?.includes(category.slug) &&
        item.active &&
        item.inStock !== false
      );
    });
  }, [menuCategories, allMenuItems]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    if (!allMenuItems || availableCategories.length === 0) return new Map<string, any[]>();
    const map = new Map<string, any[]>();
    for (const category of availableCategories) {
      const items = allMenuItems
        .filter(item => item.categories?.includes(category.slug) && item.active && item.inStock !== false)
        .sort((a, b) => {
          const orderA = a.categoryOrders?.find((o: any) => o.category === category.slug)?.order ?? (a.displayOrder || 0);
          const orderB = b.categoryOrders?.find((o: any) => o.category === category.slug)?.order ?? (b.displayOrder || 0);
          return orderA - orderB;
        });
      if (items.length > 0) {
        map.set(category.slug, items);
      }
    }
    return map;
  }, [allMenuItems, availableCategories]);

  // Set initial active category
  useEffect(() => {
    if (availableCategories.length > 0 && !activeCategory) {
      setActiveCategory(availableCategories[0].slug);
    }
  }, [availableCategories, activeCategory]);

  // Auto-scroll the active pill into view on mobile
  useEffect(() => {
    const pill = mobilePillRefs.current.get(activeCategory);
    if (pill && mobileScrollRef.current) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  // Track scroll position to conditionally enable the mobile category nav mask
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight the current category in the sidebar
  useEffect(() => {
    if (availableCategories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute('data-category-slug');
            if (slug) {
              setActiveCategory(slug);
            }
          }
        }
      },
      {
        rootMargin: '-120px 0px -60% 0px',
        threshold: 0,
      }
    );

    // Observe all section elements
    Array.from(sectionRefs.current.values()).forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [availableCategories, itemsByCategory]);

  // Scroll to category section on click
  const scrollToCategory = useCallback((slug: string) => {
    setActiveCategory(slug);
    isScrollingRef.current = true;

    const element = sectionRefs.current.get(slug);
    if (element) {
      // On mobile: header (~112px) + category bar (~48px) = ~160px
      // On desktop: header (~88px) = ~88px, but sidebar is not fixed
      const isMobile = window.innerWidth < 1024;
      const headerOffset = isMobile ? 170 : 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: 'smooth',
      });
    }

    // Re-enable observer after scroll completes
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  const setSectionRef = useCallback((slug: string) => (el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(slug, el);
    } else {
      sectionRefs.current.delete(slug);
    }
  }, []);

  const isLoading = !menuCategories || !allMenuItems;

  return (
    <section id="menu-full" className="pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile sticky category bar - in normal flow, sticks below header on scroll */}
        <div className={`sticky top-[88px] sm:top-[76px] z-40 bg-white border-b border-gray-100 shadow-sm lg:hidden -mx-4 px-0 sm:-mx-6 sm:px-0 mt-0 transition-all duration-150 ${
          hasScrolled ? "before:content-[''] before:absolute before:bottom-full before:left-0 before:right-0 before:h-[88px] sm:before:h-[76px] before:bg-white before:z-[-1] before:pointer-events-none" : ""
        }`}>
          <div
            ref={mobileScrollRef}
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex gap-2 px-4 py-4 min-w-max">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
                ))
              ) : (
                availableCategories.map((category) => (
                  <button
                    key={category.slug}
                    ref={(el) => {
                      if (el) mobilePillRefs.current.set(category.slug, el);
                      else mobilePillRefs.current.delete(category.slug);
                    }}
                    onClick={() => scrollToCategory(category.slug)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-display text-base tracking-wider uppercase transition-all duration-200 ${
                      activeCategory === category.slug
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8 pt-6">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24" aria-label="Catégories du menu">
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {availableCategories.map((category) => (
                    <li key={category.slug}>
                      <button
                        onClick={() => scrollToCategory(category.slug)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl font-display text-xl tracking-wider uppercase transition-all duration-200 ${
                          activeCategory === category.slug
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </aside>

          {/* Main content - All categories */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div>
                {[1, 2, 3].map(section => (
                  <div key={section} className="mb-12">
                    <Skeleton className="h-8 w-48 rounded mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
                          <Skeleton className="h-32 sm:h-48 w-full" />
                          <div className="p-3 sm:p-6">
                            <Skeleton className="h-5 w-3/4 rounded mb-2" />
                            <Skeleton className="h-4 w-full rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              availableCategories.map((category) => {
                const items = itemsByCategory.get(category.slug);
                if (!items || items.length === 0) return null;
                return (
                  <section
                    key={category.slug}
                    ref={setSectionRef(category.slug)}
                    data-category-slug={category.slug}
                    className="mb-12 scroll-mt-[140px] lg:scroll-mt-28"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-3">
                      <span className="w-1 h-7 bg-primary-500 rounded-full" />
                      {category.name}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {items.map((item) => {
                        const promo = getItemPromo(item);
                        return (
                          <div key={item._id}>
                            <MenuItem
                              item={{
                                ...item,
                                description: item.description || ''
                              }}
                              discountPercent={promo.discountPercent}
                              promoBadge={promo.promoBadge}
                              onOpenModal={handleOpenModal}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
