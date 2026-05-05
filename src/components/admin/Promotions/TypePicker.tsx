"use client";

import { ArrowLeft } from "lucide-react";
import { ICON_COLOR, type PromoTemplate } from "./types";

interface TypePickerProps {
  templates: PromoTemplate[];
  title: string;
  onSelect: (t: PromoTemplate) => void;
  onBack: () => void;
}

export default function TypePicker({ templates, title, onSelect, onBack }: TypePickerProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Choisissez le type de réduction</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => {
          const Icon = tmpl.icon;
          const ic = ICON_COLOR[tmpl.color];
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelect(tmpl)}
              className="text-left bg-white border border-slate-100 rounded-2xl p-5 hover:border-red-300 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${ic}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{tmpl.label}</p>
              <p className="text-sm text-slate-400 mt-1">{tmpl.example}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
