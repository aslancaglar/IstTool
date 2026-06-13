"use client";

import { X, Eye } from 'lucide-react';

export interface ToppingCategoryFormData {
  categoryId: string;
  name: string;
  minSelection: number;
  maxSelection: number | undefined;
  displayOrder: number;
  active: boolean;
  freeForBogo: boolean;
  visibleWhenCategoryId: string | undefined;
  visibleWhenToppingIds: string[] | undefined;
}

interface ToppingCategoryFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: ToppingCategoryFormData;
  setFormData: (data: ToppingCategoryFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  allToppingCategories?: any[];
  allToppings?: any[];
}

export default function ToppingCategoryFormModal({ isOpen, isEditing, formData, setFormData, onClose, onSubmit, allToppingCategories, allToppings }: ToppingCategoryFormModalProps) {
  if (!isOpen) return null;

  // Filter out the current category from the trigger dropdown so a category can't reference itself
  const otherCategories = allToppingCategories?.filter(c => c.categoryId !== formData.categoryId) ?? [];

  // Get toppings for the selected trigger category
  const triggerToppings = formData.visibleWhenCategoryId
    ? allToppings?.filter(t => t.categoryId === formData.visibleWhenCategoryId && t.active !== false) ?? []
    : [];

  const handleToggleTriggerTopping = (toppingId: string) => {
    const current = formData.visibleWhenToppingIds ?? [];
    const isSelected = current.includes(toppingId);
    const updated = isSelected
      ? current.filter(id => id !== toppingId)
      : [...current, toppingId];
    setFormData({ ...formData, visibleWhenToppingIds: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier la Catégorie' : 'Ajouter une Catégorie de Garniture'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="ex: Sauces, Crudités" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID de la Catégorie</label>
            <input type="text" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono" placeholder="ex: sauces" required />
            <p className="text-xs text-slate-500 mt-1">Identifiant unique</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sélection min</label>
              <input type="number" min="0" value={formData.minSelection} onChange={(e) => setFormData({ ...formData, minSelection: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
              <p className="text-xs text-slate-500 mt-1">0 = facultatif</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sélection max</label>
              <input type="number" min="0" value={formData.maxSelection ?? ''} onChange={(e) => setFormData({ ...formData, maxSelection: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="∞" />
              <p className="text-xs text-slate-500 mt-1">Vide = illimité</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="tcat-active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <label htmlFor="tcat-active" className="text-sm font-medium text-slate-700">Actif</label>
          </div>
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <input type="checkbox" id="tcat-freeForBogo" checked={formData.freeForBogo} onChange={(e) => setFormData({ ...formData, freeForBogo: e.target.checked })} className="w-4 h-4 mt-0.5 accent-emerald-600" />
            <div>
              <label htmlFor="tcat-freeForBogo" className="text-sm font-medium text-emerald-800 cursor-pointer">Gratuit pour « 1 acheté = 1 offert »</label>
              <p className="text-xs text-emerald-600 mt-0.5">Les options de cette catégorie sont offertes sur le produit gratuit (ex : Taille Pizza).</p>
            </div>
          </div>

          {/* Conditional visibility section */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Visibilité conditionnelle</span>
            </div>
            <p className="text-xs text-blue-600">
              Si configuré, cette catégorie sera masquée jusqu'à ce qu'une option spécifique soit sélectionnée dans une autre catégorie.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie déclencheur</label>
              <select
                value={formData.visibleWhenCategoryId ?? ''}
                onChange={(e) => {
                  const val = e.target.value || undefined;
                  setFormData({
                    ...formData,
                    visibleWhenCategoryId: val,
                    visibleWhenToppingIds: val ? formData.visibleWhenToppingIds : undefined,
                  });
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucune (toujours visible)</option>
                {otherCategories.map((cat: any) => (
                  <option key={cat._id} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.visibleWhenCategoryId && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Options qui déclenchent l'affichage
                </label>
                {triggerToppings.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {triggerToppings.map((topping: any) => {
                      const isChecked = (formData.visibleWhenToppingIds ?? []).includes(topping.toppingId);
                      return (
                        <label key={topping._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100/50 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleTriggerTopping(topping.toppingId)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{topping.name}</span>
                          {topping.effectivePrice > 0 && (
                            <span className="text-xs text-slate-400 ml-auto">+{topping.effectivePrice.toFixed(2)}€</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Aucune garniture dans cette catégorie</p>
                )}
                {formData.visibleWhenCategoryId && (!formData.visibleWhenToppingIds || formData.visibleWhenToppingIds.length === 0) && triggerToppings.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Sélectionnez au moins une option, sinon la catégorie sera toujours masquée.</p>
                )}
              </div>
            )}
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
