"use client";

import { X } from 'lucide-react';

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditUserModal({ isOpen, formData, setFormData, onClose, onSubmit }: EditUserModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Modifier l'utilisateur</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" type="text" value={formData.firstName} required
              onChange={(v) => setFormData({ ...formData, firstName: v })} />
            <Field label="Nom" type="text" value={formData.lastName} required
              onChange={(v) => setFormData({ ...formData, lastName: v })} />
          </div>
          <Field label="Email" type="email" value={formData.email} required
            onChange={(v) => setFormData({ ...formData, email: v })} />
          <Field label="Téléphone" type="tel" value={formData.phone} required
            onChange={(v) => setFormData({ ...formData, phone: v })} />

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse de livraison</p>
            <input
              type="text"
              placeholder="Rue"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
              />
              <input
                type="text"
                placeholder="Code Postal"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
  );
}

function Field({ label, type, value, required, onChange }: { label: string; type: string; value: string; required?: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 text-sm"
      />
    </div>
  );
}
