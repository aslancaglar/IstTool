"use client";

import { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import MenuItemCard from '../../../src/components/admin/MenuItems/MenuItemCard';
import MenuItemModal from '../../../src/components/admin/MenuItems/MenuItemModal';
import { Plus, X } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  imageStorageId?: Id<'_storage'>;
  categories: string[];
  popular: boolean;
  displayOrder: number;
  categoryOrders: { category: string; order: number }[];
  active: boolean;
}

export default function MenuItemsPage() {
  const { adminToken } = useAdminAuth();
  const menuItems = useQuery(api.menuItems.list);
  const categories = useQuery(api.categories.list);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const createMenuItem = useMutation(api.menuItems.create);
  const updateMenuItem = useMutation(api.menuItems.update);
  const deleteMenuItem = useMutation(api.menuItems.remove);
  const removeMenuItemImage = useMutation(api.menuItems.removeImage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setMenuItemToppingCategories = useMutation(api.toppingsAdmin.setMenuItemToppingCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'menuItems'> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'menuItems'> | null }>({
    isOpen: false,
    id: null
  });

  const editingItem = useMemo(() =>
    editingId ? menuItems?.find(item => item._id === editingId) : null,
    [editingId, menuItems]
  );

  const filteredMenuItems = useMemo(() =>
    menuItems?.filter((item) =>
      categoryFilter === 'all' ? true : item.categories?.includes(categoryFilter)
    ).sort((a, b) => {
      if (categoryFilter === 'all') {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      const orderA = a.categoryOrders?.find(o => o.category === categoryFilter)?.order ?? (a.displayOrder || 0);
      const orderB = b.categoryOrders?.find(o => o.category === categoryFilter)?.order ?? (b.displayOrder || 0);
      return orderA - orderB;
    }),
    [menuItems, categoryFilter]
  );

  const handleCreate = useCallback(() => {
    setEditingId(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: any) => {
    setEditingId(item._id);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: Id<'menuItems'>) => {
    setConfirmModal({ isOpen: true, id });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (confirmModal.id) {
      if (!adminToken) return;
      await deleteMenuItem({ id: confirmModal.id, adminToken });
      setConfirmModal({ isOpen: false, id: null });
    }
  }, [confirmModal.id, deleteMenuItem, adminToken]);

  const handleModalSubmit = useCallback(async (formData: any, selectedFile: File | null, toppingCategoryIds: string[]) => {
    try {
      if (!adminToken) return;
      let imageStorageId = formData.imageStorageId;
      let imageUrl = formData.image;

      if (selectedFile) {
        const uploadUrl = await generateUploadUrl({ adminToken });
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
        imageUrl = '';
      }

      let menuItemId: Id<'menuItems'>;
      if (editingId) {
        await updateMenuItem({
          adminToken,
          id: editingId,
          ...formData,
          image: imageUrl,
          imageStorageId,
        });
        menuItemId = editingId;
      } else {
        menuItemId = await createMenuItem({
          adminToken,
          ...formData,
          image: imageUrl || '',
          imageStorageId,
        });
      }

      await setMenuItemToppingCategories({
        adminToken,
        menuItemId,
        categoryIds: toppingCategoryIds,
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  }, [editingId, createMenuItem, updateMenuItem, generateUploadUrl, setMenuItemToppingCategories, adminToken]);

  const handleRemoveImage = useCallback(async (id: Id<'menuItems'>) => {
    if (!adminToken) return;
    await removeMenuItemImage({ id, adminToken });
  }, [removeMenuItemImage, adminToken]);


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Articles du Menu</h1>
            <p className="text-slate-600 mt-2">Gérez les articles du menu de votre restaurant</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-5 h-5" />
            Ajouter un Article
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <label className="text-sm font-medium text-slate-700">Filtrer par catégorie :</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">Toutes les Catégories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {filteredMenuItems?.length ?? 0} article{(filteredMenuItems?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems?.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              categoryFilter={categoryFilter}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        categories={categories}
        toppingCategories={toppingCategories}
        onRemoveImage={handleRemoveImage}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'Article"
        message="Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible."
      />
    </>
  );
}
