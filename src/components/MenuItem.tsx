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
}

export default function MenuItem({ item, onOpenModal }: MenuItemProps) {

  // Defensive check: only query toppings if the ID is valid for the menuItems table
  const isValidMenuItemId = item?._id && typeof item._id === 'string' && !item._id.startsWith('k57');

  const toppings = useQuery(
    (isValidMenuItemId ? api.queries.getToppingsForMenuItem : undefined) as any,
    { menuItemId: item?._id }
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
            <span className="text-xl font-bold text-primary-500 ml-2 font-display">
              {(item?.price || 0).toFixed(2)}€
            </span>
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
