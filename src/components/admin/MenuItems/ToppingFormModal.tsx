"use client";

import { useRef, useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';

export interface ToppingFormData {
  toppingId: string;
  name: string;
  price: number;
  categoryId: string;
  displayOrder: number;
  active: boolean;
  inStock: boolean;
  menuItemId?: Id<'menuItems'>;
  specialPrice?: number;
  tvaPercent?: number;
  image?: string;
  imageStorageId?: Id<'_storage'>;
}

interface ToppingFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: ToppingFormData;
  setFormData: (data: ToppingFormData) => void;
  onClose: () => void;
  onSubmit: (formData: ToppingFormData, selectedFile: File | null) => Promise<void>;
  menuItems: any[] | undefined;
  toppingCategories: any[] | undefined;
  onRemoveImage: (id: Id<'toppings'>) => Promise<void>;
  editingToppingId: Id<'toppings'> | null;
}

export default function ToppingFormModal({
  isOpen,
  isEditing,
  formData,
  setFormData,
  onClose,
  onSubmit,
  menuItems,
  toppingCategories,
  onRemoveImage,
  editingToppingId
}: ToppingFormModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (formData.image) {
        setPreviewUrl(formData.image);
      } else {
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, formData.image]);

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
      await onSubmit(formData, selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Modifier la Garniture' : 'Ajouter une Garniture'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Image</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {previewUrl && (
                  <div className="relative w-full sm:w-48 h-32 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    {isEditing && editingToppingId && formData.imageStorageId && (
                      <button
                        type="button"
                        disabled={isDeletingImage}
                        onClick={async () => {
                          setIsDeletingImage(true);
                          try {
                            await onRemoveImage(editingToppingId);
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setFormData({ ...formData, image: '', imageStorageId: undefined });
                          } finally {
                            setIsDeletingImage(false);
                          }
                        }}
                        className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 shadow-sm transition disabled:opacity-50"
                        title="Supprimer l'Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                <div className="flex-1 space-y-3 flex flex-col justify-center">
                  <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-600 text-slate-600 transition font-medium text-sm w-full"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="truncate">{selectedFile ? selectedFile.name : 'Télécharger une Image'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setPreviewUrl(e.target.value);
                      setSelectedFile(null);
                    }}
                    placeholder="Ou coller une URL d'image existante..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix (€)</label>
              <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-xs text-slate-500 mt-1">0 = gratuit. Utilisé si aucun article n'est lié.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prix Spécial (Override) (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={formData.specialPrice ?? ""}
                onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-blue-200 bg-blue-50/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Laisser vide pour prix par défaut"
              />
              <p className="text-xs text-blue-600 mt-1">Si rempli, ce prix remplace le prix de l'article lié.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">TVA (%)</label>
              <input
                type="number" step="0.1" min="0" max="100"
                value={formData.tvaPercent ?? ''}
                onChange={(e) => setFormData({ ...formData, tvaPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="10"
              />
              <p className="text-xs text-slate-500 mt-1">Par défaut : 10%. Prix affiché TTC.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lier à un article du menu (Optionnel)</label>
              <select
                value={formData.menuItemId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value as Id<'menuItems'> | "";
                  const item = menuItems?.find(i => i._id === selectedId);
                  setFormData({
                    ...formData,
                    menuItemId: selectedId || undefined,
                    name: formData.name || (item?.name || ""),
                    price: formData.price || (item?.price || 0)
                  });
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Aucun article lié</option>
                {menuItems?.map(item => (
                  <option key={item._id} value={item._id}>{item.name} ({item.price.toFixed(2)}€)</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">L'article sélectionné sera traité comme une garniture.</p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégorie</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required>
                <option value="">Choisir une catégorie</option>
                {toppingCategories?.map(cat => <option key={cat._id} value={cat.categoryId}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="topping-active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              <label htmlFor="topping-active" className="text-sm font-medium text-slate-700">Actif</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="topping-instock" checked={formData.inStock} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              <label htmlFor="topping-instock" className="text-sm font-medium text-slate-700">En stock</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isUploading} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-semibold text-sm disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={isUploading} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm flex items-center justify-center disabled:opacity-50">
              {isUploading ? <span className="animate-pulse">Enregistrement...</span> : (isEditing ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
