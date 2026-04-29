"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Skeleton from './Skeleton';
import MenuItem from './MenuItem';
import FadeIn from './FadeIn';
import MenuCategoryTabs from './MenuCategoryTabs';

function getCurrentParisHour(): number {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getHours();
}

// Lazy-load the heavy modal component because it is rarely viewed on initial page load
const MenuItemModal = dynamic(() => import('./MenuItemModal'), { ssr: false });


interface MenuProps {
  showHeader?: boolean;
  reducedTopPadding?: boolean;
  reducedHeaderSpacing?: boolean;
}

export default function Menu({ showHeader = false, reducedTopPadding = false, reducedHeaderSpacing = false }: MenuProps) {
  const hasUserInteracted = useRef(false);

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

  // Returns discount info for a given item: percent off and/or a promo badge
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
          promoBadge = '2 POUR 1';
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
  const [showRightGradient, setShowRightGradient] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent Modal handlers from re-rendering the entire grid when invoked
  const handleOpenModal = useCallback((item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay wiping state to allow modal closing animation
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  const checkScroll = useCallback((scrollContainer: HTMLDivElement | null) => {
    if (scrollContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);


  // MEMOIZATION: Only show categories that have at least one active item in stock
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

  // When categories load, default to the first available one
  useEffect(() => {
    if (availableCategories.length > 0 && !activeCategory) {
      setActiveCategory(availableCategories[0].slug);
    }
  }, [availableCategories, activeCategory]);


  // MEMOIZATION: Prevent this heavy array filtering/sorting from running on EVERY render
  const filteredItems = useMemo(() => {
    if (!allMenuItems || !activeCategory) return [];

    return allMenuItems
      .filter(item => item.categories?.includes(activeCategory) && item.active && item.inStock !== false)
      .sort((a, b) => {
        const orderA = a.categoryOrders?.find(o => o.category === activeCategory)?.order ?? (a.displayOrder || 0);
        const orderB = b.categoryOrders?.find(o => o.category === activeCategory)?.order ?? (b.displayOrder || 0);
        return orderA - orderB;
      });
  }, [allMenuItems, activeCategory]);


  return (
    <section id="menu" className={`pb-20 bg-white ${reducedTopPadding ? 'pt-4 md:pt-[42px]' : 'pt-20'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <FadeIn direction="up">
            <div className={`text-center ${reducedHeaderSpacing ? 'mb-8' : 'mb-16'}`}>
              <h2 className="text-primary-600 font-extrabold uppercase tracking-wider mb-2 text-sm sm:text-base">
                Découvrez
              </h2>
              <h2 style={{ fontFamily: '"Titan One", cursive' }} className="font-normal text-4xl md:text-5xl text-dark-900 uppercase tracking-wide">
                Notre Carte
              </h2>
            </div>
          </FadeIn>
        )}


        {(!menuCategories || !allMenuItems) ? (
          <div className="flex gap-3 justify-center mb-12 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-28 rounded-full flex-shrink-0" />
            ))}
          </div>
        ) : availableCategories.length > 0 ? (
          <MenuCategoryTabs
            categories={availableCategories.map(c => ({ slug: c.slug, name: c.name }))}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            showRightGradient={showRightGradient}
            onScroll={() => {
              const el = document.querySelector('.overflow-x-auto') as HTMLDivElement;
              checkScroll(el);
            }}
            hasInteractedRef={hasUserInteracted}
          />
        ) : null}



        {!allMenuItems ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-6 w-1/4 rounded ml-2" />
                  </div>
                  <Skeleton className="h-4 w-full rounded mb-2" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={`${item._id}-${activeCategory}`}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MenuItem
                  item={{
                    ...item,
                    description: item.description || ''
                  }}
                  discountPercent={getItemPromo(item).discountPercent}
                  promoBadge={getItemPromo(item).promoBadge}
                  onOpenModal={handleOpenModal}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="font-display text-xl tracking-wide inline-flex items-center px-8 py-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 uppercase"
          >
            Commander Maintenant
          </Link>
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
