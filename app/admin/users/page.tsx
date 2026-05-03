"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { User, Mail, Phone, MapPin, Calendar, Edit, Trash2, X, ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function UsersPage() {
    const { adminToken } = useAdminAuth();
    const users = useQuery(api.auth.listAllUsers, adminToken ? { adminToken } : "skip");
    const updateUser = useMutation(api.auth.updateUser);
    const removeUser = useMutation(api.auth.removeUser);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
    const [selectedUserForOrders, setSelectedUserForOrders] = useState<any>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

    const userOrders = useQuery(
        api.auth.listUserOrders,
        selectedUserForOrders && adminToken
            ? { userId: selectedUserForOrders._id, adminToken }
            : "skip" as any
    );

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        zipCode: '',
    });

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: Id<'users'> | null }>({
        isOpen: false,
        userId: null,
    });

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            street: user.street || '',
            city: user.city || '',
            zipCode: user.zipCode || '',
        });
        setIsEditModalOpen(true);
    };

    const handleOrdersClick = (user: any) => {
        setSelectedUserForOrders(user);
        setSelectedOrderForDetails(null);
        setIsOrdersModalOpen(true);
    };

    const handleOrderDetailClick = (order: any) => {
        setSelectedOrderForDetails(order);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            if (!adminToken) return;
            await updateUser({
                id: editingUser._id,
                adminToken,
                ...formData,
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Une erreur est survenue lors de la mise à jour.');
        }
    };

    const handleDeleteClick = (userId: Id<'users'>) => {
        setConfirmDelete({ isOpen: true, userId });
    };

    const handleConfirmDelete = async () => {
        if (confirmDelete.userId) {
            try {
                if (!adminToken) return;
                await removeUser({ id: confirmDelete.userId, adminToken });
                setConfirmDelete({ isOpen: false, userId: null });
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Une erreur est survenue lors de la suppression.');
            }
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
                    <p className="text-slate-500 mt-1">Visualisez et gérez les clients enregistrés</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Adresse</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Commandes</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Inscrit le</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users === undefined ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                            <td className="px-4 py-3 text-center"><div className="h-4 bg-slate-100 rounded w-8 mx-auto"></div></td>
                                            <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-slate-500 font-mono">ID: {user._id.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {user.phone}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.street ? (
                                                    <div className="flex items-start gap-2 text-sm text-slate-600">
                                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p>{user.street}</p>
                                                            <p>{user.zipCode} {user.city}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Aucune adresse</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleOrdersClick(user)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${(user.orderCount || 0) > 0
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-slate-50 text-slate-400'
                                                        }`}
                                                >
                                                    <ShoppingBag className="w-3 h-3" />
                                                    {user.orderCount || 0}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Modifier l'utilisateur</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Téléphone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse de livraison</p>
                                <input
                                    type="text"
                                    placeholder="Rue"
                                    value={formData.street}
                                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Ville"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Code Postal"
                                        value={formData.zipCode}
                                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders Modal */}
            {isOrdersModalOpen && selectedUserForOrders && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                {selectedOrderForDetails && (
                                    <button
                                        onClick={() => setSelectedOrderForDetails(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {selectedOrderForDetails ? `Détails de la commande #${selectedOrderForDetails._id.substring(0, 8).toUpperCase()}` : 'Historique des commandes'}
                                    </h2>
                                    <p className="text-sm text-slate-500">{selectedUserForOrders.firstName} {selectedUserForOrders.lastName}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOrdersModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {selectedOrderForDetails ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 rounded-full text-red-500">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Statut & Paiement</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedOrderForDetails.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                            selectedOrderForDetails.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                                'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {selectedOrderForDetails.status}
                                                    </span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-xs font-bold text-slate-700 uppercase">{selectedOrderForDetails.paymentMethod}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${selectedOrderForDetails.paymentStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {selectedOrderForDetails.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-red-600">{selectedOrderForDetails.totalPrice.toFixed(2)}€</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Service</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">{selectedOrderForDetails.type === 'pickup' ? 'À emporter' : 'Livraison'}</p>
                                            <p className="text-xs text-slate-500 mt-1">Prévu pour: <span className="text-red-600 font-bold">{selectedOrderForDetails.scheduledTime === 'asap' || !selectedOrderForDetails.scheduledTime ? 'Dès que possible' : new Date(selectedOrderForDetails.scheduledTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">{formatDate(selectedOrderForDetails.createdAt)}</p>
                                        </div>
                                    </div>

                                    {selectedOrderForDetails.type === 'delivery' && selectedOrderForDetails.address && (
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Adresse de livraison</span>
                                            </div>
                                            <div className="text-sm text-slate-700 space-y-1">
                                                <p className="font-bold">{selectedOrderForDetails.address.street}</p>
                                                <p>{selectedOrderForDetails.address.zipCode} {selectedOrderForDetails.address.city}</p>
                                                {selectedOrderForDetails.address.instructions && (
                                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800">
                                                        <span className="font-bold flex items-center gap-1 mb-1"><X className="w-3 h-3 rotate-45" /> Note:</span>
                                                        {selectedOrderForDetails.address.instructions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Articles</h4>
                                        <div className="space-y-2">
                                            {selectedOrderForDetails.items.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-bold text-slate-600">1x</span>
                                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                            </div>
                                                            {item.selectedSize && (
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 px-8">Taille: {item.selectedSize}</p>
                                                            )}
                                                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                                                                <div className="mt-2 px-8">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Suppléments:</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {item.selectedToppings.map((group: any, gIdx: number) =>
                                                                            (group.toppingNames || group.toppingIds).map((name: string, i: number) => {
                                                                                const price = group.toppingPrices?.[i] ?? null;
                                                                                return (
                                                                                    <span key={`${gIdx}-${i}`} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                                                                                        {name}
                                                                                        {price !== null && price > 0 && <span className="text-red-400 font-bold">+{price.toFixed(2)}€</span>}
                                                                                    </span>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-slate-900">{item.finalPrice.toFixed(2)}€</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {userOrders === undefined ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 animate-pulse h-24" />
                                            ))}
                                        </div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                                <ShoppingBag className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-500">Aucune commande trouvée pour ce client.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                                            {userOrders.map((order) => (
                                                <button
                                                    key={order._id}
                                                    onClick={() => handleOrderDetailClick(order)}
                                                    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all group"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">#{order._id.substring(0, 8).toUpperCase()}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                                            'bg-blue-50 text-blue-600'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span>{order.type === 'pickup' ? 'À emporter' : 'Livraison'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-red-600">{order.totalPrice.toFixed(2)}€</p>
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{order.paymentMethod} • {order.paymentStatus}</p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                                        <p className="text-xs text-slate-600 italic truncate max-w-[80%]">
                                                            {order.items.map(item => `${item.name} (x1)`).join(', ')}
                                                        </p>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors group-hover:translate-x-1" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, userId: null })}
                onConfirm={handleConfirmDelete}
                title="Supprimer l'utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et supprimera toutes les données associées."
            />
        </>
    );
}
