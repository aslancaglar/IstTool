"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, LayoutGrid, Trash2 } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';

interface SortableToppingProps {
  topping: any;
  toppingCategories: any[] | undefined;
  onEdit: (t: any) => void;
  onDeleteClick: (id: Id<'toppings'>) => void;
  disabled?: boolean;
}

export default function SortableTopping({ topping, toppingCategories, onEdit, onDeleteClick, disabled }: SortableToppingProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: topping._id,
    disabled,
  });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-3 shadow-sm ${isDragging ? 'opacity-30' : 'hover:border-slate-300'}`}>
      {!disabled && (
        <button className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
          {...attributes} {...listeners} tabIndex={-1}>
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{topping.name}</p>
          {topping.menuItemId && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-100 flex-shrink-0">
              <LayoutGrid className="w-2.5 h-2.5" />
              Article lié
            </span>
          )}
          {topping.specialPrice !== undefined && (
            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter flex-shrink-0 shadow-sm">
              Override
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
          <span className="font-bold text-blue-600">
            {topping.effectivePrice ? `+${topping.effectivePrice.toFixed(2)} €` : 'Gratuit'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{toppingCategories?.find((c: any) => c.categoryId === topping.categoryId)?.name ?? topping.categoryId}</span>
          {topping.active === false && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-red-500 font-medium">Inactif</span>
            </>
          )}
        </p>
      </div>
      <div className="flex gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition ml-auto">
        <button onClick={() => onEdit(topping)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDeleteClick(topping._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
