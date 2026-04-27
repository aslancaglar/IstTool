"use client";

import { Edit, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Id } from '../../../../convex/_generated/dataModel';

interface MenuItemCardProps {
    item: any;
    categoryFilter: string;
    onEdit: (item: any) => void;
    onToggleStock: (id: Id<'menuItems'>, inStock: boolean) => void;
}

export default function MenuItemCard({
    item,
    categoryFilter,
    onEdit,
    onToggleStock,
}: MenuItemCardProps) {
    const isInStock = item.inStock !== false;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col">
            <div className="aspect-video bg-slate-100 relative group">
                <Image
                    src={item.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                />
                {!item.active && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <span className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded-full">Inactif</span>
                    </div>
                )}
                {!isInStock && (
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Rupture
                    </div>
                )}
                {categoryFilter !== 'all' && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        #{item.categoryOrders?.find((o: any) => o.category === categoryFilter)?.order ?? (item.displayOrder || 0)}
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-1 gap-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1" title={item.name}>{item.name}</h3>
                    {item.popular && (
                        <span className="flex-shrink-0 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                            Populaire
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2 h-8 leading-4">{item.description}</p>
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-900">{item.price.toFixed(2)}€</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(item)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Modifier</span>
                        </button>
                        <button
                            onClick={() => onToggleStock(item._id, !isInStock)}
                            title={isInStock ? 'Marquer rupture de stock' : 'Marquer en stock'}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition text-xs font-medium ${isInStock
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                        >
                            {isInStock
                                ? <><CheckCircle2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">En stock</span></>
                                : <><XCircle className="w-3.5 h-3.5" /><span className="hidden sm:inline">Rupture</span></>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
