"use client";

import { Plus, Trash2 } from 'lucide-react';

export type Holiday = { startDate: string; endDate: string; name?: string; active: boolean };

interface HolidaysSectionProps {
  holidays: Holiday[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: any) => void;
}

export default function HolidaysSection({ holidays, onAdd, onRemove, onUpdate }: HolidaysSectionProps) {
  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter une période
        </button>
      </div>

      <div className="space-y-4">
        {holidays.map((holiday, index) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Supprimer la période"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nom de la période</label>
                <input
                  type="text"
                  value={holiday.name || ''}
                  onChange={(e) => onUpdate(index, 'name', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Vacances d'été"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de début</label>
                <input
                  type="date"
                  value={holiday.startDate}
                  onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de fin</label>
                <input
                  type="date"
                  value={holiday.endDate}
                  onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`active-${index}`}
                  checked={holiday.active}
                  onChange={(e) => onUpdate(index, 'active', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                />
                <label htmlFor={`active-${index}`} className="text-sm text-slate-700">Actif</label>
              </div>
            </div>
          </div>
        ))}

        {holidays.length === 0 && (
          <div className="text-center py-8 text-slate-500 italic">
            Aucune fermeture exceptionnelle configurée. Cliquez sur "Ajouter une période" pour commencer.
          </div>
        )}
      </div>
    </>
  );
}
