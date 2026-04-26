"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

interface CategoryFormData {
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
}

export default function CategoriesPage() {
  const { adminToken } = useAdminAuth();
  const categories = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'menuCategories'> | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    displayOrder: 0,
    active: true,
  });

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'menuCategories'> | null }>({
    isOpen: false,
    id: null
  });

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      displayOrder: categories?.length || 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!adminToken) return;
      if (editingId) {
        await updateCategory({
          adminToken,
          id: editingId,
          ...formData,
        });
      } else {
        await createCategory({ ...formData, adminToken });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: Id<'menuCategories'>) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      try {
        if (!adminToken) return;
        await deleteCategory({ id: confirmModal.id, adminToken });
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Échec de la suppression de la catégorie. Voir la console pour plus de détails.');
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Catégories du Menu</h1>
            <p className="text-slate-600 mt-2">Gérez les catégories de votre menu</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-5 h-5" />
            Ajouter une Catégorie
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ordre d'affichage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories?.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{category.displayOrder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${category.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {category.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, category._id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
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
        title="Supprimer la Catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
      />
    </>
  );
}
