"use client";
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

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
  const hasCustomization = (toppings?.length || 0) > 0;

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
        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {item?.image && (
            <Image
              src={item.image}
              alt={item?.name || 'Menu Kebab'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            {promoBadge && (
              <span className="bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                {promoBadge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                -{discountPercent}%
              </span>
            )}
          </div>
          {item?.popular && (
            <span className="absolute top-4 right-4 bg-primary-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
              Populaire
            </span>
          )}
          {hasCustomization && (
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
              Personnalisable
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 font-display">
              {item?.name || 'Article'}
            </h3>
            {discountedPrice !== null ? (
              <div className="flex flex-col items-end ml-2 shrink-0">
                <span className="text-xs text-gray-400 line-through leading-none">{item.price.toFixed(2)}€</span>
                <span className="text-xl font-bold text-green-600 font-display leading-tight">{discountedPrice.toFixed(2)}€</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-primary-500 ml-2 font-display">
                {(item?.price || 0).toFixed(2)}€
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">{item?.description || ''}</p>

          <div className="text-sm text-gray-500 hover:text-primary-500 transition-colors font-medium">
            Cliquez pour personnaliser →
          </div>
        </div>
      </div>
    </>
  );
}
