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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 mt-16">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        {editingItem ? 'Modifier l\'Article' : 'Ajouter un Article'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Description (facultative)"
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

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ordre d'affichage (par catégorie)</label>
                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {formData.categories.map((categorySlug) => {
                                    const categoryName = categories?.find(c => c.slug === categorySlug)?.name || categorySlug;
                                    const currentOrder = formData.categoryOrders?.find(o => o.category === categorySlug)?.order ?? 0;
                                    return (
                                        <div key={categorySlug} className="flex items-center gap-3">
                                            <label className="text-sm text-slate-600 w-32 truncate">{categoryName}:</label>
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
                                                className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                            <div className="space-y-3">
                                {previewUrl && (
                                    <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
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
                                                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
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
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition"
                                    >
                                        <Upload className="w-5 h-5 text-slate-500" />
                                        <span className="text-slate-600">{selectedFile ? selectedFile.name : 'Télécharger une Image'}</span>
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
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Catégories</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                                            className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                                        />
                                        <span className="text-sm text-slate-600">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="popular"
                                checked={formData.popular}
                                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                            />
                            <label htmlFor="popular" className="text-sm font-medium text-slate-700">Populaire</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-slate-700">Actif</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="inStock" className="text-sm font-medium text-slate-700">En stock</label>
                        </div>

                        {toppingCategories && toppingCategories.length > 0 && (
                            <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Catégories de Garnitures</label>
                                <div className="grid grid-cols-2 gap-2">
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
                                            className={`flex items-center gap-2 p-2 border rounded-lg transition text-left ${selectedToppingCategories.includes(cat.categoryId)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={selectedToppingCategories.includes(cat.categoryId) ? 'text-blue-500' : 'text-slate-400'}>
                                                {selectedToppingCategories.includes(cat.categoryId) ? '✓' : '+'}
                                            </span>
                                            <span className="text-sm text-slate-700">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        {/* Delete — edit mode only */}
                        {editingItem && onDelete && (
                            <div className="flex items-center gap-2">
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Supprimer</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <span className="text-xs text-red-700 font-medium hidden sm:inline">Supprimer définitivement ?</span>
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={handleDelete}
                                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
                                        >
                                            {isDeleting ? '...' : 'Oui'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-50 transition"
                                        >
                                            Non
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 flex-1 justify-end">
                            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm">
                                Annuler
                            </button>
                            <button type="submit" disabled={isUploading} className="px-6 py-2 bg-slate-900 text-white rounded-lg disabled:opacity-50 hover:bg-slate-800 transition text-sm font-medium">
                                {isUploading ? 'Téléchargement...' : editingItem ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
