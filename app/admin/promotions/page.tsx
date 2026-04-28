"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminAuth } from "../../../src/context/AdminAuthContext";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Plus, Tag, Pencil, Trash2, ToggleLeft, ToggleRight,
  Percent, Euro, Truck, Clock, ShoppingBag, CheckCircle2,
  XCircle, ArrowLeft, Zap, Ticket, Package,
} from "lucide-react";

// ─── Shared types ─────────────────────────────────────────────────────────────

type DiscountType = "percentage" | "fixed" | "free_delivery" | "percent_off_items" | "percent_off_specific_items" | "bogo_same" | "bogo_gift";

type PromoTemplate = {
  id: string;
  discountType: DiscountType;
  icon: React.ElementType;
  label: string;
  example: string;
  color: string;
  isHappyHour?: boolean;
};

// Templates for PROMO CODES (with code input)
const CODE_TEMPLATES: PromoTemplate[] = [
  { id: "percentage", discountType: "percentage", icon: Percent, label: "% sur la commande", example: "Ex: 20% de réduction", color: "blue" },
  { id: "fixed", discountType: "fixed", icon: Euro, label: "€ sur la commande", example: "Ex: 5€ de réduction", color: "green" },
  { id: "free_delivery", discountType: "free_delivery", icon: Truck, label: "Livraison gratuite", example: "Annule les frais de livraison", color: "purple" },
  { id: "happy_hour", discountType: "percentage", icon: Clock, label: "Happy hour", example: "Ex: 20% de 14h à 17h", color: "amber", isHappyHour: true },
  { id: "percent_off_items", discountType: "percent_off_items", icon: ShoppingBag, label: "% sur une catégorie", example: "Ex: 20% sur les Pizzas", color: "rose" },
  { id: "percent_off_specific_items", discountType: "percent_off_specific_items", icon: Package, label: "% sur articles spécifiques", example: "Ex: 20% sur le Big Burger", color: "orange" },
  { id: "bogo_same", discountType: "bogo_same", icon: ShoppingBag, label: "1 acheté = 1 offert (même article)", example: "Ex: 2 Pizzas achetées → 1 offerte", color: "violet" },
  { id: "bogo_gift", discountType: "bogo_gift", icon: Package, label: "1 acheté = 1 autre offert", example: "Ex: Big Burger acheté → Boisson offerte", color: "pink" },
];

// Templates for CAMPAIGNS (automatic, no code)
const CAMPAIGN_TEMPLATES: PromoTemplate[] = [
  { id: "percentage", discountType: "percentage", icon: Percent, label: "% sur toute la commande", example: "Ex: 20% sur tout le menu", color: "blue" },
  { id: "fixed", discountType: "fixed", icon: Euro, label: "Montant fixe déduit", example: "Ex: 5€ de réduction automatique", color: "green" },
  { id: "free_delivery", discountType: "free_delivery", icon: Truck, label: "Livraison gratuite", example: "Livraison offerte pour tous", color: "purple" },
  { id: "happy_hour", discountType: "percentage", icon: Clock, label: "Happy hour", example: "Ex: 20% automatique de 14h à 17h", color: "amber", isHappyHour: true },
  { id: "percent_off_items", discountType: "percent_off_items", icon: ShoppingBag, label: "% sur une catégorie", example: "Ex: 20% sur les Pizzas automatiquement", color: "rose" },
  { id: "percent_off_specific_items", discountType: "percent_off_specific_items", icon: Package, label: "% sur articles spécifiques", example: "Ex: 20% sur le Big Burger automatiquement", color: "orange" },
  { id: "bogo_same", discountType: "bogo_same", icon: ShoppingBag, label: "1 acheté = 1 offert (même article)", example: "Ex: 2 Pizzas → 1 offerte automatiquement", color: "violet" },
  { id: "bogo_gift", discountType: "bogo_gift", icon: Package, label: "1 acheté = 1 autre offert", example: "Ex: Big Burger → Boisson offerte auto.", color: "pink" },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  rose: "bg-rose-50 border-rose-200 text-rose-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  pink: "bg-pink-50 border-pink-200 text-pink-700",
};
const ICON_COLOR: Record<string, string> = {
  blue: "text-blue-500 bg-blue-100",
  green: "text-green-500 bg-green-100",
  purple: "text-purple-500 bg-purple-100",
  amber: "text-amber-500 bg-amber-100",
  rose: "text-rose-500 bg-rose-100",
  orange: "text-orange-500 bg-orange-100",
  violet: "text-violet-500 bg-violet-100",
  pink: "text-pink-500 bg-pink-100",
};

interface PromoFormData {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxUsageCount: string;
  active: boolean;
  expiresAt: string;
  description: string;
  isHappyHour: boolean;
  startHour: string;
  endHour: string;
  applicableCategoryIds: string[];
  applicableMenuItemIds: string[];
  bogoTriggerItemId: string;
  bogoGiftItemId: string;
}

const emptyForm = (tmpl?: PromoTemplate): PromoFormData => ({
  code: "",
  discountType: tmpl?.discountType ?? "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxUsageCount: "",
  active: true,
  expiresAt: "",
  description: "",
  isHappyHour: tmpl?.isHappyHour ?? false,
  startHour: "12",
  endHour: "14",
  applicableCategoryIds: [],
  applicableMenuItemIds: [],
  bogoTriggerItemId: "",
  bogoGiftItemId: "",
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

function templateForPromo(promo: any, isCampaign: boolean): PromoTemplate {
  const templates = isCampaign ? CAMPAIGN_TEMPLATES : CODE_TEMPLATES;
  if (promo.discountType === "bogo_gift") return templates[7];
  if (promo.discountType === "bogo_same") return templates[6];
  if (promo.discountType === "percent_off_specific_items") return templates[5];
  if (promo.discountType === "free_delivery") return templates[2];
  if (promo.discountType === "percent_off_items") return templates[4];
  if (promo.timeWindow) return templates[3];
  if (promo.discountType === "percentage") return templates[0];
  return templates[1];
}

// ─── Shared: type picker + form ───────────────────────────────────────────────

interface TypePickerProps {
  templates: PromoTemplate[];
  title: string;
  onSelect: (t: PromoTemplate) => void;
  onBack: () => void;
}
function TypePicker({ templates, title, onSelect, onBack }: TypePickerProps) {
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
function PromoForm({ form, setForm, template, isCode, editingId, error, isSaving, categories, menuItems, onBack, onSave }: PromoFormProps) {
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
        {/* Code — only for promo codes */}
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

// ─── Shared: table row ────────────────────────────────────────────────────────

function PromoTable({ items, isCampaign, onEdit, onDelete, onToggle }: {
  items: any[];
  isCampaign: boolean;
  onEdit: (p: any) => void;
  onDelete: (id: Id<"promoCodes">) => void;
  onToggle: (p: any) => void;
}) {
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

// ─── Main page ────────────────────────────────────────────────────────────────

type View = "list" | "pick-type" | "form";

export default function PromotionsPage() {
  const { adminToken } = useAdminAuth();
  const promoCodes = useQuery(api.promoCodes.list, adminToken ? { adminToken } : "skip");
  const campaigns = useQuery(api.promoCodes.listCampaigns, adminToken ? { adminToken } : "skip");
  const categories = useQuery(api.categories.list);
  const menuItems = useQuery(api.queries.getMenuItems);

  const createPromo = useMutation(api.promoCodes.create);
  const updatePromo = useMutation(api.promoCodes.update);
  const removePromo = useMutation(api.promoCodes.remove);
  const toggleActive = useMutation(api.promoCodes.toggleActive);

  const [activeTab, setActiveTab] = useState<"campaigns" | "codes">("campaigns");
  const [view, setView] = useState<View>("list");
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromoTemplate>(CODE_TEMPLATES[0]);
  const [editingId, setEditingId] = useState<Id<"promoCodes"> | null>(null);
  const [form, setForm] = useState<PromoFormData>(emptyForm());
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"promoCodes"> | null>(null);

  const goToList = () => { setView("list"); setError(""); };

  const openCreate = (campaignMode: boolean) => {
    setIsCampaignMode(campaignMode);
    setEditingId(null);
    setError("");
    setView("pick-type");
  };

  const selectTemplate = (tmpl: PromoTemplate) => {
    setSelectedTemplate(tmpl);
    setForm(emptyForm(tmpl));
    setView("form");
  };

  const openEdit = (promo: any, campaignMode: boolean) => {
    setIsCampaignMode(campaignMode);
    const tmpl = templateForPromo(promo, campaignMode);
    setSelectedTemplate(tmpl);
    setEditingId(promo._id);
    setForm({
      code: promo.code?.startsWith("__campaign__") ? "" : (promo.code ?? ""),
      discountType: promo.discountType,
      discountValue: promo.discountType === "free_delivery" ? "" : String(promo.discountValue),
      minOrderAmount: promo.minOrderAmount != null ? String(promo.minOrderAmount) : "",
      maxUsageCount: promo.maxUsageCount != null ? String(promo.maxUsageCount) : "",
      active: promo.active,
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 10) : "",
      description: promo.description ?? "",
      isHappyHour: !!promo.timeWindow,
      startHour: promo.timeWindow ? String(promo.timeWindow.startHour) : "12",
      endHour: promo.timeWindow ? String(promo.timeWindow.endHour) : "14",
      applicableCategoryIds: promo.applicableCategoryIds ?? [],
      applicableMenuItemIds: promo.applicableMenuItemIds ?? [],
      bogoTriggerItemId: promo.bogoTriggerItemId ?? "",
      bogoGiftItemId: promo.bogoGiftItemId ?? "",
    });
    setError("");
    setView("form");
  };

  const handleSave = async () => {
    if (!adminToken) return;
    if (!isCampaignMode && !form.code.trim()) { setError("Le code est requis"); return; }
    const noDiscountValue = ["free_delivery", "bogo_same", "bogo_gift"].includes(form.discountType);
    if (!noDiscountValue) {
      const dv = parseFloat(form.discountValue);
      if (isNaN(dv) || dv <= 0) { setError("Valeur de réduction invalide"); return; }
      if (["percentage", "percent_off_items", "percent_off_specific_items"].includes(form.discountType) && dv > 100) {
        setError("Le pourcentage ne peut pas dépasser 100%"); return;
      }
    }
    if (form.discountType === "bogo_gift" && (!form.bogoTriggerItemId || !form.bogoGiftItemId)) {
      setError("Sélectionnez l'article déclencheur et l'article offert"); return;
    }
    if (form.isHappyHour && parseInt(form.startHour) >= parseInt(form.endHour)) {
      setError("L'heure de début doit être avant l'heure de fin"); return;
    }
    if (form.discountType === "percent_off_items" && form.applicableCategoryIds.length === 0) {
      setError("Sélectionnez au moins une catégorie"); return;
    }
    if (form.discountType === "percent_off_specific_items" && form.applicableMenuItemIds.length === 0) {
      setError("Sélectionnez au moins un article"); return;
    }

    setIsSaving(true);
    setError("");
    try {
      const payload = {
        adminToken,
        code: form.code,
        discountType: form.discountType,
        discountValue: noDiscountValue ? 0 : parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUsageCount: !isCampaignMode && form.maxUsageCount ? parseInt(form.maxUsageCount) : undefined,
        active: form.active,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() + 86399999 : undefined,
        description: form.description || undefined,
        timeWindow: form.isHappyHour
          ? { startHour: parseInt(form.startHour), endHour: parseInt(form.endHour) }
          : undefined,
        applicableCategoryIds: form.discountType === "percent_off_items" ? form.applicableCategoryIds : undefined,
        applicableMenuItemIds: ["percent_off_specific_items", "bogo_same"].includes(form.discountType) ? form.applicableMenuItemIds : undefined,
        bogoTriggerItemId: form.discountType === "bogo_gift" ? form.bogoTriggerItemId || undefined : undefined,
        bogoGiftItemId: form.discountType === "bogo_gift" ? form.bogoGiftItemId || undefined : undefined,
        requiresCode: isCampaignMode ? false : true,
      };
      if (editingId) {
        await updatePromo({ ...payload, id: editingId });
      } else {
        await createPromo(payload);
      }
      goToList();
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (promo: any) => {
    if (!adminToken) return;
    await toggleActive({ adminToken, id: promo._id, active: !promo.active });
  };

  const handleDelete = async (id: Id<"promoCodes">) => {
    if (!adminToken) return;
    await removePromo({ adminToken, id });
    setConfirmDeleteId(null);
  };

  const stats = useMemo(() => ({
    campaigns: { total: campaigns?.length ?? 0, active: campaigns?.filter((p) => p.active).length ?? 0 },
    codes: { total: promoCodes?.length ?? 0, active: promoCodes?.filter((p) => p.active).length ?? 0, usages: promoCodes?.reduce((s, p) => s + p.usageCount, 0) ?? 0 },
  }), [campaigns, promoCodes]);

  // ─── Type picker view ─────────────────────────────────────────────
  if (view === "pick-type") {
    return (
      <TypePicker
        templates={isCampaignMode ? CAMPAIGN_TEMPLATES : CODE_TEMPLATES}
        title={isCampaignMode ? "Choisir le type de campagne" : "Choisir le type de code promo"}
        onSelect={selectTemplate}
        onBack={goToList}
      />
    );
  }

  // ─── Form view ────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <PromoForm
        form={form}
        setForm={setForm}
        template={selectedTemplate}
        isCode={!isCampaignMode}
        editingId={editingId}
        error={error}
        isSaving={isSaving}
        categories={categories ?? []}
        menuItems={menuItems ?? []}
        onBack={() => setView(editingId ? "list" : "pick-type")}
        onSave={handleSave}
      />
    );
  }

  // ─── List view ────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez vos campagnes automatiques et codes de réduction</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {([
            { key: "campaigns", label: "Campagnes", icon: Zap, count: stats.campaigns.total },
            { key: "codes", label: "Codes Promo", icon: Ticket, count: stats.codes.total },
          ] as const).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* ── Campaigns tab ── */}
        {activeTab === "campaigns" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm min-w-[100px]">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-black text-slate-700 mt-1">{stats.campaigns.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm min-w-[100px]">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actives</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{stats.campaigns.active}</p>
                </div>
              </div>
              <button onClick={() => openCreate(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm">
                <Plus className="w-4 h-4" />
                Nouvelle campagne
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {!campaigns ? (
                <div className="p-12 text-center text-slate-400">Chargement…</div>
              ) : (
                <PromoTable
                  items={campaigns}
                  isCampaign={true}
                  onEdit={(p) => openEdit(p, true)}
                  onDelete={(id) => setConfirmDeleteId(id)}
                  onToggle={handleToggle}
                />
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Campagnes automatiques</p>
                <p className="text-xs text-blue-600 mt-0.5">Les campagnes actives s'appliquent automatiquement à la commande sans que le client ait à saisir de code.</p>
              </div>
            </div>
          </>
        )}

        {/* ── Codes tab ── */}
        {activeTab === "codes" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {[
                  { label: "Total", value: stats.codes.total, color: "text-slate-700" },
                  { label: "Actifs", value: stats.codes.active, color: "text-green-600" },
                  { label: "Utilisations", value: stats.codes.usages, color: "text-blue-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm min-w-[100px]">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                    <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => openCreate(false)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm">
                <Plus className="w-4 h-4" />
                Nouveau code
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {!promoCodes ? (
                <div className="p-12 text-center text-slate-400">Chargement…</div>
              ) : (
                <PromoTable
                  items={promoCodes}
                  isCampaign={false}
                  onEdit={(p) => openEdit(p, false)}
                  onDelete={(id) => setConfirmDeleteId(id)}
                  onToggle={handleToggle}
                />
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <Tag className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Codes promo</p>
                <p className="text-xs text-amber-600 mt-0.5">Les codes doivent être saisis par le client au moment du paiement pour bénéficier de la réduction.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Supprimer ?</h3>
            <p className="text-sm text-slate-500">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition">
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
