"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import MenuItemCard from '../../../src/components/admin/MenuItems/MenuItemCard';
import MenuItemModal from '../../../src/components/admin/MenuItems/MenuItemModal';
import SortableSidebarItem from '../../../src/components/admin/MenuItems/SortableSidebarItem';
import SortableArticleCard from '../../../src/components/admin/MenuItems/SortableArticleCard';
import SortableTopping from '../../../src/components/admin/MenuItems/SortableTopping';
import CategoryFormModal, { type CategoryFormData } from '../../../src/components/admin/MenuItems/CategoryFormModal';
import ToppingCategoryFormModal, { type ToppingCategoryFormData } from '../../../src/components/admin/MenuItems/ToppingCategoryFormModal';
import ToppingFormModal, { type ToppingFormData } from '../../../src/components/admin/MenuItems/ToppingFormModal';
import { Plus, Tag, LayoutGrid, GripVertical, UtensilsCrossed, Pizza, X, Search } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  arrayMove, verticalListSortingStrategy, rectSortingStrategy,
} from '@dnd-kit/sortable';

export default function MenuItemsPage() {
  const { adminToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'articles' | 'garnitures'>('articles');

  // ── Queries ─────────────────────────────────────────────────────────────────
  const menuItems = useQuery(api.menuItems.list);
  const categories = useQuery(api.categories.list);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const allToppings = useQuery(api.toppingsAdmin.listToppings);

  // ── Article mutations ────────────────────────────────────────────────────────
  const createMenuItem = useMutation(api.menuItems.create);
  const updateMenuItem = useMutation(api.menuItems.update);
  const deleteMenuItem = useMutation(api.menuItems.remove);
  const removeMenuItemImage = useMutation(api.menuItems.removeImage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setMenuItemToppingCategories = useMutation(api.toppingsAdmin.setMenuItemToppingCategories);
  const updateArticleDisplayOrder = useMutation(api.menuItems.updateDisplayOrder);
  const updateArticleCategoryOrder = useMutation(api.menuItems.updateCategoryOrder);
  const updateStock = useMutation(api.menuItems.updateStock);

  // ── Category mutations ───────────────────────────────────────────────────────
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);
  const updateCategoryDisplayOrder = useMutation(api.categories.updateDisplayOrder);

  // ── Topping category mutations ───────────────────────────────────────────────
  const createToppingCategory = useMutation(api.toppingsAdmin.createToppingCategory);
  const updateToppingCategory = useMutation(api.toppingsAdmin.updateToppingCategory);
  const deleteToppingCategory = useMutation(api.toppingsAdmin.removeToppingCategory);
  const updateToppingCategoryDisplayOrder = useMutation(api.toppingsAdmin.updateToppingCategoryDisplayOrder);

  // ── Topping mutations ────────────────────────────────────────────────────────
  const createTopping = useMutation(api.toppingsAdmin.createTopping);
  const updateTopping = useMutation(api.toppingsAdmin.updateTopping);
  const deleteTopping = useMutation(api.toppingsAdmin.removeTopping);
  const removeToppingImage = useMutation(api.toppingsAdmin.removeToppingImage);
  const updateToppingDisplayOrder = useMutation(api.toppingsAdmin.updateToppingDisplayOrder);
  const updateToppingStock = useMutation(api.toppingsAdmin.updateToppingStock);

  // ── Article UI state ─────────────────────────────────────────────────────────
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<Id<'menuItems'> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [toppingSearch, setToppingSearch] = useState('');

  // ── Menu category UI state ───────────────────────────────────────────────────
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<Id<'menuCategories'> | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({ name: '', slug: '', displayOrder: 0, active: true });
  const [categoryConfirmModal, setCategoryConfirmModal] = useState<{ isOpen: boolean; id: Id<'menuCategories'> | null }>({ isOpen: false, id: null });

  // ── Topping category UI state ────────────────────────────────────────────────
  const [toppingCategoryFilter, setToppingCategoryFilter] = useState<string>('all');
  const [isToppingCatModalOpen, setIsToppingCatModalOpen] = useState(false);
  const [editingToppingCatId, setEditingToppingCatId] = useState<Id<'toppingCategories'> | null>(null);
  const [toppingCatFormData, setToppingCatFormData] = useState<ToppingCategoryFormData>({ categoryId: '', name: '', minSelection: 0, maxSelection: undefined, displayOrder: 0, active: true, freeForBogo: false, visibleWhenCategoryId: undefined, visibleWhenToppingIds: undefined });
  const [toppingCatConfirmModal, setToppingCatConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppingCategories'> | null }>({ isOpen: false, id: null });

  // ── Topping UI state ─────────────────────────────────────────────────────────
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingToppingId, setEditingToppingId] = useState<Id<'toppings'> | null>(null);
  const [toppingFormData, setToppingFormData] = useState<ToppingFormData>({
    toppingId: '', name: '', price: 0, categoryId: '', displayOrder: 0, active: true, inStock: true,
    menuItemId: undefined, specialPrice: undefined, tvaPercent: undefined,
    image: undefined, imageStorageId: undefined
  });
  const [toppingConfirmModal, setToppingConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppings'> | null }>({ isOpen: false, id: null });

  // ── DnD state ────────────────────────────────────────────────────────────────
  const [localCategories, setLocalCategories] = useState<any[] | null>(null);
  const [localToppingCategories, setLocalToppingCategories] = useState<any[] | null>(null);
  const [localArticles, setLocalArticles] = useState<any[] | null>(null);
  const [localToppings, setLocalToppings] = useState<any[] | null>(null);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeToppingCatId, setActiveToppingCatId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [activeToppingId, setActiveToppingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { setLocalArticles(null); }, [categoryFilter]);
  useEffect(() => { setLocalToppings(null); }, [toppingCategoryFilter]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const editingItem = useMemo(() =>
    editingArticleId ? menuItems?.find(item => item._id === editingArticleId) : null,
    [editingArticleId, menuItems]
  );

  const itemCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems?.forEach(item => {
      item.categories?.forEach((cat: string) => { counts[cat] = (counts[cat] || 0) + 1; });
    });
    return counts;
  }, [menuItems]);

  const toppingCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allToppings?.forEach(t => { counts[t.categoryId] = (counts[t.categoryId] || 0) + 1; });
    return counts;
  }, [allToppings]);

  const serverFilteredArticles = useMemo(() =>
    menuItems?.filter(item =>
      categoryFilter === 'all' ? true : item.categories?.includes(categoryFilter)
    ).sort((a, b) => {
      if (categoryFilter === 'all') return (a.displayOrder || 0) - (b.displayOrder || 0);
      const orderA = a.categoryOrders?.find((o: any) => o.category === categoryFilter)?.order ?? (a.displayOrder || 0);
      const orderB = b.categoryOrders?.find((o: any) => o.category === categoryFilter)?.order ?? (b.displayOrder || 0);
      return orderA - orderB;
    }),
    [menuItems, categoryFilter]
  );

  const displayedCategories: any[] = localCategories ?? categories ?? [];
  const displayedToppingCategories: any[] = localToppingCategories ?? toppingCategories ?? [];
  const displayedArticles: any[] = localArticles ?? serverFilteredArticles ?? [];

  const displayedToppings = useMemo(() => {
    const base = localToppings ?? allToppings ?? [];
    if (toppingCategoryFilter === 'all') return base;
    return base.filter((t: any) => t.categoryId === toppingCategoryFilter);
  }, [localToppings, allToppings, toppingCategoryFilter]);

  // Search filters scoped to each section (name/description match, case-insensitive).
  const articleSearchActive = articleSearch.trim() !== '';
  const visibleArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    if (!q) return displayedArticles;
    return displayedArticles.filter((a: any) =>
      a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    );
  }, [displayedArticles, articleSearch]);

  const toppingSearchActive = toppingSearch.trim() !== '';
  const visibleToppings = useMemo(() => {
    const q = toppingSearch.trim().toLowerCase();
    if (!q) return displayedToppings;
    return displayedToppings.filter((t: any) => t.name?.toLowerCase().includes(q));
  }, [displayedToppings, toppingSearch]);

  const activeCat = activeCatId ? displayedCategories.find(c => c._id === activeCatId) : null;
  const activeToppingCat = activeToppingCatId ? displayedToppingCategories.find(c => c._id === activeToppingCatId) : null;
  const activeArticle = activeArticleId ? displayedArticles.find(a => a._id === activeArticleId) : null;
  const activeTopping = activeToppingId ? displayedToppings.find((t: any) => t._id === activeToppingId) : null;

  // ── DnD handlers ─────────────────────────────────────────────────────────────
  const handleCategoryDragStart = ({ active }: DragStartEvent) => setActiveCatId(active.id as string);
  const handleCategoryDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveCatId(null);
    if (!over || active.id === over.id || !adminToken) return;
    const oldIndex = displayedCategories.findIndex(c => c._id === active.id);
    const newIndex = displayedCategories.findIndex(c => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...displayedCategories], oldIndex, newIndex);
    setLocalCategories(reordered);
    try {
      const min = Math.min(oldIndex, newIndex), max = Math.max(oldIndex, newIndex);
      await Promise.all(reordered.slice(min, max + 1).map((cat, i) =>
        updateCategoryDisplayOrder({ adminToken, id: cat._id, displayOrder: min + i })
      ));
    } finally { setLocalCategories(null); }
  };

  const handleToppingCategoryDragStart = ({ active }: DragStartEvent) => setActiveToppingCatId(active.id as string);
  const handleToppingCategoryDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveToppingCatId(null);
    if (!over || active.id === over.id || !adminToken) return;
    const oldIndex = displayedToppingCategories.findIndex(c => c._id === active.id);
    const newIndex = displayedToppingCategories.findIndex(c => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...displayedToppingCategories], oldIndex, newIndex);
    setLocalToppingCategories(reordered);
    try {
      const min = Math.min(oldIndex, newIndex), max = Math.max(oldIndex, newIndex);
      await Promise.all(reordered.slice(min, max + 1).map((cat, i) =>
        updateToppingCategoryDisplayOrder({ adminToken, id: cat._id, displayOrder: min + i })
      ));
    } finally { setLocalToppingCategories(null); }
  };

  const handleArticleDragStart = ({ active }: DragStartEvent) => setActiveArticleId(active.id as string);
  const handleArticleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveArticleId(null);
    if (!over || active.id === over.id || !adminToken) return;
    const oldIndex = displayedArticles.findIndex(a => a._id === active.id);
    const newIndex = displayedArticles.findIndex(a => a._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...displayedArticles], oldIndex, newIndex);
    setLocalArticles(reordered);
    try {
      const min = Math.min(oldIndex, newIndex), max = Math.max(oldIndex, newIndex);
      await Promise.all(reordered.slice(min, max + 1).map((item, i) =>
        categoryFilter === 'all'
          ? updateArticleDisplayOrder({ adminToken, id: item._id, displayOrder: min + i })
          : updateArticleCategoryOrder({ adminToken, id: item._id, category: categoryFilter, order: min + i })
      ));
    } finally { setLocalArticles(null); }
  };

  const handleToppingDragStart = ({ active }: DragStartEvent) => setActiveToppingId(active.id as string);
  const handleToppingDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveToppingId(null);
    if (!over || active.id === over.id || !adminToken) return;
    const fullList = localToppings ?? allToppings ?? [];
    const base = toppingCategoryFilter === 'all'
      ? fullList
      : fullList.filter((t: any) => t.categoryId === toppingCategoryFilter);
    const oldIndex = base.findIndex((t: any) => t._id === active.id);
    const newIndex = base.findIndex((t: any) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const min = Math.min(oldIndex, newIndex), max = Math.max(oldIndex, newIndex);
    const originalOrders = base.slice(min, max + 1).map((t: any) => t.displayOrder ?? 0);
    const reordered = arrayMove([...base], oldIndex, newIndex);
    const updatedSlice = reordered.slice(min, max + 1).map((t: any, i: number) => ({ ...t, displayOrder: originalOrders[i] }));
    const newFullList = fullList
      .map((t: any) => updatedSlice.find((u: any) => u._id === t._id) ?? t)
      .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    setLocalToppings(newFullList);
    try {
      await Promise.all(updatedSlice.map((t: any) =>
        updateToppingDisplayOrder({ adminToken, id: t._id, displayOrder: t.displayOrder })
      ));
    } finally { setLocalToppings(null); }
  };

  // ── Article handlers ──────────────────────────────────────────────────────────
  const handleCreateArticle = useCallback(() => { setEditingArticleId(null); setIsArticleModalOpen(true); }, []);
  const handleEditArticle = useCallback((item: any) => { setEditingArticleId(item._id); setIsArticleModalOpen(true); }, []);

  const handleDeleteArticle = useCallback(async () => {
    if (!editingArticleId || !adminToken) return;
    await deleteMenuItem({ id: editingArticleId, adminToken });
    setIsArticleModalOpen(false); setEditingArticleId(null);
  }, [editingArticleId, deleteMenuItem, adminToken]);

  const handleToggleStock = useCallback(async (id: Id<'menuItems'>, inStock: boolean) => {
    if (!adminToken) return;
    await updateStock({ adminToken, id, inStock });
  }, [updateStock, adminToken]);

  const handleArticleModalSubmit = useCallback(async (formData: any, selectedFile: File | null, toppingCategoryIds: string[]) => {
    try {
      if (!adminToken) return;
      let imageStorageId = formData.imageStorageId, imageUrl = formData.image;
      if (selectedFile) {
        const uploadUrl = await generateUploadUrl({ adminToken });
        const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': selectedFile.type }, body: selectedFile });
        const { storageId } = await result.json();
        imageStorageId = storageId; imageUrl = '';
      }
      let menuItemId: Id<'menuItems'>;
      if (editingArticleId) {
        await updateMenuItem({ adminToken, id: editingArticleId, ...formData, image: imageUrl, imageStorageId });
        menuItemId = editingArticleId;
      } else {
        menuItemId = await createMenuItem({ adminToken, ...formData, image: imageUrl || '', imageStorageId });
      }
      await setMenuItemToppingCategories({ adminToken, menuItemId, categoryIds: toppingCategoryIds });
      setIsArticleModalOpen(false);
    } catch (error) { console.error('Error saving menu item:', error); }
  }, [editingArticleId, createMenuItem, updateMenuItem, generateUploadUrl, setMenuItemToppingCategories, adminToken]);

  const handleRemoveImage = useCallback(async (id: Id<'menuItems'>) => {
    if (!adminToken) return;
    await removeMenuItemImage({ id, adminToken });
  }, [removeMenuItemImage, adminToken]);

  // ── Menu category handlers ────────────────────────────────────────────────────
  const handleCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({ name: '', slug: '', displayOrder: categories?.length || 0, active: true });
    setIsCategoryModalOpen(true);
  };
  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat._id);
    setCategoryFormData({ name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder, active: cat.active });
    setIsCategoryModalOpen(true);
  };
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (editingCategoryId) await updateCategory({ adminToken, id: editingCategoryId, ...categoryFormData });
    else await createCategory({ adminToken, ...categoryFormData });
    setIsCategoryModalOpen(false);
  };
  const handleConfirmDeleteCategory = async () => {
    if (!categoryConfirmModal.id || !adminToken) return;
    await deleteCategory({ id: categoryConfirmModal.id, adminToken });
    if (categoryFilter !== 'all') setCategoryFilter('all');
    setCategoryConfirmModal({ isOpen: false, id: null });
  };

  // ── Topping category handlers ─────────────────────────────────────────────────
  const handleCreateToppingCategory = () => {
    setEditingToppingCatId(null);
    setToppingCatFormData({ categoryId: `cat-${Date.now()}`, name: '', minSelection: 0, maxSelection: undefined, displayOrder: toppingCategories?.length || 0, active: true, freeForBogo: false, visibleWhenCategoryId: undefined, visibleWhenToppingIds: undefined });
    setIsToppingCatModalOpen(true);
  };
  const handleEditToppingCategory = (cat: any) => {
    setEditingToppingCatId(cat._id);
    setToppingCatFormData({ categoryId: cat.categoryId, name: cat.name, minSelection: cat.minSelection, maxSelection: cat.maxSelection, displayOrder: cat.displayOrder || 0, active: cat.active !== false, freeForBogo: cat.freeForBogo === true, visibleWhenCategoryId: cat.visibleWhenCategoryId, visibleWhenToppingIds: cat.visibleWhenToppingIds });
    setIsToppingCatModalOpen(true);
  };
  const handleToppingCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (editingToppingCatId) await updateToppingCategory({ adminToken, id: editingToppingCatId, ...toppingCatFormData });
    else await createToppingCategory({ adminToken, ...toppingCatFormData });
    setIsToppingCatModalOpen(false);
  };
  const handleConfirmDeleteToppingCategory = async () => {
    if (!toppingCatConfirmModal.id || !adminToken) return;
    await deleteToppingCategory({ id: toppingCatConfirmModal.id, adminToken });
    if (toppingCategoryFilter !== 'all') setToppingCategoryFilter('all');
    setToppingCatConfirmModal({ isOpen: false, id: null });
  };

  // ── Topping handlers ──────────────────────────────────────────────────────────
  const handleCreateTopping = () => {
    setEditingToppingId(null);
    setToppingFormData({
      toppingId: `topping-${Date.now()}`, name: '', price: 0, categoryId: toppingCategories?.[0]?.categoryId || '',
      displayOrder: allToppings?.length || 0, active: true, inStock: true, menuItemId: undefined, specialPrice: undefined,
      tvaPercent: undefined, image: undefined, imageStorageId: undefined
    });
    setIsToppingModalOpen(true);
    setActiveTab('garnitures');
  };
  const handleEditTopping = (topping: any) => {
    setEditingToppingId(topping._id);
    setToppingFormData({
      toppingId: topping.toppingId, name: topping.name, price: topping.price || 0,
      categoryId: topping.categoryId, displayOrder: topping.displayOrder || 0,
      active: topping.active !== false, inStock: topping.inStock !== false, menuItemId: topping.menuItemId,
      specialPrice: topping.specialPrice, tvaPercent: topping.tvaPercent,
      image: topping.image, imageStorageId: topping.imageStorageId
    });
    setIsToppingModalOpen(true);
  };
  const handleToppingSubmit = async (formData: any, selectedFile: File | null) => {
    try {
      if (!adminToken) return;
      let imageStorageId = formData.imageStorageId, imageUrl = formData.image;
      if (selectedFile) {
        const uploadUrl = await generateUploadUrl({ adminToken });
        const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': selectedFile.type }, body: selectedFile });
        if (!result.ok) {
          alert("Erreur lors de l'upload: " + result.statusText);
          throw new Error("Upload failed");
        }
        const parsed = await result.json();
        if (!parsed.storageId) {
          alert("Erreur: pas de storageId reçu.");
          throw new Error("No storageId");
        }
        imageStorageId = parsed.storageId; imageUrl = '';
      }

      if (editingToppingId) {
        await updateTopping({ id: editingToppingId, ...formData, image: imageUrl, imageStorageId, adminToken });
      } else {
        await createTopping({ ...formData, image: imageUrl || '', imageStorageId, adminToken });
      }
      setIsToppingModalOpen(false);
    } catch (error: any) {
      alert("Erreur lors de la sauvegarde: " + error.message);
      console.error("Error saving topping:", error);
    }
  };
  const handleConfirmDeleteTopping = async () => {
    if (!toppingConfirmModal.id || !adminToken) return;
    await deleteTopping({ id: toppingConfirmModal.id, adminToken });
    setToppingConfirmModal({ isOpen: false, id: null });
  };
  const handleToggleToppingStock = async (id: Id<'toppings'>, inStock: boolean) => {
    if (!adminToken) return;
    await updateToppingStock({ adminToken, id, inStock });
  };

  // ── Sidebar helper ────────────────────────────────────────────────────────────
  const renderSidebar = (
    title: string,
    allLabel: string,
    allCount: number,
    items: any[],
    selectedId: string,
    countByKey: Record<string, number>,
    keyField: string,
    labelField: string,
    dndItems: any[],
    onSelectAll: () => void,
    onSelect: (key: string) => void,
    onAdd: () => void,
    onEdit: (item: any) => void,
    onDeleteClick: (id: any) => void,
    onDragStart: (e: DragStartEvent) => void,
    onDragEnd: (e: DragEndEvent) => void,
    overlay: React.ReactNode,
  ) => (
    <aside className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
        </div>
        <button onClick={onAdd} title="Ajouter"
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <ul className="py-1 divide-y divide-slate-100">
        <li>
          <button onClick={onSelectAll}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${selectedId === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">{allLabel}</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{allCount}</span>
          </button>
        </li>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <SortableContext items={dndItems.map(c => c._id)} strategy={verticalListSortingStrategy}>
            {dndItems.map(item => (
              <SortableSidebarItem
                key={item._id}
                id={item._id}
                isSelected={selectedId === item[keyField]}
                label={item[labelField]}
                count={countByKey[item[keyField]] ?? 0}
                active={item.active !== false}
                onSelect={() => onSelect(item[keyField])}
                onEdit={() => onEdit(item)}
                onDeleteClick={() => onDeleteClick(item._id)}
              />
            ))}
          </SortableContext>
          <DragOverlay>{overlay}</DragOverlay>
        </DndContext>
        {dndItems.length === 0 && <li className="px-4 py-6 text-center text-xs text-slate-400 italic">Aucune catégorie</li>}
      </ul>
    </aside>
  );

  const renderMobileChips = (
    allLabel: string,
    allCount: number,
    items: any[],
    selectedId: string,
    keyField: string,
    labelField: string,
    countByKey: Record<string, number>,
    onSelectAll: () => void,
    onSelect: (key: string) => void,
  ) => (
    <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <button onClick={onSelectAll}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedId === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
        {allLabel}
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedId === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>{allCount}</span>
      </button>
      {items.map(item => (
        <button key={item._id} onClick={() => onSelect(item[keyField])}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedId === item[keyField] ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
          {item[labelField]}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedId === item[keyField] ? 'bg-white/20' : 'bg-slate-100'}`}>{countByKey[item[keyField]] ?? 0}</span>
        </button>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Menu</h1>
            <p className="text-slate-500 mt-1 text-sm">Gérez vos catégories, articles et garnitures</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleCreateArticle}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 text-sm rounded-xl hover:bg-red-700 transition font-semibold">
              <Pizza className="w-4 h-4" /><span>Ajouter un Article</span>
            </button>
            <button onClick={handleCreateTopping}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 text-sm rounded-xl hover:bg-slate-600 transition font-semibold">
              <UtensilsCrossed className="w-4 h-4" /><span>Ajouter une Garniture</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-md text-sm font-medium transition ${activeTab === 'articles' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            <Pizza className="w-4 h-4" />Articles
            <span className="bg-slate-200 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">{menuItems?.length ?? 0}</span>
          </button>
          <button onClick={() => setActiveTab('garnitures')}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-md text-sm font-medium transition ${activeTab === 'garnitures' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            <UtensilsCrossed className="w-4 h-4" />Garnitures
            <span className="bg-slate-200 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">{allToppings?.length ?? 0}</span>
          </button>
        </div>

        {/* ══ ARTICLES TAB ══ */}
        {activeTab === 'articles' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            {renderSidebar(
              'Catégories', 'Toutes', menuItems?.length ?? 0,
              displayedCategories, categoryFilter, itemCountByCategory, 'slug', 'name',
              displayedCategories,
              () => setCategoryFilter('all'),
              (slug) => setCategoryFilter(slug),
              handleCreateCategory, handleEditCategory,
              (id) => setCategoryConfirmModal({ isOpen: true, id }),
              handleCategoryDragStart, handleCategoryDragEnd,
              activeCat ? (
                <div className="flex items-center bg-white shadow-xl border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 opacity-95">
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 mr-2" />
                  <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${activeCat.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  {activeCat.name}
                </div>
              ) : null,
            )}

            <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 w-full">
              {renderMobileChips('Toutes', menuItems?.length ?? 0, displayedCategories, categoryFilter, 'slug', 'name', itemCountByCategory, () => setCategoryFilter('all'), (slug) => setCategoryFilter(slug))}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Rechercher un article..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {articleSearchActive && (
                  <button onClick={() => setArticleSearch('')} title="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{visibleArticles.length}</span>
                  {' '}article{visibleArticles.length !== 1 ? 's' : ''}
                  {articleSearchActive && <span className="ml-1 text-slate-400">pour « {articleSearch} »</span>}
                  {!articleSearchActive && categoryFilter !== 'all' && <span className="ml-1 text-slate-400">dans « {categories?.find(c => c.slug === categoryFilter)?.name} »</span>}
                </span>
                {categoryFilter !== 'all' && (
                  <button onClick={() => setCategoryFilter('all')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                    <X className="w-3 h-3" /> Tout
                  </button>
                )}
                {categoryFilter !== 'all' && !articleSearchActive && (
                  <p className="ml-auto text-xs text-slate-400 hidden sm:flex items-center gap-1">
                    <GripVertical className="w-3 h-3" /> Glisser pour réorganiser
                  </p>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleArticleDragStart} onDragEnd={handleArticleDragEnd}>
                <SortableContext items={visibleArticles.map(a => a._id)} strategy={rectSortingStrategy}>
                  {visibleArticles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {visibleArticles.map(item => (
                        <SortableArticleCard
                          key={item._id}
                          item={item}
                          categoryFilter={categoryFilter}
                          onEdit={handleEditArticle}
                          onToggleStock={handleToggleStock}
                          disabled={categoryFilter === 'all' || articleSearchActive}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                      <p className="text-slate-400 text-sm mb-3">{articleSearchActive ? 'Aucun article ne correspond à votre recherche' : 'Aucun article dans cette catégorie'}</p>
                      {!articleSearchActive && (
                        <button onClick={handleCreateArticle} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition font-semibold text-sm">
                          <Plus className="w-4 h-4" /> Ajouter un article
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
                <DragOverlay>
                  {activeArticle && (
                    <div className="opacity-90 rotate-1 shadow-2xl">
                      <MenuItemCard item={activeArticle} categoryFilter={categoryFilter} onEdit={() => {}} onToggleStock={() => {}} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}

        {/* ══ GARNITURES TAB ══ */}
        {activeTab === 'garnitures' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            {renderSidebar(
              'Catégories', 'Toutes', allToppings?.length ?? 0,
              displayedToppingCategories, toppingCategoryFilter, toppingCountByCategory, 'categoryId', 'name',
              displayedToppingCategories,
              () => setToppingCategoryFilter('all'),
              (id) => setToppingCategoryFilter(id),
              handleCreateToppingCategory, handleEditToppingCategory,
              (id) => setToppingCatConfirmModal({ isOpen: true, id }),
              handleToppingCategoryDragStart, handleToppingCategoryDragEnd,
              activeToppingCat ? (
                <div className="flex items-center bg-white shadow-xl border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 opacity-95">
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 mr-2" />
                  <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${activeToppingCat.active !== false ? 'bg-green-500' : 'bg-slate-300'}`} />
                  {activeToppingCat.name}
                </div>
              ) : null,
            )}

            <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 w-full">
              {renderMobileChips('Toutes', allToppings?.length ?? 0, displayedToppingCategories, toppingCategoryFilter, 'categoryId', 'name', toppingCountByCategory, () => setToppingCategoryFilter('all'), (id) => setToppingCategoryFilter(id))}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={toppingSearch}
                  onChange={(e) => setToppingSearch(e.target.value)}
                  placeholder="Rechercher une garniture..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {toppingSearchActive && (
                  <button onClick={() => setToppingSearch('')} title="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{visibleToppings.length}</span>
                  {' '}garniture{visibleToppings.length !== 1 ? 's' : ''}
                  {toppingSearchActive && <span className="ml-1 text-slate-400">pour « {toppingSearch} »</span>}
                  {!toppingSearchActive && toppingCategoryFilter !== 'all' && <span className="ml-1 text-slate-400">dans « {toppingCategories?.find(c => c.categoryId === toppingCategoryFilter)?.name} »</span>}
                </span>
                {toppingCategoryFilter !== 'all' && (
                  <button onClick={() => setToppingCategoryFilter('all')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                    <X className="w-3 h-3" /> Tout
                  </button>
                )}
                {toppingCategoryFilter !== 'all' && !toppingSearchActive && (
                  <p className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                    <GripVertical className="w-3 h-3" /> Glisser pour réorganiser
                  </p>
                )}
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleToppingDragStart} onDragEnd={handleToppingDragEnd}>
                <SortableContext items={visibleToppings.map((t: any) => t._id)} strategy={verticalListSortingStrategy}>
                  {visibleToppings.length > 0 ? (
                    <div className="space-y-2">
                      {visibleToppings.map((topping: any) => (
                        <SortableTopping
                          key={topping._id}
                          topping={topping}
                          toppingCategories={toppingCategories}
                          onEdit={handleEditTopping}
                          onToggleStock={handleToggleToppingStock}
                          onDeleteClick={(id) => setToppingConfirmModal({ isOpen: true, id })}
                          disabled={toppingCategoryFilter === 'all' || toppingSearchActive}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                      <p className="text-slate-400 text-sm mb-3">{toppingSearchActive ? 'Aucune garniture ne correspond à votre recherche' : `Aucune garniture${toppingCategoryFilter !== 'all' ? ' dans cette catégorie' : ''}`}</p>
                      {!toppingSearchActive && (
                        <button onClick={handleCreateTopping} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition font-semibold text-sm">
                          <Plus className="w-4 h-4" /> Ajouter une garniture
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
                <DragOverlay>
                  {activeTopping && (
                    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-3 shadow-xl opacity-90">
                      <GripVertical className="w-4 h-4 text-slate-300" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{activeTopping.name}</p>
                        <p className="text-xs text-slate-500">{activeTopping.price ? `+${activeTopping.price.toFixed(2)} €` : 'Gratuit'}</p>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}
      </div>

      <MenuItemModal isOpen={isArticleModalOpen} onClose={() => { setIsArticleModalOpen(false); setEditingArticleId(null); }}
        onSubmit={handleArticleModalSubmit} editingItem={editingItem}
        onDelete={editingArticleId ? handleDeleteArticle : undefined}
        categories={categories} toppingCategories={toppingCategories} onRemoveImage={handleRemoveImage} />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        isEditing={!!editingCategoryId}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategorySubmit}
      />

      <ToppingCategoryFormModal
        isOpen={isToppingCatModalOpen}
        isEditing={!!editingToppingCatId}
        formData={toppingCatFormData}
        setFormData={setToppingCatFormData}
        onClose={() => setIsToppingCatModalOpen(false)}
        onSubmit={handleToppingCatSubmit}
        allToppingCategories={toppingCategories}
        allToppings={allToppings}
      />

      <ToppingFormModal
        isOpen={isToppingModalOpen}
        isEditing={!!editingToppingId}
        formData={toppingFormData}
        setFormData={setToppingFormData}
        onClose={() => setIsToppingModalOpen(false)}
        onSubmit={handleToppingSubmit}
        menuItems={menuItems}
        toppingCategories={toppingCategories}
        onRemoveImage={async (id) => {
          if (!adminToken) return;
          await removeToppingImage({ id, adminToken });
        }}
        editingToppingId={editingToppingId}
      />

      <ConfirmModal isOpen={categoryConfirmModal.isOpen} onClose={() => setCategoryConfirmModal({ ...categoryConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteCategory} title="Supprimer la Catégorie" message="Êtes-vous sûr de vouloir supprimer cette catégorie ?" />
      <ConfirmModal isOpen={toppingCatConfirmModal.isOpen} onClose={() => setToppingCatConfirmModal({ ...toppingCatConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteToppingCategory} title="Supprimer la Catégorie de Garnitures" message="Êtes-vous sûr de vouloir supprimer cette catégorie ?" />
      <ConfirmModal isOpen={toppingConfirmModal.isOpen} onClose={() => setToppingConfirmModal({ ...toppingConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteTopping} title="Supprimer la Garniture" message="Êtes-vous sûr de vouloir supprimer cette garniture ?" />
    </>
  );
}
