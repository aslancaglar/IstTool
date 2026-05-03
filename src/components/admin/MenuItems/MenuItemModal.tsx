"use client";

import { useRef, useState, useEffect } from 'react';
import { X, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

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
    inStock: boolean;
    isUpsell: boolean;
}

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: MenuItemFormData, selectedFile: File | null, toppingCategoryIds: string[]) => Promise<void>;
    onDelete?: () => Promise<void>;
    editingItem: any | null;
    categories: any[] | undefined;
    toppingCategories: any[] | undefined;
    onRemoveImage: (id: Id<'menuItems'>) => Promise<void>;
}

export default function MenuItemModal({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    editingItem,
    categories,
    toppingCategories,
    onRemoveImage,
}: MenuItemModalProps) {
    const [formData, setFormData] = useState<MenuItemFormData>({
        name: '',
        description: '',
        price: 0,
        image: '',
        categories: [],
        popular: false,
        displayOrder: 0,
        categoryOrders: [],
        active: true,
        inStock: true,
        isUpsell: false,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeletingImage, setIsDeletingImage] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedToppingCategories, setSelectedToppingCategories] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setShowDeleteConfirm(false);
        if (editingItem) {
            setFormData({
                name: editingItem.name,
                description: editingItem.description || '',
                price: editingItem.price,
                image: editingItem.image,
                imageStorageId: editingItem.imageStorageId,
                categories: editingItem.categories || [],
                popular: editingItem.popular || false,
                displayOrder: editingItem.displayOrder || 0,
                categoryOrders: editingItem.categoryOrders || [],
                active: editingItem.active !== false,
                inStock: editingItem.inStock !== false,
                isUpsell: editingItem.isUpsell || false,
            });
            setPreviewUrl(editingItem.image);
            const toppingIds = (editingItem.toppingCategoryIds as string[] | undefined) || [];
            setSelectedToppingCategories(Array.from(new Set(toppingIds)));
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                image: '',
                categories: categories?.[0]?.slug ? [categories[0].slug] : [],
                popular: false,
                displayOrder: 0,
                categoryOrders: [],
                active: true,
                inStock: true,
                isUpsell: false,
            });
            setPreviewUrl(null);
            setSelectedToppingCategories([]);
        }
        setSelectedFile(null);
    }, [editingItem, categories, isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            await onSubmit(formData, selectedFile, selectedToppingCategories);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">
                        {editingItem ? 'Modifier l\'Article' : 'Ajouter un Article'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Description (facultative)"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ordre d'affichage (par catégorie)</label>
                            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                {formData.categories.map((categorySlug) => {
                                    const categoryName = categories?.find(c => c.slug === categorySlug)?.name || categorySlug;
                                    const currentOrder = formData.categoryOrders?.find(o => o.category === categorySlug)?.order ?? 0;
                                    return (
                                        <div key={categorySlug} className="flex items-center gap-3">
                                            <label className="text-sm font-medium text-slate-600 w-32 truncate">{categoryName}:</label>
                                            <input
                                                type="number"
                                                value={currentOrder}
                                                onChange={(e) => {
                                                    const newOrder = parseInt(e.target.value) || 0;
                                                    const newCategoryOrders = [...(formData.categoryOrders || [])];
                                                    const existingIndex = newCategoryOrders.findIndex(o => o.category === categorySlug);
                                                    if (existingIndex >= 0) {
                                                        newCategoryOrders[existingIndex] = { category: categorySlug, order: newOrder };
                                                    } else {
                                                        newCategoryOrders.push({ category: categorySlug, order: newOrder });
                                                    }
                                                    setFormData({ ...formData, categoryOrders: newCategoryOrders });
                                                }}
                                                className="w-20 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Image</label>
                            <div className="space-y-3">
                                {previewUrl && (
                                    <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                        {editingItem && (
                                            <button
                                                type="button"
                                                disabled={isDeletingImage}
                                                onClick={async () => {
                                                    setIsDeletingImage(true);
                                                    try {
                                                        await onRemoveImage(editingItem._id);
                                                        setPreviewUrl(null);
                                                        setSelectedFile(null);
                                                        setFormData(prev => ({ ...prev, image: '', imageStorageId: undefined }));
                                                    } finally {
                                                        setIsDeletingImage(false);
                                                    }
                                                }}
                                                className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 shadow-sm transition disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {isDeletingImage ? 'Suppression...' : 'Supprimer l\'Image'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-600 text-slate-600 transition font-medium text-sm w-full"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>{selectedFile ? selectedFile.name : 'Télécharger une Image'}</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image: e.target.value });
                                        if (!selectedFile) setPreviewUrl(e.target.value);
                                    }}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégories</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                {categories?.map((cat) => (
                                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(cat.slug)}
                                            onChange={(e) => {
                                                const newCategories = e.target.checked
                                                    ? [...formData.categories, cat.slug]
                                                    : formData.categories.filter((c) => c !== cat.slug);
                                                setFormData({ ...formData, categories: newCategories });
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 col-span-2 sm:flex-row sm:gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="popular"
                                    checked={formData.popular}
                                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                                <label htmlFor="popular" className="text-sm font-medium text-slate-700 cursor-pointer">Populaire</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">Actif</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <label htmlFor="inStock" className="text-sm font-medium text-slate-700 cursor-pointer">En stock</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isUpsell"
                                    checked={formData.isUpsell}
                                    onChange={(e) => setFormData({ ...formData, isUpsell: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                />
                                <label htmlFor="isUpsell" className="text-sm font-medium text-slate-700 cursor-pointer">Upsell <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">(Panier)</span></label>
                            </div>
                        </div>

                        {toppingCategories && toppingCategories.length > 0 && (
                            <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                                <label className="block text-xs font-semibold text-slate-600 mb-3">Catégories de Garnitures</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {toppingCategories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => {
                                                if (selectedToppingCategories.includes(cat.categoryId)) {
                                                    setSelectedToppingCategories(selectedToppingCategories.filter(id => id !== cat.categoryId));
                                                } else {
                                                    setSelectedToppingCategories([...selectedToppingCategories, cat.categoryId]);
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 border rounded-xl transition text-left text-sm font-semibold ${selectedToppingCategories.includes(cat.categoryId)
                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={`w-4 h-4 flex items-center justify-center border rounded-full text-[10px] flex-shrink-0 transition-colors ${selectedToppingCategories.includes(cat.categoryId) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 text-transparent'}`}>
                                                ✓
                                            </span>
                                            <span className="truncate">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                        {/* Delete — edit mode only */}
                        {editingItem && onDelete && (
                            <div className="w-full sm:w-auto mb-2 sm:mb-0">
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition font-semibold w-full sm:w-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Supprimer</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
                                        <div className="flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <span className="text-xs text-red-700 font-bold whitespace-nowrap">Sûr ?</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={handleDelete}
                                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                {isDeleting ? '...' : 'Oui'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                                            >
                                                Non
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 w-full sm:flex-1 sm:justify-end">
                            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-semibold text-sm">
                                Annuler
                            </button>
                            <button type="submit" disabled={isUploading} className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 text-white rounded-xl disabled:opacity-50 hover:bg-red-700 transition text-sm font-semibold">
                                {isUploading ? 'Téléchargement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
