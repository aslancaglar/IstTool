"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Save } from 'lucide-react';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';
import SettingsAccordion from '../../../src/components/admin/Settings/SettingsAccordion';
import HoursSection, { type DaySchedule, type TimeSlot } from '../../../src/components/admin/Settings/HoursSection';
import HolidaysSection, { type Holiday } from '../../../src/components/admin/Settings/HolidaysSection';
import DeliveryZonesSection, { type DeliveryZone } from '../../../src/components/admin/Settings/DeliveryZonesSection';
import PrintingSection from '../../../src/components/admin/Settings/PrintingSection';

type SectionId = 'contact' | 'ordering' | 'hours' | 'holidays' | 'social' | 'delivery' | 'sections' | 'printing';

export default function SettingsPage() {
  const { adminToken } = useAdminAuth();
  const restaurantInfo = useQuery(api.restaurantInfo.get);
  const upsertRestaurantInfo = useMutation(api.restaurantInfo.upsert);

  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    contact: false, ordering: false, hours: false, holidays: false,
    social: false, delivery: false, sections: false, printing: false,
  });

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    hours: [] as { day: string, time: string }[],
    socialLinks: { facebook: '', instagram: '', twitter: '' },
    holidays: [] as Holiday[],
    pickupEnabled: true,
    deliveryEnabled: true,
    minimumAdvanceNotice: 30,
    deliveryFees: [] as DeliveryZone[],
    defaultDeliveryFee: 0,
    freeDeliveryThreshold: 0,
    galleryEnabled: true,
    reviewsEnabled: true,
    cashEnabled: true,
    stripeEnabled: true,
    printingEnabled: false,
    printNodeApiKey: '',
    printerPickupId: undefined as number | undefined,
    printerDeliveryId: undefined as number | undefined,
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Format expected: "11h00 - 15h00" or "11:00 - 15:00"; multi-slot: "11h00 - 15h00 et 18h00 - 22h00"
  const parseTime = (timeStr: string): TimeSlot[] => {
    if (!timeStr) return [];
    const normalized = timeStr.toLowerCase().replace(/h/g, ':');
    const parts = normalized.split(/ et | and |,/);
    return parts.map(part => {
      const times = part.match(/(\d{1,2}:\d{2})/g);
      if (times && times.length >= 2) return { start: times[0], end: times[1] };
      return { start: '', end: '' };
    }).filter(slot => slot.start && slot.end);
  };

  useEffect(() => {
    if (!restaurantInfo) return;
    setFormData({
      address: restaurantInfo.address || '',
      phone: restaurantInfo.phone || '',
      email: restaurantInfo.email || '',
      hours: restaurantInfo.hours || [],
      socialLinks: restaurantInfo.socialLinks ? {
        facebook: restaurantInfo.socialLinks.facebook || '',
        instagram: restaurantInfo.socialLinks.instagram || '',
        twitter: restaurantInfo.socialLinks.twitter || '',
      } : { facebook: '', instagram: '', twitter: '' },
      holidays: restaurantInfo.holidays || [],
      pickupEnabled: restaurantInfo.pickupEnabled ?? true,
      deliveryEnabled: restaurantInfo.deliveryEnabled ?? true,
      minimumAdvanceNotice: restaurantInfo.minimumAdvanceNotice ?? 30,
      deliveryFees: restaurantInfo.deliveryFees || [],
      defaultDeliveryFee: restaurantInfo.defaultDeliveryFee ?? 0,
      freeDeliveryThreshold: restaurantInfo.freeDeliveryThreshold ?? 0,
      galleryEnabled: restaurantInfo.galleryEnabled ?? true,
      reviewsEnabled: restaurantInfo.reviewsEnabled ?? true,
      cashEnabled: restaurantInfo.cashEnabled ?? true,
      stripeEnabled: restaurantInfo.stripeEnabled ?? true,
      printingEnabled: restaurantInfo.printingEnabled ?? false,
      printNodeApiKey: restaurantInfo.printNodeApiKey ?? '',
      printerPickupId: restaurantInfo.printerPickupId,
      printerDeliveryId: restaurantInfo.printerDeliveryId,
    });

    setHolidays(restaurantInfo.holidays || []);
    setDeliveryZones(restaurantInfo.deliveryFees || []);

    if (restaurantInfo.hours) {
      const parsedSchedule = restaurantInfo.hours.map(h => ({ day: h.day, slots: parseTime(h.time) }));
      const validSchedule = parsedSchedule.map(s =>
        s.slots.length > 0 ? s : { ...s, slots: [{ start: '', end: '' }] }
      );
      setSchedule(validSchedule);
    } else {
      setSchedule([
        { day: 'Lundi - Samedi', slots: [{ start: '11:00', end: '14:00' }, { start: '18:00', end: '22:00' }] }
      ]);
    }
  }, [restaurantInfo]);

  const serializeSchedule = (): { day: string, time: string }[] =>
    schedule.map(day => {
      const timeStr = day.slots
        .filter(s => s.start && s.end)
        .map(s => `${s.start.replace(':', 'h')} - ${s.end.replace(':', 'h')}`)
        .join(' et ');
      return { day: day.day, time: timeStr || 'Fermé' };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      if (!adminToken) return;
      const hoursToSave = serializeSchedule();
      await upsertRestaurantInfo({
        adminToken,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        hours: hoursToSave,
        socialLinks: formData.socialLinks,
        holidays,
        pickupEnabled: formData.pickupEnabled,
        deliveryEnabled: formData.deliveryEnabled,
        minimumAdvanceNotice: formData.minimumAdvanceNotice,
        deliveryFees: deliveryZones.filter(z => z.postalCode.trim() !== ''),
        defaultDeliveryFee: formData.defaultDeliveryFee,
        freeDeliveryThreshold: formData.freeDeliveryThreshold,
        galleryEnabled: formData.galleryEnabled,
        reviewsEnabled: formData.reviewsEnabled,
        cashEnabled: formData.cashEnabled,
        stripeEnabled: formData.stripeEnabled,
        printingEnabled: formData.printingEnabled,
        printNodeApiKey: formData.printNodeApiKey || undefined,
        printerPickupId: formData.printerPickupId,
        printerDeliveryId: formData.printerDeliveryId,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving restaurant info:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // ── Schedule handlers ─────────────────────────────────────────────────
  const addDay = () => setSchedule([...schedule, { day: '', slots: [{ start: '', end: '' }] }]);
  const removeDay = (index: number) => setSchedule(schedule.filter((_, i) => i !== index));
  const updateDayName = (index: number, name: string) => {
    const next = [...schedule];
    next[index].day = name;
    setSchedule(next);
  };
  const addSlot = (dayIndex: number) => {
    const next = [...schedule];
    next[dayIndex].slots.push({ start: '', end: '' });
    setSchedule(next);
  };
  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const next = [...schedule];
    next[dayIndex].slots = next[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setSchedule(next);
  };
  const updateSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
    const next = [...schedule];
    next[dayIndex].slots[slotIndex][field] = value;
    setSchedule(next);
  };

  // ── Holiday handlers ─────────────────────────────────────────────────
  const addHoliday = () => setHolidays([...holidays, { startDate: '', endDate: '', name: '', active: true }]);
  const removeHoliday = (index: number) => setHolidays(holidays.filter((_, i) => i !== index));
  const updateHoliday = (index: number, field: string, value: any) => {
    const next = [...holidays];
    next[index] = { ...next[index], [field]: value };
    setHolidays(next);
  };

  // ── Delivery zone handlers ─────────────────────────────────────────────────
  const addDeliveryZone = () => setDeliveryZones([...deliveryZones, { postalCode: '', price: 0, name: '', freeDeliveryThreshold: undefined }]);
  const removeDeliveryZone = (index: number) => setDeliveryZones(deliveryZones.filter((_, i) => i !== index));
  const updateDeliveryZone = (index: number, field: keyof DeliveryZone, value: string | number) => {
    const next = [...deliveryZones];
    next[index] = { ...next[index], [field]: value };
    setDeliveryZones(next);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres du Restaurant</h1>
        <p className="text-slate-500 mt-1">Gérez les informations de votre restaurant</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SettingsAccordion title="Informations de Contact" isOpen={expandedSections.contact} onToggle={() => toggleSection('contact')}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="contact@restaurant.com"
                />
              </div>
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Options de Commande" isOpen={expandedSections.ordering} onToggle={() => toggleSection('ordering')}>
          <div className="space-y-4">
            <ToggleRow
              title="Commandes à Emporter"
              description="Permettre aux clients de commander à emporter"
              checked={formData.pickupEnabled}
              onChange={(v) => setFormData({ ...formData, pickupEnabled: v })}
            />
            <ToggleRow
              title="Commandes en Livraison"
              description="Permettre aux clients de commander en livraison"
              checked={formData.deliveryEnabled}
              onChange={(v) => setFormData({ ...formData, deliveryEnabled: v })}
            />

            {!formData.pickupEnabled && !formData.deliveryEnabled && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Attention:</strong> Le retrait et la livraison sont désactivés. Les clients ne pourront pas passer de commandes.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Modes de paiement acceptés</h3>
              <div className="space-y-3">
                <ToggleRow
                  title="Espèces / Carte à la récupération"
                  description="Paiement en espèces ou par carte au comptoir"
                  checked={formData.cashEnabled}
                  onChange={(v) => setFormData({ ...formData, cashEnabled: v })}
                />
                <ToggleRow
                  title="Carte bancaire en ligne (Stripe)"
                  description="Paiement sécurisé par carte via Stripe"
                  checked={formData.stripeEnabled}
                  onChange={(v) => setFormData({ ...formData, stripeEnabled: v })}
                />
                {!formData.cashEnabled && !formData.stripeEnabled && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Attention:</strong> Aucun mode de paiement activé. Les clients ne pourront pas finaliser leurs commandes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Délai minimum de préparation</h3>
                  <p className="text-sm text-slate-500">Temps minimum entre la commande et le retrait/livraison</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="120"
                    step="5"
                    value={formData.minimumAdvanceNotice}
                    onChange={(e) => setFormData({ ...formData, minimumAdvanceNotice: parseInt(e.target.value) || 30 })}
                    className="w-20 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-600">min</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Livraison gratuite à partir de</h3>
                  <p className="text-sm text-slate-500">Montant minimum de commande pour offrir la livraison (0 = désactivé)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.freeDeliveryThreshold}
                    onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-24 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-600">€</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Impression des reçus" isOpen={expandedSections.printing} onToggle={() => toggleSection('printing')}>
          <PrintingSection
            adminToken={adminToken}
            printingEnabled={formData.printingEnabled}
            printNodeApiKey={formData.printNodeApiKey}
            printerPickupId={formData.printerPickupId}
            printerDeliveryId={formData.printerDeliveryId}
            onPrintingEnabledChange={(v) => setFormData({ ...formData, printingEnabled: v })}
            onApiKeyChange={(v) => setFormData({ ...formData, printNodeApiKey: v })}
            onPickupPrinterChange={(id) => setFormData({ ...formData, printerPickupId: id })}
            onDeliveryPrinterChange={(id) => setFormData({ ...formData, printerDeliveryId: id })}
          />
        </SettingsAccordion>

        <SettingsAccordion title="Sections du Site" isOpen={expandedSections.sections} onToggle={() => toggleSection('sections')}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-2">Afficher ou masquer des sections sur la page d'accueil.</p>
            <ToggleRow
              title="Section Avis"
              description="Afficher les avis clients sur la page d'accueil"
              checked={formData.reviewsEnabled}
              onChange={(v) => setFormData({ ...formData, reviewsEnabled: v })}
            />
            <ToggleRow
              title="Section Galerie"
              description="Afficher la galerie photos sur la page d'accueil"
              checked={formData.galleryEnabled}
              onChange={(v) => setFormData({ ...formData, galleryEnabled: v })}
            />
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Zones de livraison" isOpen={expandedSections.delivery} onToggle={() => toggleSection('delivery')}>
          <DeliveryZonesSection
            defaultDeliveryFee={formData.defaultDeliveryFee}
            onDefaultDeliveryFeeChange={(value) => setFormData({ ...formData, defaultDeliveryFee: value })}
            zones={deliveryZones}
            onAddZone={addDeliveryZone}
            onRemoveZone={removeDeliveryZone}
            onUpdateZone={updateDeliveryZone}
          />
        </SettingsAccordion>

        <SettingsAccordion title="Heures d'Ouverture" isOpen={expandedSections.hours} onToggle={() => toggleSection('hours')}>
          <HoursSection
            schedule={schedule}
            onAddDay={addDay}
            onRemoveDay={removeDay}
            onUpdateDayName={updateDayName}
            onAddSlot={addSlot}
            onRemoveSlot={removeSlot}
            onUpdateSlot={updateSlot}
          />
        </SettingsAccordion>

        <SettingsAccordion title="Fermetures Exceptionnelles" isOpen={expandedSections.holidays} onToggle={() => toggleSection('holidays')}>
          <HolidaysSection
            holidays={holidays}
            onAdd={addHoliday}
            onRemove={removeHoliday}
            onUpdate={updateHoliday}
          />
        </SettingsAccordion>

        <SettingsAccordion title="Réseaux Sociaux" isOpen={expandedSections.social} onToggle={() => toggleSection('social')}>
          <div className="space-y-4">
            <SocialInput
              label="URL Facebook"
              value={formData.socialLinks.facebook}
              placeholder="https://facebook.com/yourpage"
              onChange={(value) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: value } })}
            />
            <SocialInput
              label="URL Instagram"
              value={formData.socialLinks.instagram}
              placeholder="https://instagram.com/yourpage"
              onChange={(value) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: value } })}
            />
            <SocialInput
              label="URL Twitter"
              value={formData.socialLinks.twitter}
              placeholder="https://twitter.com/yourpage"
              onChange={(value) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: value } })}
            />
          </div>
        </SettingsAccordion>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <Save className="w-5 h-5" />
            {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>

          {saveStatus === 'success' && (
            <span className="text-green-600 font-medium flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Modifications enregistrées avec succès !
            </span>
          )}

          {saveStatus === 'error' && (
            <span className="text-red-600 font-medium">Erreur lors de l'enregistrement. Veuillez réessayer.</span>
          )}
        </div>
      </form>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
      </label>
    </div>
  );
}

function SocialInput({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder={placeholder}
      />
    </div>
  );
}
