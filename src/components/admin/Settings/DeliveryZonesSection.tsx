"use client";

import { Plus, Trash2 } from 'lucide-react';

export type DeliveryZone = {
  postalCode: string;
  price: number;
  name?: string;
  freeDeliveryThreshold?: number;
};

interface DeliveryZonesSectionProps {
  defaultDeliveryFee: number;
  onDefaultDeliveryFeeChange: (value: number) => void;
  zones: DeliveryZone[];
  onAddZone: () => void;
  onRemoveZone: (index: number) => void;
  onUpdateZone: (index: number, field: keyof DeliveryZone, value: string | number) => void;
}

export default function DeliveryZonesSection({
  defaultDeliveryFee, onDefaultDeliveryFeeChange,
  zones, onAddZone, onRemoveZone, onUpdateZone,
}: DeliveryZonesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900">Frais de livraison par défaut</h3>
            <p className="text-sm text-slate-500">Appliqué quand le code postal ne correspond à aucune zone</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.5"
              value={defaultDeliveryFee}
              onChange={(e) => onDefaultDeliveryFeeChange(parseFloat(e.target.value) || 0)}
              className="w-24 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <span className="text-sm text-slate-600">€</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-900">Zones de livraison</h3>
          <button
            type="button"
            onClick={onAddZone}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter une zone
          </button>
        </div>

        <div className="space-y-3">
          {zones.map((zone, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
              <button
                type="button"
                onClick={() => onRemoveZone(index)}
                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Supprimer la zone"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nom de la zone
                  </label>
                  <input
                    type="text"
                    value={zone.name || ''}
                    onChange={(e) => onUpdateZone(index, 'name', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Centre-ville"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={zone.postalCode}
                    onChange={(e) => onUpdateZone(index, 'postalCode', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: 57190 ou 57* ou 57190-57199"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    * = joker, 57190-57199 = plage
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={zone.price}
                    onChange={(e) => onUpdateZone(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-start-3">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Livraison gratuite dès (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={zone.freeDeliveryThreshold ?? ''}
                    onChange={(e) => onUpdateZone(index, 'freeDeliveryThreshold', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Laisser vide pour désactiver"
                  />
                </div>
              </div>
            </div>
          ))}

          {zones.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
              Aucune zone de livraison configurée. Cliquez sur "Ajouter une zone" pour commencer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
