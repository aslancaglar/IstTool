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
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-primary-500 inline-block" />
                Mode de récupération
            </h3>
            <div className={`grid grid-cols-1 ${
                visibleCount === 3
                    ? 'sm:grid-cols-3'
                    : visibleCount === 2
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-1'
            } gap-4`}>
                {pickupEnabled && (
                    <button
                        onClick={() => setOrderType('pickup')}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 bg-white ${
                            orderType === 'pickup'
                                ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md shadow-primary-500/10'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`p-3 rounded-full transition-all duration-300 ${
                            orderType === 'pickup'
                                ? 'bg-primary-50 text-primary-600'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'
                        }`}>
                            <Store className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm tracking-wide ${orderType === 'pickup' ? 'text-primary-700' : 'text-gray-700'}`}>
                                À emporter
                            </span>
                        </div>
                        {orderType === 'pickup' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}

                {deliveryEnabled && (
                    <button
                        onClick={() => setOrderType('delivery')}
                        disabled={isDefaultAddressOutsideZone}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 bg-white ${
                            orderType === 'delivery'
                                ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md shadow-primary-500/10'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        } ${isDefaultAddressOutsideZone ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <div className={`p-3 rounded-full transition-all duration-300 ${
                            orderType === 'delivery'
                                ? 'bg-primary-50 text-primary-600'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'
                        }`}>
                            <Truck className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm tracking-wide ${orderType === 'delivery' ? 'text-primary-700' : 'text-gray-700'}`}>
                                Livraison
                            </span>
                            {isDefaultAddressOutsideZone && (
                                <span className="text-[10px] font-bold text-red-500 uppercase mt-1 block leading-tight">Hors zone</span>
                            )}
                        </div>
                        {orderType === 'delivery' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}

                {dineInEnabled && (
                    <button
                        onClick={() => setOrderType('dine_in')}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 bg-white ${
                            orderType === 'dine_in'
                                ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-md shadow-primary-500/10'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`p-3 rounded-full transition-all duration-300 ${
                            orderType === 'dine_in'
                                ? 'bg-primary-50 text-primary-600'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'
                        }`}>
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-sm tracking-wide ${orderType === 'dine_in' ? 'text-primary-700' : 'text-gray-700'}`}>
                                Sur Place
                            </span>
                        </div>
                        {orderType === 'dine_in' && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
