"use client";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { HOURS, ICON_COLOR, fmtHour, type PromoFormData, type PromoTemplate } from "./types";

interface PromoFormProps {
  form: PromoFormData;
  setForm: React.Dispatch<React.SetStateAction<PromoFormData>>;
  template: PromoTemplate;
  isCode: boolean;
  editingId: Id<"promoCodes"> | null;
  error: string;
  isSaving: boolean;
  categories: any[];
  menuItems: any[];
  onBack: () => void;
  onSave: () => void;
}

export default function PromoForm({ form, setForm, template, isCode, editingId, error, isSaving, categories, menuItems, onBack, onSave }: PromoFormProps) {
  const Icon = template.icon;
  const ic = ICON_COLOR[template.color];
  const isFreeDelivery = form.discountType === "free_delivery";
  const isPercentOffItems = form.discountType === "percent_off_items";
  const isPercentOffSpecific = form.discountType === "percent_off_specific_items";
  const isBogoSame = form.discountType === "bogo_same";
  const isBogoGift = form.discountType === "bogo_gift";
  const showDiscountValue = !isFreeDelivery && !isBogoSame && !isBogoGift;

  const toggleCategory = (slug: string) =>
    setForm((f) => ({
      ...f,
      applicableCategoryIds: f.applicableCategoryIds.includes(slug)
        ? f.applicableCategoryIds.filter((c) => c !== slug)
        : [...f.applicableCategoryIds, slug],
    }));

  const toggleMenuItem = (id: string) =>
    setForm((f) => ({
      ...f,
      applicableMenuItemIds: f.applicableMenuItemIds.includes(id)
        ? f.applicableMenuItemIds.filter((x) => x !== id)
        : [...f.applicableMenuItemIds, id],
    }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ic}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Modifier" : "Créer"} · {template.label}
            </h2>
            <p className="text-sm text-slate-400">{template.example}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {isCode && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Code promo *</label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="Ex: PIZZA10"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        {showDiscountValue && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Valeur de réduction * {(form.discountType === "percentage" || isPercentOffItems || isPercentOffSpecific) ? "(%)" : "(€)"}
            </label>
            <input
              type="number" min="0"
              max={(form.discountType === "percentage" || isPercentOffItems || isPercentOffSpecific) ? 100 : undefined}
              step="0.01"
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              placeholder={(form.discountType === "percentage" || isPercentOffItems || isPercentOffSpecific) ? "Ex: 20" : "Ex: 5.00"}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        {isPercentOffItems && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catégories éligibles *</label>
            <div className="flex flex-wrap gap-2">
              {categories.filter((c) => c.active).map((cat: any) => {
                const selected = form.applicableCategoryIds.includes(cat.slug);
                return (
                  <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selected ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isBogoSame && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Articles éligibles <span className="text-slate-400 font-normal">(vide = tous les articles)</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-50">
              {menuItems.filter((m) => m.active !== false).map((item: any) => {
                const selected = form.applicableMenuItemIds.includes(item._id);
                return (
                  <button key={item._id} type="button" onClick={() => toggleMenuItem(item._id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition hover:bg-slate-50 ${selected ? "bg-violet-50" : ""}`}>
                    <span className={`font-medium ${selected ? "text-violet-700" : "text-slate-700"}`}>{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400">{item.price?.toFixed(2)}€</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selected ? "bg-violet-500 border-violet-500" : "border-slate-300"}`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isBogoGift && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Article déclencheur * <span className="text-slate-400 font-normal">(le client doit l'acheter)</span></label>
              <select value={form.bogoTriggerItemId}
                onChange={(e) => setForm((f) => ({ ...f, bogoTriggerItemId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">— Choisir un article —</option>
                {menuItems.filter((m) => m.active !== false).map((item: any) => (
                  <option key={item._id} value={item._id}>{item.name} ({item.price?.toFixed(2)}€)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Article offert * <span className="text-slate-400 font-normal">(offert gratuitement)</span></label>
              <select value={form.bogoGiftItemId}
                onChange={(e) => setForm((f) => ({ ...f, bogoGiftItemId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">— Choisir un article —</option>
                {menuItems.filter((m) => m.active !== false).map((item: any) => (
                  <option key={item._id} value={item._id}>{item.name} ({item.price?.toFixed(2)}€)</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isPercentOffSpecific && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Articles éligibles * <span className="text-slate-400 font-normal">({form.applicableMenuItemIds.length} sélectionné{form.applicableMenuItemIds.length !== 1 ? "s" : ""})</span>
            </label>
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-50">
              {menuItems.filter((m) => m.active !== false).map((item: any) => {
                const selected = form.applicableMenuItemIds.includes(item._id);
                return (
                  <button key={item._id} type="button" onClick={() => toggleMenuItem(item._id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition hover:bg-slate-50 ${selected ? "bg-orange-50" : ""}`}>
                    <span className={`font-medium ${selected ? "text-orange-700" : "text-slate-700"}`}>{item.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400">{item.price?.toFixed(2)}€</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${selected ? "bg-orange-500 border-orange-500" : "border-slate-300"}`}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {form.isHappyHour && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Heure de début</label>
              <select value={form.startHour} onChange={(e) => setForm((f) => ({ ...f, startHour: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Heure de fin</label>
              <select value={form.endHour} onChange={(e) => setForm((f) => ({ ...f, endHour: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-1" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Montant minimum (€)</label>
            <input type="number" min="0" step="0.01" value={form.minOrderAmount}
              onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
              placeholder="Aucun"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          {isCode && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nb max d'utilisations</label>
              <input type="number" min="1" step="1" value={form.maxUsageCount}
                onChange={(e) => setForm((f) => ({ ...f, maxUsageCount: e.target.value }))}
                placeholder="Illimité"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date d'expiration</label>
            <input type="date" value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (interne)</label>
            <input value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Offre de bienvenue"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <button type="button" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition w-full ${form.active ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          {form.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {form.active ? "Actif" : "Inactif"}
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Annuler
          </button>
          <button onClick={onSave} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
            {isSaving ? "Enregistrement…" : editingId ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
