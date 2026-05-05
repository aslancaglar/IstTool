"use client";

import { X } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';

export interface ToppingFormData {
  toppingId: string;
  name: string;
  price: number;
  categoryId: string;
  displayOrder: number;
  active: boolean;
  menuItemId?: Id<'menuItems'>;
  specialPrice?: number;
}

interface ToppingFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: ToppingFormData;
  setFormData: (data: ToppingFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  menuItems: any[] | undefined;
  toppingCategories: any[] | undefined;
}

export default function ToppingFormModal({ isOpen, isEditing, formData, setFormData, onClose, onSubmit, menuItems, toppingCategories }: ToppingFormModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier la Garniture' : 'Ajouter une Garniture'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix (€)</label>
            <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <p className="text-xs text-slate-500 mt-1">0 = gratuit. Utilisé si aucun article n'est lié.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix Spécial (Override) (€)</label>
            <input
              type="number" step="0.01" min="0"
              value={formData.specialPrice ?? ""}
              onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full border border-blue-200 bg-blue-50/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Laisser vide pour prix par défaut"
            />
            <p className="text-xs text-blue-600 mt-1">Si rempli, ce prix remplace le prix de l'article lié.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lier à un article du menu (Optionnel)</label>
            <select
              value={formData.menuItemId || ""}
              onChange={(e) => {
                const selectedId = e.target.value as Id<'menuItems'> | "";
                const item = menuItems?.find(i => i._id === selectedId);
                setFormData({
                  ...formData,
                  menuItemId: selectedId || undefined,
                  name: formData.name || (item?.name || ""),
                  price: formData.price || (item?.price || 0)
                });
              }}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Aucun article lié</option>
              {menuItems?.map(item => (
                <option key={item._id} value={item._id}>{item.name} ({item.price.toFixed(2)}€)</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">L'article sélectionné sera traité comme une garniture.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required>
              <option value="">Choisir une catégorie</option>
              {toppingCategories?.map(cat => <option key={cat._id} value={cat.categoryId}>{cat.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="topping-active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <label htmlFor="topping-active" className="text-sm font-medium text-slate-700">Actif</label>
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
