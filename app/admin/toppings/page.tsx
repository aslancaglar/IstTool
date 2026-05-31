"use client";

import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import CrudFormModal from '../../../src/components/admin/CrudFormModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import { useCrudResource } from '../../../src/hooks/useCrudResource';

interface ToppingFormData {
  toppingId: string;
  name: string;
  price: number;
  categoryId: string;
  displayOrder: number;
  active: boolean;
}

export default function ToppingsPage() {
  const { adminToken } = useAdminAuth();
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const allToppings = useQuery(api.toppingsAdmin.listToppings);
  const createTopping = useMutation(api.toppingsAdmin.createTopping);
  const updateTopping = useMutation(api.toppingsAdmin.updateTopping);
  const deleteTopping = useMutation(api.toppingsAdmin.removeTopping);

  const crud = useCrudResource<ToppingFormData, any, Id<'toppings'>>({
    adminToken,
    emptyForm: () => ({
      toppingId: `topping-${Date.now()}`,
      name: '',
      price: 0,
      categoryId: toppingCategories?.[0]?.categoryId || '',
      displayOrder: allToppings?.length || 0,
      active: true,
    }),
    toForm: (topping) => ({
      toppingId: topping.toppingId,
      name: topping.name,
      price: topping.price || 0,
      categoryId: topping.categoryId,
      displayOrder: topping.displayOrder || 0,
      active: topping.active !== false,
    }),
    getId: (topping) => topping._id,
    createMutation: createTopping,
    updateMutation: updateTopping,
    deleteMutation: deleteTopping,
  });

  const { formData, setFormData } = crud;

  const toppingsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    toppingCategories?.forEach(cat => {
      grouped[cat.categoryId] = allToppings?.filter(t => t.categoryId === cat.categoryId) || [];
    });
    return grouped;
  }, [toppingCategories, allToppings]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestion des Garnitures</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez les garnitures et leurs catégories</p>
          </div>
          <button
            onClick={crud.openCreate}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Garniture
          </button>
        </div>

        <div className="space-y-4">
          {toppingCategories?.map((category) => {
            const categoryToppings = toppingsByCategory[category.categoryId] || [];

            return (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="border-b border-slate-100 px-4 py-3 bg-slate-50 rounded-t-xl">
                  <h2 className="text-sm font-semibold text-slate-900">{category.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Min: {category.minSelection} | Max: {category.maxSelection || 'Illimité'}
                  </p>
                </div>

                <div className="p-4">
                  {categoryToppings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryToppings.map((topping: any) => (
                        <div
                          key={topping._id}
                          className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{topping.name}</p>
                            <p className="text-xs text-slate-500">
                              {topping.price ? `+${topping.price.toFixed(2)}€` : 'Gratuit'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => crud.openEdit(topping)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => crud.requestDelete(topping._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center text-sm py-4">Aucune garniture dans cette catégorie</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CrudFormModal
        isOpen={crud.isModalOpen}
        onClose={crud.closeModal}
        onSubmit={crud.submit}
        title={crud.editingId ? 'Modifier la Garniture' : 'Ajouter une Garniture'}
        submitLabel={crud.editingId ? 'Mettre à jour' : 'Créer'}
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            {toppingCategories?.map((cat) => (
              <option key={cat._id} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ordre d'affichage</label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-700">Actif</label>
        </div>
      </CrudFormModal>

      <ConfirmModal
        isOpen={crud.confirmModal.isOpen}
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        title="Supprimer la Garniture"
        message="Êtes-vous sûr de vouloir supprimer cette garniture ? Cette action est irréversible."
      />
    </>
  );
}
