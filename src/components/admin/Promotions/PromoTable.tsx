"use client";

import { Clock, Pencil, ToggleLeft, ToggleRight, Trash2, Zap, Ticket } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { COLOR_MAP, templateForPromo } from "./types";

interface PromoTableProps {
  items: any[];
  isCampaign: boolean;
  onEdit: (p: any) => void;
  onDelete: (id: Id<"promoCodes">) => void;
  onToggle: (p: any) => void;
}

export default function PromoTable({ items, isCampaign, onEdit, onDelete, onToggle }: PromoTableProps) {
  if (items.length === 0) return (
    <div className="p-12 text-center">
      <div className="w-10 h-10 mx-auto mb-3 text-slate-200 flex items-center justify-center">
        {isCampaign ? <Zap className="w-10 h-10" /> : <Ticket className="w-10 h-10" />}
      </div>
      <p className="text-slate-400 font-medium">Aucun {isCampaign ? "campagne" : "code promo"}</p>
    </div>
  );

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          {[isCampaign ? "Campagne" : "Code", "Type", "Valeur", "Min.", ...(isCampaign ? [] : ["Usages"]), "Expiration", "Statut", ""].map((h, i) => (
            <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {items.map((promo) => {
          const isExpired = promo.expiresAt != null && Date.now() > promo.expiresAt;
          const isExhausted = !isCampaign && promo.maxUsageCount != null && promo.usageCount >= promo.maxUsageCount;
          const tmpl = templateForPromo(promo, isCampaign);
          const Icon = tmpl.icon;
          const chip = COLOR_MAP[tmpl.color];
          return (
            <tr key={promo._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3">
                {isCampaign ? (
                  <span className="font-medium text-slate-700 text-sm">{promo.description || tmpl.label}</span>
                ) : (
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">{promo.code}</span>
                )}
                {!isCampaign && promo.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{promo.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${chip}`}>
                  <Icon className="w-3 h-3" />
                  {tmpl.label}
                  {promo.timeWindow && <Clock className="w-3 h-3 ml-0.5" />}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-slate-700 text-xs">
                {promo.discountType === "free_delivery" ? "—"
                  : (promo.discountType === "percentage" || promo.discountType === "percent_off_items")
                  ? `${promo.discountValue}%`
                  : `${promo.discountValue.toFixed(2)}€`}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {promo.minOrderAmount != null ? `${promo.minOrderAmount.toFixed(2)}€` : "—"}
              </td>
              {!isCampaign && (
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${isExhausted ? "text-red-500" : "text-slate-600"}`}>
                    {promo.usageCount}{promo.maxUsageCount != null ? ` / ${promo.maxUsageCount}` : ""}
                  </span>
                </td>
              )}
              <td className="px-4 py-3">
                {promo.expiresAt
                  ? <span className={`text-xs ${isExpired ? "text-red-500 font-medium" : "text-slate-500"}`}>{isExpired ? "Expiré · " : ""}{new Date(promo.expiresAt).toLocaleDateString("fr-FR")}</span>
                  : <span className="text-slate-300 text-xs">—</span>}
              </td>
              <td className="px-4 py-3">
                <button onClick={() => onToggle(promo)} className="flex items-center gap-1.5">
                  {promo.active && !isExpired && !isExhausted
                    ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 text-xs font-medium hidden sm:inline">Actif</span></>
                    : <><ToggleLeft className="w-5 h-5 text-slate-300" /><span className="text-slate-400 text-xs hidden sm:inline">Inactif</span></>}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => onEdit(promo)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(promo._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
