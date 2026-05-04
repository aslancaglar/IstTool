"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { ShieldCheck, ShoppingCart, Plus, Trash2, X, KeyRound } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

const ROLE_LABELS: Record<string, { label: string; icon: typeof ShieldCheck; color: string }> = {
  admin: { label: 'Administrateur', icon: ShieldCheck, color: 'bg-red-50 text-red-700 border-red-100' },
  orders_manager: { label: 'Gestionnaire de commandes', icon: ShoppingCart, color: 'bg-blue-50 text-blue-700 border-blue-100' },
};

export default function AdminAccountsPage() {
  const { admin, adminToken } = useAdminAuth();
  const admins = useQuery(api.auth.listAdminUsers, adminToken ? { adminToken } : 'skip');
  const createAdminUser = useMutation(api.auth.createAdminUser);
  const deleteAdminUser = useMutation(api.auth.deleteAdminUser);
  const updateAdminPassword = useMutation(api.auth.updateAdminPassword);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'orders_manager' as 'admin' | 'orders_manager' });
  const [createError, setCreateError] = useState('');

  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; targetId: Id<'adminUsers'> | null; username: string }>({ isOpen: false, targetId: null, username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: Id<'adminUsers'> | null; username: string }>({ isOpen: false, id: null, username: '' });

  const isSelf = (id: Id<'adminUsers'>) => id === admin?.id;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      if (!adminToken) return;
      await createAdminUser({ adminToken, username: createForm.username, password: createForm.password, role: createForm.role });
      setIsCreateOpen(false);
      setCreateForm({ username: '', password: '', role: 'orders_manager' });
    } catch (err: any) {
      setCreateError(err.message ?? 'Erreur lors de la création du compte.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id || !adminToken) return;
    await deleteAdminUser({ adminToken, targetId: confirmDelete.id });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) { setPasswordError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    try {
      if (!adminToken || !passwordModal.targetId) return;
      await updateAdminPassword({ adminToken, targetId: passwordModal.targetId, newPassword });
      setPasswordModal({ isOpen: false, targetId: null, username: '' });
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Comptes administrateurs</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez les accès au tableau de bord</p>
          </div>
          <button
            onClick={() => { setIsCreateOpen(true); setCreateError(''); }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Créé le</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admins?.map((a) => {
                const roleInfo = ROLE_LABELS[a.role] ?? ROLE_LABELS.admin;
                const RoleIcon = roleInfo.icon;
                const self = isSelf(a._id);
                return (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{a.username}</span>
                        {self && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">vous</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setPasswordModal({ isOpen: true, targetId: a._id, username: a.username }); setNewPassword(''); setPasswordError(''); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Changer le mot de passe"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          disabled={self}
                          onClick={() => setConfirmDelete({ isOpen: true, id: a._id, username: a.username })}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={self ? 'Impossible de supprimer votre propre compte' : 'Supprimer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Nouveau compte administrateur</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom d'utilisateur</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rôle</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'admin' | 'orders_manager' })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="orders_manager">Gestionnaire de commandes — accès commandes uniquement</option>
                  <option value="admin">Administrateur — accès complet</option>
                </select>
              </div>
              {createError && <p className="text-sm text-red-600 font-medium">{createError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPasswordModal({ isOpen: false, targetId: null, username: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Changer le mot de passe</h2>
              <button onClick={() => setPasswordModal({ isOpen: false, targetId: null, username: '' })} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Nouveau mot de passe pour <span className="font-semibold text-slate-900">{passwordModal.username}</span></p>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {passwordError && <p className="text-sm text-red-600 font-medium">{passwordError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPasswordModal({ isOpen: false, targetId: null, username: '' })} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, username: '' })}
        onConfirm={handleDelete}
        title="Supprimer le compte"
        message={`Supprimer le compte « ${confirmDelete.username} » ? Cette action est irréversible.`}
      />
    </>
  );
}
