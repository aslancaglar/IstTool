"use client";

import { useState, useEffect } from 'react';
import { X, Store, Truck, Power, AlertTriangle, Utensils } from 'lucide-react';

interface StopOrderingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  dineInEnabled: boolean;
  onSave: (pickup: boolean, delivery: boolean, dineIn: boolean) => void;
  saving?: boolean;
}

export default function StopOrderingModal({
  isOpen,
  onClose,
  pickupEnabled,
  deliveryEnabled,
  dineInEnabled,
  onSave,
  saving,
}: StopOrderingModalProps) {
  const [pickup, setPickup] = useState(pickupEnabled);
  const [delivery, setDelivery] = useState(deliveryEnabled);
  const [dineIn, setDineIn] = useState(dineInEnabled);

  // Sync local state when props change (e.g. another admin changed it)
  useEffect(() => {
    setPickup(pickupEnabled);
    setDelivery(deliveryEnabled);
    setDineIn(dineInEnabled);
  }, [pickupEnabled, deliveryEnabled, dineInEnabled]);

  if (!isOpen) return null;

  const allStopped = !pickup && !delivery && !dineIn;
  const allActive = pickup && delivery && dineIn;
  const hasChanges = pickup !== pickupEnabled || delivery !== deliveryEnabled || dineIn !== dineInEnabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                allStopped
                  ? 'bg-red-100 text-red-600'
                  : allActive
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
              }`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Commandes en ligne</h3>
                <p className="text-xs text-slate-500 mt-0.5">Gérer la disponibilité</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toggle cards */}
        <div className="px-6 space-y-3">
          {/* Stop all */}
          <button
            onClick={() => {
              if (allStopped) {
                setPickup(true);
                setDelivery(true);
                setDineIn(true);
              } else {
                setPickup(false);
                setDelivery(false);
                setDineIn(false);
              }
            }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              allStopped
                ? 'border-red-300 bg-red-50'
                : 'border-slate-150 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              allStopped
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className={`block font-bold text-sm ${allStopped ? 'text-red-700' : 'text-slate-700'}`}>
                {allStopped ? 'Tout est arrêté' : 'Tout arrêter'}
              </span>
              <span className="text-xs text-slate-500">
                Arrêter toutes les commandes en ligne
              </span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              allStopped ? 'bg-red-500' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                allStopped ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-wider font-bold px-1">
            <div className="h-px bg-slate-200 flex-1" />
            ou individuellement
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Takeaway toggle */}
          <button
            onClick={() => setPickup(!pickup)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              !pickup
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-150 bg-white hover:border-emerald-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              pickup
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-100 text-amber-600'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className={`block font-bold text-sm ${!pickup ? 'text-amber-700' : 'text-slate-700'}`}>
                À emporter
              </span>
              <span className="text-xs text-slate-500">
                {pickup ? 'Actuellement actif' : 'Actuellement désactivé'}
              </span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              pickup ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                pickup ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </button>

          {/* Delivery toggle */}
          <button
            onClick={() => setDelivery(!delivery)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              !delivery
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-150 bg-white hover:border-emerald-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              delivery
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-100 text-amber-600'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className={`block font-bold text-sm ${!delivery ? 'text-amber-700' : 'text-slate-700'}`}>
                Livraison
              </span>
              <span className="text-xs text-slate-500">
                {delivery ? 'Actuellement actif' : 'Actuellement désactivé'}
              </span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              delivery ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                delivery ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </button>

          {/* Dine-in toggle */}
          <button
            onClick={() => setDineIn(!dineIn)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              !dineIn
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-150 bg-white hover:border-emerald-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              dineIn
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-100 text-amber-600'
            }`}>
              <Utensils className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className={`block font-bold text-sm ${!dineIn ? 'text-amber-700' : 'text-slate-700'}`}>
                Sur Place
              </span>
              <span className="text-xs text-slate-500">
                {dineIn ? 'Actuellement actif' : 'Actuellement désactivé'}
              </span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
              dineIn ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                dineIn ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </button>
        </div>

        {/* Warning when all stopped */}
        {allStopped && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              Les clients ne pourront plus passer de commandes en ligne tant que vous n&apos;aurez pas réactivé au moins une option.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 mt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-semibold text-sm"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(pickup, delivery, dineIn)}
            disabled={!hasChanges || saving}
            className={`flex-1 px-4 py-3 rounded-xl transition font-semibold text-sm ${
              !hasChanges || saving
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : allStopped
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'
            }`}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
