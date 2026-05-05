"use client";

import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface SettingsAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function SettingsAccordion({ title, isOpen, onToggle, children }: SettingsAccordionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
      >
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 border-t border-slate-100 mt-0">
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
