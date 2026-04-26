"use client";

import React from 'react';
import { Store, Truck, Info } from 'lucide-react';

interface OrderTypeSelectorProps {
    orderType: 'pickup' | 'delivery';
    setOrderType: (type: 'pickup' | 'delivery') => void;
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

    if (restaurantInfo && !pickupEnabled && !deliveryEnabled) {
        return (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center animate-pulse">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Info className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-amber-800 font-bold text-lg mb-1">
                    Commandes temporairement indisponibles
                </p>
                <p className="text-amber-600 text-sm">
                    Veuillez nous appeler au <a href="tel:0387380945" className="font-bold underline">03 87 38 09 45</a> pour passer commande.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => setOrderType('pickup')}
                disabled={!pickupEnabled}
                className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${orderType === 'pickup'
                        ? 'border-red-500 bg-red-50/50 text-red-600 ring-4 ring-red-500/10'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    } ${!pickupEnabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
                <div className={`p-3 rounded-2xl transition-colors ${orderType === 'pickup' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                    <Store className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <span className="block font-bold text-sm uppercase tracking-wider">À emporter</span>
                    {!pickupEnabled && (
                        <span className="text-[10px] font-bold text-red-500 uppercase mt-1 block">Indisponible</span>
                    )}
                </div>
                {orderType === 'pickup' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
            </button>

            <button
                onClick={() => setOrderType('delivery')}
                disabled={!deliveryEnabled || isDefaultAddressOutsideZone}
                className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${orderType === 'delivery'
                        ? 'border-red-500 bg-red-50/50 text-red-600 ring-4 ring-red-500/10'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    } ${(!deliveryEnabled || isDefaultAddressOutsideZone) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
                <div className={`p-3 rounded-2xl transition-colors ${orderType === 'delivery' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                    <Truck className="w-6 h-6" />
                </div>
                <div className="text-center">
                    <span className="block font-bold text-sm uppercase tracking-wider">Livraison</span>
                    {isDefaultAddressOutsideZone && (
                        <span className="text-[10px] font-bold text-red-500 uppercase mt-1 block leading-tight">Hors zone</span>
                    )}
                    {!deliveryEnabled && (
                        <span className="text-[10px] font-bold text-red-500 uppercase mt-1 block">Fermée</span>
                    )}
                </div>
                {orderType === 'delivery' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
            </button>
        </div>
    );
}
