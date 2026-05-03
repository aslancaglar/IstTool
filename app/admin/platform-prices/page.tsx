"use client";

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Save, Calculator, ArrowUpRight, Search, Filter } from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function PlatformPricesPage() {
    const { adminToken } = useAdminAuth();
    const menuItems = useQuery(api.menuItems.list);
    const categories = useQuery(api.categories.list);
    const updatePlatformPrices = useMutation(api.menuItems.updatePlatformPrices);

    const [markupPercent, setMarkupPercent] = useState<string>('30');
    const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const filteredItems = useMemo(() => {
        if (!menuItems) return [];
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.categories?.includes(selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [menuItems, searchQuery, selectedCategory]);

    const handleCalculateAll = () => {
        const percent = parseFloat(markupPercent);
        if (isNaN(percent)) return;

        const newLocalPrices: Record<string, number> = {};
        menuItems?.forEach(item => {
            const markup = 1 + (percent / 100);
            newLocalPrices[item._id] = Math.round(item.price * markup * 100) / 100;
        });
        setLocalPrices(newLocalPrices);
    };

    const handlePriceChange = (id: string, value: string) => {
        const price = parseFloat(value);
        setLocalPrices(prev => ({
            ...prev,
            [id]: isNaN(price) ? 0 : price
        }));
    };

    const handleSave = async () => {
        const updates = Object.entries(localPrices).map(([id, price]) => ({
            id: id as Id<'menuItems'>,
            platformPrice: price,
        }));

        if (updates.length === 0) return;

        setIsSaving(true);
        try {
            if (!adminToken) return;
            await updatePlatformPrices({ updates, adminToken });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Error saving platform prices:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!menuItems || !categories) {
        return (
            <>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Prix Plateformes</h1>
                        <p className="text-sm text-slate-500 mt-1">Gérez les prix du menu pour les plateformes de commande en ligne (UberEats, Deliveroo, etc.)</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || Object.keys(localPrices).length === 0}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Enregistrement...' : 'Appliquer & Enregistrer tout'}
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Augmentation de prix en masse (%)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={markupPercent}
                                        onChange={(e) => setMarkupPercent(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="ex. 35"
                                    />
                                </div>
                                <button
                                    onClick={handleCalculateAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                                >
                                    <Calculator className="w-4 h-4" />
                                    Aperçu
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 italic">Cela mettra à jour le "Prix Plateforme" dans le tableau ci-dessous pour tous les articles.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rechercher des articles</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filtrer par nom..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Filtrer par catégorie</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white"
                                >
                                    <option value="all">Toutes les catégories</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {saveStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Prix mis à jour avec succès !
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nom de l'article</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Prix Standard</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Prix Plateforme</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Marge</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((item) => {
                                    const currentPlatformPrice = localPrices[item._id] ?? item.platformPrice ?? item.price;
                                    const markup = ((currentPlatformPrice / item.price) - 1) * 100;

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-medium text-slate-900">{item.name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {item.categories?.join(', ') || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                                                {item.price.toFixed(2)}€
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={currentPlatformPrice}
                                                        onChange={(e) => handlePriceChange(item._id, e.target.value)}
                                                        className={`w-24 text-right px-2 py-1.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${localPrices[item._id] !== undefined ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                                            }`}
                                                    />
                                                    <span className="text-sm text-slate-500">€</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${markup > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    +{markup.toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="p-12 text-center text-slate-500 italic">
                            Aucun article trouvé correspondant à vos filtres.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
