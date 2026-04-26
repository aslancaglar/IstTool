"use client";

import { Truck, Gift } from 'lucide-react';

interface FreeDeliveryBarProps {
  currentTotal: number;
  threshold: number;
  /** Compact mode for bottom cart / sticky bar */
  compact?: boolean;
}

export default function FreeDeliveryBar({ currentTotal, threshold, compact = false }: FreeDeliveryBarProps) {
  if (!threshold || threshold <= 0) return null;

  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - currentTotal, 0);
  const isFree = currentTotal >= threshold;

  if (compact) {
    return (
      <div className="w-full">
        {isFree ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <Gift className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-emerald-700">Livraison offerte !</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-semibold text-slate-500">
                  Plus que <span className="font-black text-red-500">{remaining.toFixed(2)}€</span> pour la livraison gratuite
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, #f87171 0%, #ef4444 ${progress}%, #dc2626 100%)`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {isFree ? (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Livraison offerte ! 🎉</p>
            <p className="text-xs text-emerald-600">Votre commande dépasse {threshold.toFixed(0)}€</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-red-50/60 to-orange-50/40 rounded-2xl border border-red-100/50">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-slate-600">Livraison gratuite</span>
            </div>
            <span className="text-xs font-black text-red-500 tabular-nums">{remaining.toFixed(2)}€ restants</span>
          </div>
          <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #fca5a5 0%, #ef4444 60%, #dc2626 100%)`,
              }}
            >
              {progress > 15 && (
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center font-medium">
            Ajoutez {remaining.toFixed(2)}€ pour profiter de la livraison gratuite
          </p>
        </div>
      )}
    </div>
  );
}
