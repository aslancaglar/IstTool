"use client";

import { useState, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function GalleryPage() {
    const { adminToken } = useAdminAuth();
    const images = useQuery(api.gallery.list);
    const createStart = useMutation(api.files.generateUploadUrl);
    const createGalleryItem = useMutation(api.gallery.create);
    const deleteGalleryItem = useMutation(api.gallery.remove);
    const updateGalleryItem = useMutation(api.gallery.update);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: any }>({
        isOpen: false,
        id: null
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            if (!adminToken) return;
            // 1. Get upload URL
            const postUrl = await createStart({ adminToken });

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // 3. Create db record
            await createGalleryItem({
                adminToken,
                title: file.name.split('.')[0],
                imageStorageId: storageId,
                active: true,
                displayOrder: images ? images.length + 1 : 1,
            });

        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteClick = (id: any) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.id) {
            if (!adminToken) return;
            await deleteGalleryItem({ id: confirmModal.id, adminToken });
        }
    };

    const toggleActive = async (id: any, currentStatus: boolean) => {
        if (!adminToken) return;
        await updateGalleryItem({ id, active: !currentStatus, adminToken });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Galerie</h1>
                        <p className="text-sm text-slate-500 mt-1">Gérez la galerie de photos</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50"
                        >
                            {isUploading ? (
                                <span className="animate-pulse">Téléchargement...</span>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Télécharger une Photo
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images?.map((item) => (
                        <div key={item._id} className={`group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border ${!item.active ? 'opacity-50 border-dashed border-slate-300' : 'border-slate-200'}`}>
                            <img
                                src={item.url || ''}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                                <h3 className="text-white font-medium text-sm truncate flex-1">{item.title}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleActive(item._id, item.active)}
                                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-sm"
                                        title={item.active ? "Masquer" : "Afficher"}
                                    >
                                        {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item._id)}
                                        className="p-1.5 rounded-lg text-white backdrop-blur-sm bg-red-600/80 hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {images?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Aucune image dans la galerie pour le moment.</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 text-red-600 font-medium hover:text-red-700 hover:underline"
                        >
                            Télécharger votre première photo
                        </button>
                    </div>
                )}

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={handleConfirmDelete}
                    title="Supprimer l'Image"
                    message="Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible."
                />
            </div>
        </>
    );
}
