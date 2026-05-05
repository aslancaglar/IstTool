"use client";

import { Clock, Plus, Trash2 } from 'lucide-react';

export type TimeSlot = { start: string; end: string };
export type DaySchedule = { day: string; slots: TimeSlot[] };

interface HoursSectionProps {
  schedule: DaySchedule[];
  onAddDay: () => void;
  onRemoveDay: (index: number) => void;
  onUpdateDayName: (index: number, name: string) => void;
  onAddSlot: (dayIndex: number) => void;
  onRemoveSlot: (dayIndex: number, slotIndex: number) => void;
  onUpdateSlot: (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => void;
}

export default function HoursSection({
  schedule, onAddDay, onRemoveDay, onUpdateDayName, onAddSlot, onRemoveSlot, onUpdateSlot,
}: HoursSectionProps) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={onAddDay}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Jour
        </button>
      </div>

      <div className="space-y-6">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
            <button
              type="button"
              onClick={() => onRemoveDay(dayIndex)}
              className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Supprimer le jour"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-8">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jour(s)</label>
              <input
                type="text"
                value={day.day}
                onChange={(e) => onUpdateDayName(dayIndex, e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Lundi - Vendredi"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Heures d'Ouverture</label>
              {day.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => onUpdateSlot(dayIndex, slotIndex, 'start', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <span className="text-slate-400 text-center">-</span>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => onUpdateSlot(dayIndex, slotIndex, 'end', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(dayIndex, slotIndex)}
                    className="p-2 text-slate-400 hover:text-red-500"
                    title="Supprimer le créneau"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => onAddSlot(dayIndex)}
                className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 font-medium mt-2"
              >
                <Plus className="w-3 h-3" />
                Ajouter un créneau
              </button>
            </div>
          </div>
        ))}

        {schedule.length === 0 && (
          <div className="text-center py-8 text-slate-500 italic">
            Aucune heure d'ouverture configurée. Cliquez sur "Ajouter un Jour" pour commencer.
          </div>
        )}
      </div>
    </>
  );
}
