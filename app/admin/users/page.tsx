"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import EditUserModal, { type UserFormData } from '../../../src/components/admin/Users/EditUserModal';
import UserOrdersModal from '../../../src/components/admin/Users/UserOrdersModal';
import UsersTable from '../../../src/components/admin/Users/UsersTable';
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

  const [formData, setFormData] = useState<UserFormData>({
    firstName: '', lastName: '', email: '', phone: '', street: '', city: '', zipCode: '',
  });

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: Id<'users'> | null }>({
    isOpen: false,
    userId: null,
  });

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !adminToken) return;

    try {
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

  const handleConfirmDelete = async () => {
    if (!confirmDelete.userId || !adminToken) return;
    try {
      await removeUser({ id: confirmDelete.userId, adminToken });
      setConfirmDelete({ isOpen: false, userId: null });
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 mt-1">Visualisez et gérez les clients enregistrés</p>
        </div>

        <UsersTable
          users={users}
          onEdit={handleEditClick}
          onShowOrders={handleOrdersClick}
          onDelete={(userId) => setConfirmDelete({ isOpen: true, userId })}
        />
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
      />

      <UserOrdersModal
        isOpen={isOrdersModalOpen}
        user={selectedUserForOrders}
        orders={userOrders}
        selectedOrder={selectedOrderForDetails}
        onSelectOrder={setSelectedOrderForDetails}
        onBackToList={() => setSelectedOrderForDetails(null)}
        onClose={() => setIsOrdersModalOpen(false)}
      />

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
