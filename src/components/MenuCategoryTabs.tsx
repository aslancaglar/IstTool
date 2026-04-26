import { memo, useRef, useEffect } from 'react';
import FadeIn from './FadeIn';

interface MenuCategoryTabsProps {
    categories: Array<{ slug: string; name: string }>;
    activeCategory: string;
    onSelectCategory: (slug: string) => void;
    showRightGradient: boolean;
    onScroll: () => void;
    hasInteractedRef: React.MutableRefObject<boolean>;
}

function MenuCategoryTabs({
    categories,
    activeCategory,
    onSelectCategory,
    showRightGradient,
    onScroll,
    hasInteractedRef,
}: MenuCategoryTabsProps) {
    const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Sync scroll detection on mount and resize
    useEffect(() => {
        onScroll();
        window.addEventListener('resize', onScroll);
        return () => window.removeEventListener('resize', onScroll);
    }, [categories, onScroll]);

    // Handle smooth horizontal scrolling when active category changes via interaction
    useEffect(() => {
        if (!hasInteractedRef.current) return;

        const activeButton = categoryRefs.current.get(activeCategory);
        if (activeButton) {
            activeButton.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeCategory, hasInteractedRef]);

    const setCategoryRef = (id: string) => (element: HTMLButtonElement | null) => {
        if (element) {
            categoryRefs.current.set(id, element);
        } else {
            categoryRefs.current.delete(id);
        }
    };

    return (
        <FadeIn delay={200} direction="up" className="relative mb-12 -mx-4 px-4 sm:mx-0 sm:px-4">
            <div
                ref={scrollContainerRef}
                onScroll={onScroll}
                className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                <div className="flex gap-3 justify-start sm:justify-center min-w-max sm:min-w-0 sm:flex-wrap p-2">
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            ref={setCategoryRef(category.slug)}
                            onClick={() => {
                                hasInteractedRef.current = true;
                                onSelectCategory(category.slug);
                            }}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${activeCategory === category.slug
                                    ? 'bg-primary-600 text-white shadow-md scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {showRightGradient && (
                <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden z-10" />
            )}
        </FadeIn>
    );
}

// Memoize this component so it only re-renders when the active category or the categories list changes
export default memo(MenuCategoryTabs);
