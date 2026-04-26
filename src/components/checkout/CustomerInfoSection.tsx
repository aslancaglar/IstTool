"use client";

import { User, MapPin, Edit, CheckCircle2, X } from 'lucide-react';

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
    orderType: 'pickup' | 'delivery';
    isEditingInfo: boolean;
    setIsEditingInfo: (isEditing: boolean) => void;
    isDeliverySupported: boolean;
    handleSaveUserInfo: () => Promise<void>;
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
            <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 font-display uppercase tracking-wider text-sm">
                        <User className="w-5 h-5 text-red-500" />
                        Mes informations
                    </h3>
                    <button
                        onClick={() => setIsEditingInfo(true)}
                        className="text-xs font-black text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-all bg-red-50 px-3 py-1.5 rounded-full uppercase"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm group hover:border-red-100 transition-colors">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3">Contact</p>
                        <p className="font-bold text-gray-900 text-lg">{customer.firstName} {customer.lastName}</p>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {customer.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {customer.phone}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm group hover:border-red-100 transition-colors">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3">
                            {orderType === 'delivery' ? 'Adresse de livraison' : 'Adresse'}
                        </p>
                        {address.street ? (
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900 text-lg">{address.street}</p>
                                <p className="text-sm text-gray-500">{address.zipCode} {address.city}</p>
                                {address.instructions && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Note pour le livreur:</p>
                                        <p className="text-xs text-gray-600 italic leading-relaxed">"{address.instructions}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <MapPin className="w-8 h-8 text-amber-500 mb-2 opacity-50" />
                                <p className="text-sm text-amber-700 font-bold uppercase tracking-wider">
                                    {orderType === 'delivery' ? 'Adresse manquante' : 'Non renseignée'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 font-display uppercase tracking-wider text-sm">
                    <User className="w-5 h-5 text-red-500" />
                    Édition des informations
                </h3>
                {user && (
                    <button
                        onClick={() => setIsEditingInfo(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Prénom</label>
                    <input
                        type="text"
                        value={customer.firstName}
                        onChange={e => setCustomer({ ...customer, firstName: e.target.value })}
                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                        placeholder="Ex: Jean"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nom</label>
                    <input
                        type="text"
                        value={customer.lastName}
                        onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                        placeholder="Ex: Dupont"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                    <input
                        type="email"
                        value={customer.email}
                        onChange={e => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                        placeholder="votre@email.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Téléphone</label>
                    <input
                        type="tel"
                        value={customer.phone}
                        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                        placeholder="06 12 34 56 78"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 font-display uppercase tracking-wider text-sm">
                    <MapPin className="w-5 h-5 text-red-500" />
                    {orderType === 'delivery' ? 'Adresse de livraison' : 'Adresse (Optionnelle)'}
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Rue et Numéro</label>
                        <input
                            type="text"
                            value={address.street}
                            onChange={e => setAddress({ ...address, street: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                            placeholder="Numéro et nom de rue"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ville</label>
                            <input
                                type="text"
                                value={address.city}
                                onChange={e => setAddress({ ...address, city: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Ville"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Code Postal</label>
                            <input
                                type="text"
                                value={address.zipCode}
                                onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                                className={`w-full bg-gray-50 border-2 rounded-2xl p-4 focus:ring-2 focus:outline-none transition-all font-bold placeholder:font-normal placeholder:text-gray-300 ${!isDeliverySupported && address.zipCode
                                    ? 'border-red-200 focus:ring-red-500 bg-red-50'
                                    : 'border-gray-100 focus:ring-red-500'
                                    }`}
                                placeholder="Ex: 57100"
                            />
                        </div>
                    </div>

                    {!isDeliverySupported && address.zipCode && (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 animate-in shake duration-500">
                            <Info className="w-5 h-5 text-red-500 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-red-800 font-bold text-xs uppercase tracking-wider">Zone non desservie</p>
                                <p className="text-red-600 text-[10px] font-medium leading-relaxed">
                                    Désolé, nous ne livrons pas encore à <span className="font-bold underline">{address.zipCode}</span>.
                                    Veuillez choisir "À emporter" ou une autre adresse.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Instructions (Optionnel)</label>
                        <textarea
                            value={address.instructions}
                            onChange={e => setAddress({ ...address, instructions: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 border-2 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 min-h-[100px] outline-none transition-all font-medium placeholder:font-normal placeholder:text-gray-300 resize-none"
                            placeholder="Digicode, bâtiment, étage..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                {user && (
                    <button
                        onClick={() => setIsEditingInfo(false)}
                        className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                    >
                        Annuler
                    </button>
                )}
                <button
                    onClick={handleSaveUserInfo}
                    disabled={!customer.firstName || !customer.lastName || !customer.phone || (orderType === 'delivery' && (!address.street || !isDeliverySupported))}
                    className="flex-[2] bg-gray-900 shadow-xl shadow-gray-900/10 text-white font-black py-4 rounded-2xl hover:bg-black hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-tighter text-sm"
                >
                    Enregistrer les informations
                    <CheckCircle2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Simple internal icon for Info since I didn't import it initially
function Info(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
    );
}
