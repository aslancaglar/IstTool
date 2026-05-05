"use client";

import { Calendar, Edit, Mail, MapPin, Phone, ShoppingBag, Trash2, User as UserIcon } from 'lucide-react';
import type { Id } from '../../../../convex/_generated/dataModel';

interface UsersTableProps {
  users: any[] | undefined;
  onEdit: (user: any) => void;
  onShowOrders: (user: any) => void;
  onDelete: (userId: Id<'users'>) => void;
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default function UsersTable({ users, onEdit, onShowOrders, onDelete }: UsersTableProps) {
  return (
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
                        <UserIcon className="w-4 h-4" />
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
                      onClick={() => onShowOrders(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        (user.orderCount || 0) > 0
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
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user._id)}
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
  );
}
