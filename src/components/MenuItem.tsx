"use client";
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus } from 'lucide-react';

interface MenuItemProps {
  item: {
    _id: Id<"menuItems">;
    _creationTime: number;
    name: string;
    description: string;
    price: number;
    image: string;
    categories?: string[];
    popular?: boolean;
  };
  onOpenModal?: (item: any) => void;
  discountPercent?: number;
  promoBadge?: string;
}

export default function MenuItem({ item, onOpenModal, discountPercent = 0, promoBadge }: MenuItemProps) {
  const discountedPrice = discountPercent > 0
    ? Math.round(item.price * (1 - discountPercent / 100) * 100) / 100
    : null;

  const toppings = useQuery(
    api.queries.getToppingsForMenuItem,
    item?._id ? { menuItemId: item._id } : "skip"
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenModal && onOpenModal(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onOpenModal) onOpenModal(item);
          }
        }}
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
          {item?.image && (
            <Image
              src={item.image}
              alt={item?.name || 'Menu Kebab'}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1">
            {promoBadge && (
              <span className="bg-purple-600 text-white text-[8px] sm:text-sm font-bold px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full shadow-lg whitespace-nowrap">
                {promoBadge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-green-500 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow">
                -{discountPercent}%
              </span>
            )}
          </div>
          {item?.popular && (
            <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-primary-500 text-white text-[8px] sm:text-sm font-semibold px-2 py-0.5 sm:px-4 sm:py-1 rounded-full">
              Populaire
            </span>
          )}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-300 group-hover:scale-110 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[3]" />
          </div>
        </div>
        <div className="p-3 sm:p-6">
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <h3 className="text-sm sm:text-xl font-bold text-gray-900 font-display line-clamp-1">
              {item?.name || 'Article'}
            </h3>
            {discountedPrice !== null ? (
              <div className="flex flex-col items-end ml-1.5 sm:ml-2 shrink-0">
                <span className="text-[10px] text-gray-400 line-through leading-none">{item.price.toFixed(2)}€</span>
                <span className="text-sm sm:text-xl font-bold text-green-600 font-display leading-tight">{discountedPrice.toFixed(2)}€</span>
              </div>
            ) : (
              <span className="text-sm sm:text-xl font-bold text-primary-500 ml-1.5 sm:ml-2 font-display shrink-0">
                {(item?.price || 0).toFixed(2)}€
              </span>
            )}
          </div>
          <p className="text-gray-600 text-[11px] sm:text-sm line-clamp-2 h-8 sm:h-10 leading-snug">
            {item?.description || ''}
          </p>
        </div>
      </div>
    </>
  );
}
