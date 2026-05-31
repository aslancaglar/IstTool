"use client";

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import CrudFormModal from '../../../src/components/admin/CrudFormModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import { useCrudResource } from '../../../src/hooks/useCrudResource';

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

  const crud = useCrudResource<CategoryFormData, any, Id<'menuCategories'>>({
    adminToken,
    emptyForm: () => ({
      name: '',
      slug: '',
      displayOrder: categories?.length || 0,
      active: true,
    }),
    toForm: (category) => ({
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    }),
    getId: (category) => category._id,
    createMutation: createCategory,
    updateMutation: updateCategory,
    deleteMutation: deleteCategory,
    onError: (action) => {
      if (action === 'delete') {
        alert('Échec de la suppression de la catégorie. Voir la console pour plus de détails.');
      }
    },
  });

  const { formData, setFormData } = crud;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catégories du Menu</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez les catégories de votre menu</p>
          </div>
          <button
            onClick={crud.openCreate}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Catégorie
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ordre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories?.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{category.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 font-mono">{category.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{category.displayOrder}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {category.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); crud.openEdit(category); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); crud.requestDelete(category._id); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

      <CrudFormModal
        isOpen={crud.isModalOpen}
        onClose={crud.closeModal}
        onSubmit={crud.submit}
        title={crud.editingId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
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
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
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
        title="Supprimer la Catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
      />
    </>
  );
}
