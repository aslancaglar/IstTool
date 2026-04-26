"use client";

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function ToppingsPage() {
  const { adminToken } = useAdminAuth();
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const allToppings = useQuery(api.toppingsAdmin.listToppings);
  const createTopping = useMutation(api.toppingsAdmin.createTopping);
  const updateTopping = useMutation(api.toppingsAdmin.updateTopping);
  const deleteTopping = useMutation(api.toppingsAdmin.removeTopping);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'toppings'> | null>(null);
  const [formData, setFormData] = useState({
    toppingId: '',
    name: '',
    price: 0,
    categoryId: '',
    displayOrder: 0,
    active: true,
  });

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppings'> | null }>({
    isOpen: false,
    id: null
  });

  const toppingsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    toppingCategories?.forEach(cat => {
      grouped[cat.categoryId] = allToppings?.filter(t => t.categoryId === cat.categoryId) || [];
    });
    return grouped;
  }, [toppingCategories, allToppings]);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      toppingId: `topping-${Date.now()}`,
      name: '',
      price: 0,
      categoryId: toppingCategories?.[0]?.categoryId || '',
      displayOrder: allToppings?.length || 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (topping: any) => {
    setEditingId(topping._id);
    setFormData({
      toppingId: topping.toppingId,
      name: topping.name,
      price: topping.price || 0,
      categoryId: topping.categoryId,
      displayOrder: topping.displayOrder || 0,
      active: topping.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!adminToken) return;
      if (editingId) {
        await updateTopping({ id: editingId, ...formData, adminToken });
      } else {
        await createTopping({ ...formData, adminToken });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving topping:', error);
    }
  };

  const handleDeleteClick = (id: Id<'toppings'>) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      if (!adminToken) return;
      await deleteTopping({ id: confirmModal.id, adminToken });
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Garnitures</h1>
            <p className="text-slate-600 mt-2">Gérez les garnitures et leurs catégories</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-5 h-5" />
            Ajouter une Garniture
          </button>
        </div>

        <div className="space-y-6">
          {toppingCategories?.map((category) => {
            const categoryToppings = toppingsByCategory[category.categoryId] || [];

            return (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200 p-4 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">{category.name}</h2>
                  <p className="text-sm text-slate-600">
                    Min: {category.minSelection} | Max: {category.maxSelection || 'Illimité'}
                  </p>
                </div>

                <div className="p-4">
                  {categoryToppings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryToppings.map((topping: any) => (
                        <div
                          key={topping._id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                        >
                          <div>
                            <p className="font-medium text-slate-900">{topping.name}</p>
                            <p className="text-sm text-slate-600">
                              {topping.price ? `+${topping.price.toFixed(2)}€` : 'Gratuit'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(topping)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(topping._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">Aucune garniture dans cette catégorie</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Modifier la Garniture' : 'Ajouter une Garniture'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prix</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-slate-700">
                  Actif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Supprimer la Garniture"
        message="Êtes-vous sûr de vouloir supprimer cette garniture ? Cette action est irréversible."
      />
    </>
  );
}
