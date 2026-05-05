"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, Trash2 } from 'lucide-react';

interface SortableSidebarItemProps {
  id: string;
  isSelected: boolean;
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}

export default function SortableSidebarItem({ id, isSelected, label, count, active, onSelect, onEdit, onDeleteClick }: SortableSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative flex items-center transition-colors ${isDragging ? 'opacity-30' : ''} ${isSelected ? 'bg-slate-900' : 'hover:bg-slate-50'}`}>
      <button className={`flex-shrink-0 px-2 py-3 cursor-grab active:cursor-grabbing ${isSelected ? 'text-slate-400 hover:text-slate-200' : 'text-slate-300 hover:text-slate-500'}`}
        {...attributes} {...listeners} tabIndex={-1}>
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button onClick={onSelect} className={`flex-1 flex items-center justify-between py-2.5 pr-16 text-sm text-left ${isSelected ? 'text-white' : 'text-slate-700'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-green-500' : 'bg-slate-300'}`} />
          <span className="font-medium truncate">{label}</span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
      </button>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-white shadow rounded-md">
        <button onClick={onEdit} className="p-1.5 rounded text-slate-400 hover:text-blue-600 transition" title="Modifier"><Edit className="w-3.5 h-3.5" /></button>
        <button onClick={onDeleteClick} className="p-1.5 rounded text-slate-400 hover:text-red-600 transition" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </li>
  );
}
