"use client";

import { Mail, MapPin, Phone } from 'lucide-react';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
}

interface ProfileSectionProps {
  user: { email: string; phone?: string; street?: string; city?: string; zipCode?: string };
  isEditing: boolean;
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileSection({
  user, isEditing, formData, setFormData, onStartEdit, onCancelEdit, onSubmit,
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">Informations personnelles</h2>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="text-red-500 font-bold hover:underline"
          >
            Modifier
          </button>
        )}
      </div>
      <div className="p-8">
        {isEditing ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileInput label="Prénom" type="text" value={formData.firstName}
                onChange={(v) => setFormData({ ...formData, firstName: v })} required />
              <ProfileInput label="Nom" type="text" value={formData.lastName}
                onChange={(v) => setFormData({ ...formData, lastName: v })} required />
              <ProfileInput label="Email" type="email" value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })} required />
              <ProfileInput label="Téléphone" type="tel" value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })} required />
            </div>

            <div className="pt-6 space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Adresse par défaut</h3>
              <ProfileInput label="Rue" type="text" value={formData.street}
                onChange={(v) => setFormData({ ...formData, street: v })} placeholder="N° et nom de rue" />
              <div className="grid grid-cols-2 gap-4">
                <ProfileInput label="Code Postal" type="text" value={formData.zipCode}
                  onChange={(v) => setFormData({ ...formData, zipCode: v })} placeholder="57000" />
                <ProfileInput label="Ville" type="text" value={formData.city}
                  onChange={(v) => setFormData({ ...formData, city: v })} placeholder="Metz" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoCard icon={<Mail className="w-5 h-5" />} label="Email" value={user.email} />
              <InfoCard icon={<Phone className="w-5 h-5" />} label="Téléphone" value={user.phone || 'Non renseigné'} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Mon Adresse de Livraison
              </h3>
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                {user.street ? (
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-lg">{user.street}</p>
                    <p className="text-gray-500">{user.zipCode} {user.city}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucune adresse enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileInput({ label, type, value, onChange, required, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all"
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="bg-white p-3 rounded-xl text-red-500 shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
