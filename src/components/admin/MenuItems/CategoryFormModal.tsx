"use client";

import { X } from 'lucide-react';

export interface CategoryFormData {
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CategoryFormModal({ isOpen, isEditing, formData, setFormData, onClose, onSubmit }: CategoryFormModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug</label>
            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ordre d'affichage</label>
            <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <label htmlFor="cat-active" className="text-sm font-medium text-slate-700">Actif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-semibold text-sm">Annuler</button>
            <button type="submit" className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm">{isEditing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
