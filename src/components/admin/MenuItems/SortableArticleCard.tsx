"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';
import MenuItemCard from './MenuItemCard';

interface SortableArticleCardProps {
  item: any;
  categoryFilter: string;
  onEdit: (item: any) => void;
  onToggleStock: (id: Id<'menuItems'>, inStock: boolean) => void;
  disabled?: boolean;
}

export default function SortableArticleCard({ item, categoryFilter, onEdit, onToggleStock, disabled }: SortableArticleCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
    disabled,
  });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? 'opacity-30' : ''}>
      <div className="relative group/card">
        {!disabled && (
          <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 opacity-60 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity rounded-t-xl bg-gradient-to-b from-black/30 to-transparent"
            {...attributes} {...listeners}>
            <GripVertical className="w-4 h-4 text-white drop-shadow" />
          </div>
        )}
        <MenuItemCard item={item} categoryFilter={categoryFilter} onEdit={onEdit} onToggleStock={onToggleStock} />
      </div>
    </div>
  );
}
