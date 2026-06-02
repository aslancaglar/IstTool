"use client";

import React from 'react';
import { Store, Truck, Info, Check, Utensils } from 'lucide-react';

interface OrderTypeSelectorProps {
    orderType: 'pickup' | 'delivery' | 'dine_in' | null;
    setOrderType: (type: 'pickup' | 'delivery' | 'dine_in') => void;
    restaurantInfo: any;
    isDefaultAddressOutsideZone: boolean;
}

export default function OrderTypeSelector({
    orderType,
    setOrderType,
    restaurantInfo,
    isDefaultAddressOutsideZone
}: OrderTypeSelectorProps) {
    const pickupEnabled = restaurantInfo?.pickupEnabled ?? true;
    const deliveryEnabled = restaurantInfo?.deliveryEnabled ?? true;
    const dineInEnabled = restaurantInfo?.dineInEnabled ?? true;
    const visibleCount = [pickupEnabled, deliveryEnabled, dineInEnabled].filter(Boolean).length;

    if (restaurantInfo && !pickupEnabled && !deliveryEnabled && !dineInEnabled) {
        return (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
                    <Info className="w-6 h-6 text-white" />
                </div>
                <p className="text-amber-800 font-bold text-lg mb-1">
                    Commandes temporairement indisponibles
                </p>
                <p className="text-amber-600 text-sm">
                    Veuillez nous appeler au <a href="tel:0782814656" className="font-bold underline">07 82 81 46 56</a> pour passer commande.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-400 to-rose-500 inline-block" />
                Mode de récupération
            </h3>
            <div className={`grid grid-cols-1 ${
                visibleCount === 3
                    ? 'sm:grid-cols-3'
                    : visibleCount === 2
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-1'
            } gap-3`}>
                {pickupEnabled && (
                    <button
                        onClick={() => setOrderType('pickup')}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden bg-white ${
                            orderType === 'pickup'
                                ? 'border-orange-300 ring-4 ring-orange-500/10'
                                : 'border-gray-100 hover:border-orange-200'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            orderType === 'pickup'
                                ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'
                        }`}>
                            <Store className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm uppercase tracking-wide ${orderType === 'pickup' ? 'text-orange-600' : 'text-gray-600'}`}>
                                À emporter
                            </span>
                        </div>
                        {orderType === 'pickup' && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}

                {deliveryEnabled && (
                    <button
                        onClick={() => setOrderType('delivery')}
                        disabled={isDefaultAddressOutsideZone}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden bg-white ${
                            orderType === 'delivery'
                                ? 'border-teal-300 ring-4 ring-teal-500/10'
                                : 'border-gray-100 hover:border-teal-200'
                        } ${isDefaultAddressOutsideZone ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            orderType === 'delivery'
                                ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-500'
                        }`}>
                            <Truck className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm uppercase tracking-wide ${orderType === 'delivery' ? 'text-teal-600' : 'text-gray-600'}`}>
                                Livraison
                            </span>
                            {isDefaultAddressOutsideZone && (
                                <span className="text-[10px] font-bold text-red-500 uppercase mt-1 block leading-tight">Hors zone</span>
                            )}
                        </div>
                        {orderType === 'delivery' && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}

                {dineInEnabled && (
                    <button
                        onClick={() => setOrderType('dine_in')}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden bg-white ${
                            orderType === 'dine_in'
                                ? 'border-blue-300 ring-4 ring-blue-500/10'
                                : 'border-gray-100 hover:border-blue-200'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            orderType === 'dine_in'
                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                        }`}>
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm uppercase tracking-wide ${orderType === 'dine_in' ? 'text-blue-600' : 'text-gray-600'}`}>
                                Sur Place
                            </span>
                        </div>
                        {orderType === 'dine_in' && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
