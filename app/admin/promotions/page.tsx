"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminAuth } from "../../../src/context/AdminAuthContext";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus, Tag, Trash2, Zap, Ticket } from "lucide-react";
import TypePicker from "../../../src/components/admin/Promotions/TypePicker";
import PromoForm from "../../../src/components/admin/Promotions/PromoForm";
import PromoTable from "../../../src/components/admin/Promotions/PromoTable";
import {
  CAMPAIGN_TEMPLATES,
  CODE_TEMPLATES,
  emptyForm,
  templateForPromo,
  type PromoFormData,
  type PromoTemplate,
} from "../../../src/components/admin/Promotions/types";

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

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez vos campagnes automatiques et codes de réduction</p>
        </div>

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
