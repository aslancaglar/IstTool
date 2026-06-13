"use client";

import { User, MapPin, Edit2, CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface CustomerInfoSectionProps {
    user: any;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    setCustomer: (customer: any) => void;
    address: {
        street: string;
        city: string;
        zipCode: string;
        instructions: string;
    };
    setAddress: (address: any) => void;
    orderType: 'pickup' | 'delivery' | 'dine_in' | null;
    isEditingInfo: boolean;
    setIsEditingInfo: (isEditing: boolean) => void;
    isDeliverySupported: boolean;
    handleSaveUserInfo: () => Promise<void>;
}

function SectionTitle({ icon: Icon, label, children }: { icon: any; label: string; color?: string; children?: React.ReactNode }) {
    return (
        <div className="px-5 py-4 bg-primary-600 flex items-center gap-2.5">
            <Icon className="w-4 h-4 text-white" />
            <span className="flex-1 text-sm font-bold text-white uppercase tracking-widest">{label}</span>
            {children}
        </div>
    );
}

function InputField({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${color}`}>{label}</label>
            {children}
        </div>
    );
}

export default function CustomerInfoSection({
    user,
    customer,
    setCustomer,
    address,
    setAddress,
    orderType,
    isEditingInfo,
    setIsEditingInfo,
    isDeliverySupported,
    handleSaveUserInfo
}: CustomerInfoSectionProps) {
    if (!isEditingInfo && user) {
        return (
            <div className="animate-in fade-in duration-500">
                <SectionTitle icon={User} label="Mes informations">
                    <button
                        onClick={() => setIsEditingInfo(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors shrink-0"
                    >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                    </button>
                </SectionTitle>

                <div className="p-5 md:p-8">
                    <div className={`grid grid-cols-1 ${orderType === 'dine_in' ? '' : 'md:grid-cols-2'} gap-4`}>
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">Contact</p>
                            <p className="font-bold text-gray-900 text-base">{customer.firstName} {customer.lastName}</p>
                            <div className="mt-2 space-y-1.5">
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                                    {customer.email}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                                    {customer.phone}
                                </p>
                            </div>
                        </div>

                        {orderType !== 'dine_in' && (
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">
                                    {orderType === 'delivery' ? 'Adresse de livraison' : 'Adresse'}
                                </p>
                                {address.street ? (
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-base">{address.street}</p>
                                        <p className="text-sm text-gray-500">{address.zipCode} {address.city}</p>
                                        {address.instructions && (
                                            <div className="mt-3 p-2.5 bg-white rounded-xl border border-dashed border-gray-200">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Note pour le livreur:</p>
                                                <p className="text-xs text-gray-600 italic leading-relaxed">"{address.instructions}"</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <MapPin className="w-7 h-7 text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                                            {orderType === 'delivery' ? 'Adresse manquante' : 'Non renseignée'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all font-medium text-sm placeholder:text-gray-400 text-gray-800";

    return (
        <div className="animate-in slide-in-from-top-4 duration-500">
                <SectionTitle icon={User} label="Édition des informations">
                    {user && (
                        <button
                            onClick={() => setIsEditingInfo(false)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </SectionTitle>

            <div className="p-5 md:p-8 space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Prénom" color="text-gray-600">
                            <input
                                type="text"
                                value={customer.firstName}
                                onChange={e => setCustomer({ ...customer, firstName: e.target.value })}
                                className={inputClass}
                                placeholder="Ex: Jean"
                            />
                        </InputField>
                        <InputField label="Nom" color="text-gray-600">
                            <input
                                type="text"
                                value={customer.lastName}
                                onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
                                className={inputClass}
                                placeholder="Ex: Dupont"
                            />
                        </InputField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Email" color="text-gray-600">
                            <input
                                type="email"
                                value={customer.email}
                                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                className={inputClass}
                                placeholder="votre@email.com"
                            />
                        </InputField>
                        <InputField label="Téléphone" color="text-gray-600">
                            <input
                                type="tel"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                className={inputClass}
                                placeholder="06 12 34 56 78"
                            />
                        </InputField>
                    </div>
                </div>

                {orderType !== 'dine_in' && (
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5" />
                            {orderType === 'delivery' ? 'Adresse de livraison' : 'Adresse (Optionnelle)'}
                        </h4>
                        <InputField label="Rue et Numéro" color="text-gray-600">
                            <input
                                type="text"
                                value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })}
                                className={inputClass}
                                placeholder="Numéro et nom de rue"
                            />
                        </InputField>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Ville" color="text-gray-600">
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                    className={inputClass}
                                    placeholder="Ville"
                                />
                            </InputField>
                            <InputField label="Code Postal" color="text-gray-600">
                                <input
                                    type="text"
                                    value={address.zipCode}
                                    onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                                    className={`${inputClass} ${!isDeliverySupported && address.zipCode ? 'border-red-200 focus:ring-red-400 bg-red-50' : ''}`}
                                    placeholder="Ex: 57100"
                                />
                            </InputField>
                        </div>

                        {!isDeliverySupported && address.zipCode && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-700 font-bold text-xs uppercase tracking-wider mb-0.5">Zone non desservie</p>
                                    <p className="text-red-600 text-[11px] leading-relaxed">
                                        Désolé, nous ne livrons pas encore à <span className="font-bold underline">{address.zipCode}</span>. Choisissez "À emporter" ou une autre adresse.
                                    </p>
                                </div>
                            </div>
                        )}

                        <InputField label="Instructions (Optionnel)" color="text-gray-600">
                            <textarea
                                value={address.instructions}
                                onChange={e => setAddress({ ...address, instructions: e.target.value })}
                                className={`${inputClass} min-h-[90px] resize-none`}
                                placeholder="Digicode, bâtiment, étage..."
                            />
                        </InputField>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {user && (
                        <button
                            onClick={() => setIsEditingInfo(false)}
                            className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        onClick={handleSaveUserInfo}
                        disabled={!customer.firstName || !customer.lastName || !customer.phone || (orderType === 'delivery' && (!address.street || !isDeliverySupported))}
                        className="flex-[2] bg-primary-600 shadow-md shadow-primary-500/20 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2.5 text-sm"
                    >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        Enregistrer les informations
                    </button>
                </div>
            </div>
        </div>
    );
}
