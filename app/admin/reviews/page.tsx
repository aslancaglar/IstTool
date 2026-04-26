"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { Trash2, Eye, EyeOff, Plus, X, Star } from 'lucide-react';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function ReviewsPage() {
    const { adminToken } = useAdminAuth();
    const reviews = useQuery(api.reviews.list, adminToken ? { adminToken } : "skip");
    const createReview = useMutation(api.reviews.create);
    const deleteReview = useMutation(api.reviews.remove);
    const updateReview = useMutation(api.reviews.update);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        rating: 5,
        comment: '',
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    });

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: any }>({
        isOpen: false,
        id: null
    });

    const handleDeleteClick = (id: any) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.id) {
            if (!adminToken) return;
            await deleteReview({ id: confirmModal.id, adminToken });
        }
    };

    const toggleActive = async (id: any, currentStatus: boolean) => {
        if (!adminToken) return;
        await updateReview({ id, active: !currentStatus, adminToken });
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminToken) return;
        await createReview({
            adminToken,
            ...newItem,
            active: true,
        });
        setIsAddModalOpen(false);
        setNewItem({
            name: '',
            rating: 5,
            comment: '',
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestion des Avis</h1>
                        <p className="text-slate-600 mt-2">Gérez les avis clients</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter un Avis
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Note</th>
                                    <th className="px-6 py-4">Commentaire</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {reviews?.map((review) => (
                                    <tr key={review._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900">{review.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                                        <td className="px-6 py-4">{review.date}</td>
                                        <td className="px-6 py-4">
                                            {review.active ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                                    Masqué
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleActive(review._id, review.active)}
                                                    className={`p-2 rounded-lg transition ${review.active
                                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                        }`}
                                                    title={review.active ? "Masquer l'avis" : "Afficher l'avis"}
                                                >
                                                    {review.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(review._id)}
                                                    className="p-2 rounded-lg transition bg-red-50 text-red-600 hover:bg-red-100"
                                                    title="Supprimer l'avis"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reviews?.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                                            Aucun avis trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Review Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Ajouter un Nouvel Avis</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nom du Client</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewItem({ ...newItem, rating: star })}
                                                className={`p-1 transition ${star <= newItem.rating ? 'text-yellow-400 transform scale-110' : 'text-slate-300'}`}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                                    <input
                                        type="text"
                                        value={newItem.date}
                                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="ex. 15 Janvier 2025"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Commentaire</label>
                                <textarea
                                    value={newItem.comment}
                                    onChange={(e) => setNewItem({ ...newItem, comment: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    Ajouter l'Avis
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
                title="Supprimer l'Avis"
                message="Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible."
            />
        </>
    );
}
