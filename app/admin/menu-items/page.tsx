"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import MenuItemCard from '../../../src/components/admin/MenuItems/MenuItemCard';
import MenuItemModal from '../../../src/components/admin/MenuItems/MenuItemModal';
import { Plus, Edit, Trash2, X, Tag, LayoutGrid, GripVertical, UtensilsCrossed, Pizza } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  arrayMove, verticalListSortingStrategy, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryFormData {
  name: string; slug: string; displayOrder: number; active: boolean;
}
interface ToppingCategoryFormData {
  categoryId: string; name: string; minSelection: number;
  maxSelection: number | undefined; displayOrder: number; active: boolean;
}
interface ToppingFormData {
  toppingId: string; name: string; price: number;
  categoryId: string; displayOrder: number; active: boolean;
  menuItemId?: Id<'menuItems'>;
  specialPrice?: number;
}

// ── Shared sortable sidebar row ───────────────────────────────────────────────

function SortableSidebarItem({ id, isSelected, label, count, active, onSelect, onEdit, onDeleteClick }: {
  id: string; isSelected: boolean; label: string; count: number; active: boolean;
  onSelect: () => void; onEdit: () => void; onDeleteClick: () => void;
}) {
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

// ── Sortable article card ─────────────────────────────────────────────────────

function SortableArticleCard({ item, categoryFilter, onEdit, onToggleStock, disabled }: {
  item: any; categoryFilter: string;
  onEdit: (item: any) => void;
  onToggleStock: (id: Id<'menuItems'>, inStock: boolean) => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item._id,
    disabled
  });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? 'opacity-30' : ''}>
      <div className="relative group/card">
        {!disabled && (
          <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 opacity-60 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity rounded-t-xl bg-gradient-to-b from-black/30 to-transparent"
            {...attributes} {...listeners}>
            <GripVertical className="w-4 h-4 text-white drop-shadow" />
          </div>
        )}
        <MenuItemCard item={item} categoryFilter={categoryFilter} onEdit={onEdit} onToggleStock={onToggleStock} />
      </div>
    </div>
  );
}

// ── Sortable topping row ──────────────────────────────────────────────────────

function SortableTopping({ topping, toppingCategories, onEdit, onDeleteClick, disabled }: {
  topping: any; toppingCategories: any[] | undefined;
  onEdit: (t: any) => void; onDeleteClick: (id: Id<'toppings'>) => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: topping._id,
    disabled
  });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-3 shadow-sm ${isDragging ? 'opacity-30' : 'hover:border-slate-300'}`}>
      {!disabled && (
        <button className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
          {...attributes} {...listeners} tabIndex={-1}>
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{topping.name}</p>
          {topping.menuItemId && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-100 flex-shrink-0">
              <LayoutGrid className="w-2.5 h-2.5" />
              Article lié
            </span>
          )}
          {topping.specialPrice !== undefined && (
            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter flex-shrink-0 shadow-sm">
              Override
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
          <span className="font-bold text-blue-600">
            {topping.effectivePrice ? `+${topping.effectivePrice.toFixed(2)} €` : 'Gratuit'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{toppingCategories?.find((c: any) => c.categoryId === topping.categoryId)?.name ?? topping.categoryId}</span>
          {topping.active === false && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-red-500 font-medium">Inactif</span>
            </>
          )}
        </p>
      </div>
      <div className="flex gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition ml-auto">
        <button onClick={() => onEdit(topping)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDeleteClick(topping._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

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
  const updateToppingDisplayOrder = useMutation(api.toppingsAdmin.updateToppingDisplayOrder);

  // ── Article UI state ─────────────────────────────────────────────────────────
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<Id<'menuItems'> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // ── Menu category UI state ───────────────────────────────────────────────────
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<Id<'menuCategories'> | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({ name: '', slug: '', displayOrder: 0, active: true });
  const [categoryConfirmModal, setCategoryConfirmModal] = useState<{ isOpen: boolean; id: Id<'menuCategories'> | null }>({ isOpen: false, id: null });

  // ── Topping category UI state ────────────────────────────────────────────────
  const [toppingCategoryFilter, setToppingCategoryFilter] = useState<string>('all');
  const [isToppingCatModalOpen, setIsToppingCatModalOpen] = useState(false);
  const [editingToppingCatId, setEditingToppingCatId] = useState<Id<'toppingCategories'> | null>(null);
  const [toppingCatFormData, setToppingCatFormData] = useState<ToppingCategoryFormData>({ categoryId: '', name: '', minSelection: 0, maxSelection: undefined, displayOrder: 0, active: true });
  const [toppingCatConfirmModal, setToppingCatConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppingCategories'> | null }>({ isOpen: false, id: null });

  // ── Topping UI state ─────────────────────────────────────────────────────────
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingToppingId, setEditingToppingId] = useState<Id<'toppings'> | null>(null);
  const [toppingFormData, setToppingFormData] = useState<ToppingFormData>({ 
    toppingId: '', name: '', price: 0, categoryId: '', displayOrder: 0, active: true, 
    menuItemId: undefined, specialPrice: undefined 
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
    setToppingCatFormData({ categoryId: `cat-${Date.now()}`, name: '', minSelection: 0, maxSelection: undefined, displayOrder: toppingCategories?.length || 0, active: true });
    setIsToppingCatModalOpen(true);
  };
  const handleEditToppingCategory = (cat: any) => {
    setEditingToppingCatId(cat._id);
    setToppingCatFormData({ categoryId: cat.categoryId, name: cat.name, minSelection: cat.minSelection, maxSelection: cat.maxSelection, displayOrder: cat.displayOrder || 0, active: cat.active !== false });
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
      displayOrder: allToppings?.length || 0, active: true, menuItemId: undefined, specialPrice: undefined 
    });
    setIsToppingModalOpen(true);
    setActiveTab('garnitures');
  };
  const handleEditTopping = (topping: any) => {
    setEditingToppingId(topping._id);
    setToppingFormData({ 
      toppingId: topping.toppingId, name: topping.name, price: topping.price || 0, 
      categoryId: topping.categoryId, displayOrder: topping.displayOrder || 0, 
      active: topping.active !== false, menuItemId: topping.menuItemId,
      specialPrice: topping.specialPrice
    });
    setIsToppingModalOpen(true);
  };
  const handleToppingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    if (editingToppingId) await updateTopping({ id: editingToppingId, ...toppingFormData, adminToken });
    else await createTopping({ ...toppingFormData, adminToken });
    setIsToppingModalOpen(false);
  };
  const handleConfirmDeleteTopping = async () => {
    if (!toppingConfirmModal.id || !adminToken) return;
    await deleteTopping({ id: toppingConfirmModal.id, adminToken });
    setToppingConfirmModal({ isOpen: false, id: null });
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Menu</h1>
            <p className="text-slate-600 mt-0.5 text-sm sm:text-base">Gérez vos catégories, articles et garnitures</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleCreateArticle}
              className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 sm:px-4 text-sm rounded-lg hover:bg-slate-800 transition">
              <Pizza className="w-4 h-4" /><span>Ajouter un Article</span>
            </button>
            <button onClick={handleCreateTopping}
              className="flex items-center gap-2 bg-slate-700 text-white px-3 py-2 sm:px-4 text-sm rounded-lg hover:bg-slate-600 transition">
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

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{displayedArticles.length}</span>
                  {' '}article{displayedArticles.length !== 1 ? 's' : ''}
                  {categoryFilter !== 'all' && <span className="ml-1 text-slate-400">dans « {categories?.find(c => c.slug === categoryFilter)?.name} »</span>}
                </span>
                {categoryFilter !== 'all' && (
                  <button onClick={() => setCategoryFilter('all')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                    <X className="w-3 h-3" /> Tout
                  </button>
                )}
                  {categoryFilter !== 'all' && (
                    <p className="ml-auto text-xs text-slate-400 hidden sm:flex items-center gap-1">
                      <GripVertical className="w-3 h-3" /> Glisser pour réorganiser
                    </p>
                  )}
                </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleArticleDragStart} onDragEnd={handleArticleDragEnd}>
                <SortableContext items={displayedArticles.map(a => a._id)} strategy={rectSortingStrategy}>
                  {displayedArticles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {displayedArticles.map(item => (
                        <SortableArticleCard 
                          key={item._id} 
                          item={item} 
                          categoryFilter={categoryFilter} 
                          onEdit={handleEditArticle} 
                          onToggleStock={handleToggleStock}
                          disabled={categoryFilter === 'all'}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                      <p className="text-slate-400 text-sm mb-3">Aucun article dans cette catégorie</p>
                      <button onClick={handleCreateArticle} className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                        <Plus className="w-4 h-4" /> Ajouter un article
                      </button>
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

              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{displayedToppings.length}</span>
                  {' '}garniture{displayedToppings.length !== 1 ? 's' : ''}
                  {toppingCategoryFilter !== 'all' && <span className="ml-1 text-slate-400">dans « {toppingCategories?.find(c => c.categoryId === toppingCategoryFilter)?.name} »</span>}
                </span>
                {toppingCategoryFilter !== 'all' && (
                  <button onClick={() => setToppingCategoryFilter('all')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                    <X className="w-3 h-3" /> Tout
                  </button>
                )}
                  {toppingCategoryFilter !== 'all' && (
                    <p className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                      <GripVertical className="w-3 h-3" /> Glisser pour réorganiser
                    </p>
                  )}
                </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleToppingDragStart} onDragEnd={handleToppingDragEnd}>
                <SortableContext items={displayedToppings.map((t: any) => t._id)} strategy={verticalListSortingStrategy}>
                  {displayedToppings.length > 0 ? (
                    <div className="space-y-2">
                      {displayedToppings.map((topping: any) => (
                        <SortableTopping 
                          key={topping._id} 
                          topping={topping} 
                          toppingCategories={toppingCategories}
                          onEdit={handleEditTopping}
                          onDeleteClick={(id) => setToppingConfirmModal({ isOpen: true, id })}
                          disabled={toppingCategoryFilter === 'all'}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                      <p className="text-slate-400 text-sm mb-3">Aucune garniture{toppingCategoryFilter !== 'all' ? ' dans cette catégorie' : ''}</p>
                      <button onClick={handleCreateTopping} className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                        <Plus className="w-4 h-4" /> Ajouter une garniture
                      </button>
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

      {/* ── Article modal ── */}
      <MenuItemModal isOpen={isArticleModalOpen} onClose={() => { setIsArticleModalOpen(false); setEditingArticleId(null); }}
        onSubmit={handleArticleModalSubmit} editingItem={editingItem}
        onDelete={editingArticleId ? handleDeleteArticle : undefined}
        categories={categories} toppingCategories={toppingCategories} onRemoveImage={handleRemoveImage} />

      {/* ── Menu category modal ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingCategoryId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input type="text" value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                <input type="text" value={categoryFormData.slug} onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ordre d'affichage</label>
                <input type="number" value={categoryFormData.displayOrder} onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cat-active" checked={categoryFormData.active} onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="cat-active" className="text-sm font-medium text-slate-700">Actif</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">{editingCategoryId ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Topping category modal ── */}
      {isToppingCatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingToppingCatId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie de Garniture'}</h2>
              <button onClick={() => setIsToppingCatModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleToppingCatSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input type="text" value={toppingCatFormData.name} onChange={(e) => setToppingCatFormData({ ...toppingCatFormData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" placeholder="ex: Sauces, Crudités" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ID de la Catégorie</label>
                <input type="text" value={toppingCatFormData.categoryId} onChange={(e) => setToppingCatFormData({ ...toppingCatFormData, categoryId: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono" placeholder="ex: sauces" required />
                <p className="text-xs text-slate-500 mt-1">Identifiant unique</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sélection min</label>
                  <input type="number" min="0" value={toppingCatFormData.minSelection} onChange={(e) => setToppingCatFormData({ ...toppingCatFormData, minSelection: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required />
                  <p className="text-xs text-slate-500 mt-1">0 = facultatif</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sélection max</label>
                  <input type="number" min="0" value={toppingCatFormData.maxSelection ?? ''} onChange={(e) => setToppingCatFormData({ ...toppingCatFormData, maxSelection: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" placeholder="∞" />
                  <p className="text-xs text-slate-500 mt-1">Vide = illimité</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="tcat-active" checked={toppingCatFormData.active} onChange={(e) => setToppingCatFormData({ ...toppingCatFormData, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="tcat-active" className="text-sm font-medium text-slate-700">Actif</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsToppingCatModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">{editingToppingCatId ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Topping modal ── */}
      {isToppingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingToppingId ? 'Modifier la Garniture' : 'Ajouter une Garniture'}</h2>
              <button onClick={() => setIsToppingModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleToppingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                <input type="text" value={toppingFormData.name} onChange={(e) => setToppingFormData({ ...toppingFormData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prix (€)</label>
                <input type="number" step="0.01" min="0" value={toppingFormData.price} onChange={(e) => setToppingFormData({ ...toppingFormData, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                <p className="text-xs text-slate-500 mt-1">0 = gratuit. Utilisé si aucun article n'est lié.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prix Spécial (Override) (€)</label>
                <input 
                  type="number" step="0.01" min="0" 
                  value={toppingFormData.specialPrice ?? ""} 
                  onChange={(e) => setToppingFormData({ ...toppingFormData, specialPrice: e.target.value ? parseFloat(e.target.value) : undefined })} 
                  className="w-full px-4 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Laisser vide pour prix par défaut"
                />
                <p className="text-xs text-blue-600 mt-1">Si rempli, ce prix remplace le prix de l'article lié.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lier à un article du menu (Optionnel)</label>
                <select 
                  value={toppingFormData.menuItemId || ""} 
                  onChange={(e) => {
                    const selectedId = e.target.value as Id<'menuItems'> | "";
                    const item = menuItems?.find(i => i._id === selectedId);
                    setToppingFormData({ 
                      ...toppingFormData, 
                      menuItemId: selectedId || undefined,
                      // Automatically fill name and price if they are empty
                      name: toppingFormData.name || (item?.name || ""),
                      price: toppingFormData.price || (item?.price || 0)
                    });
                  }} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                >
                  <option value="">Aucun article lié</option>
                  {menuItems?.map(item => (
                    <option key={item._id} value={item._id}>{item.name} ({item.price.toFixed(2)}€)</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">L'article sélectionné sera traité comme une garniture.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select value={toppingFormData.categoryId} onChange={(e) => setToppingFormData({ ...toppingFormData, categoryId: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" required>
                  <option value="">Choisir une catégorie</option>
                  {toppingCategories?.map(cat => <option key={cat._id} value={cat.categoryId}>{cat.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="topping-active" checked={toppingFormData.active} onChange={(e) => setToppingFormData({ ...toppingFormData, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="topping-active" className="text-sm font-medium text-slate-700">Actif</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsToppingModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">{editingToppingId ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm modals ── */}
      <ConfirmModal isOpen={categoryConfirmModal.isOpen} onClose={() => setCategoryConfirmModal({ ...categoryConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteCategory} title="Supprimer la Catégorie" message="Êtes-vous sûr de vouloir supprimer cette catégorie ?" />
      <ConfirmModal isOpen={toppingCatConfirmModal.isOpen} onClose={() => setToppingCatConfirmModal({ ...toppingCatConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteToppingCategory} title="Supprimer la Catégorie de Garnitures" message="Êtes-vous sûr de vouloir supprimer cette catégorie ?" />
      <ConfirmModal isOpen={toppingConfirmModal.isOpen} onClose={() => setToppingConfirmModal({ ...toppingConfirmModal, isOpen: false })} onConfirm={handleConfirmDeleteTopping} title="Supprimer la Garniture" message="Êtes-vous sûr de vouloir supprimer cette garniture ?" />
    </>
  );
}
