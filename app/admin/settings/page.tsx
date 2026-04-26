"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Save, Plus, Trash2, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

type TimeSlot = {
  start: string;
  end: string;
};

type DaySchedule = {
  day: string;
  slots: TimeSlot[];
};

type SectionId = 'contact' | 'ordering' | 'hours' | 'holidays' | 'social' | 'delivery';

type DeliveryZone = {
  postalCode: string;
  price: number;
  name?: string;
};

export default function SettingsPage() {
  const { adminToken } = useAdminAuth();
  const restaurantInfo = useQuery(api.restaurantInfo.get);
  const upsertRestaurantInfo = useMutation(api.restaurantInfo.upsert);

  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    contact: false,
    ordering: false,
    hours: false,
    holidays: false,
    social: false,
    delivery: false,
  });

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    hours: [] as { day: string, time: string }[],
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    holidays: [] as { startDate: string, endDate: string, name?: string, active: boolean }[],
    pickupEnabled: true,
    deliveryEnabled: true,
    minimumAdvanceNotice: 30,
    deliveryFees: [] as DeliveryZone[],
    defaultDeliveryFee: 0,
    freeDeliveryThreshold: 0,
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [holidays, setHolidays] = useState<{ startDate: string, endDate: string, name?: string, active: boolean }[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Parse valid hours string into slots
  // Format expected: "11h00 - 15h00" or "11:00 - 15:00"
  // Multi-slot: "11h00 - 15h00 et 18h00 - 22h00"
  const parseTime = (timeStr: string): TimeSlot[] => {
    if (!timeStr) return [];

    // Normalize string: replace 'h' with ':' and logic parsers
    const normalized = timeStr.toLowerCase().replace(/h/g, ':');
    const parts = normalized.split(/ et | and |,/);

    return parts.map(part => {
      const times = part.match(/(\d{1,2}:\d{2})/g);
      if (times && times.length >= 2) {
        return { start: times[0], end: times[1] };
      }
      return { start: '', end: '' };
    }).filter(slot => slot.start && slot.end);
  };

  useEffect(() => {
    if (restaurantInfo) {
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
      });

      setHolidays(restaurantInfo.holidays || []);
      setDeliveryZones(restaurantInfo.deliveryFees || []);

      // Initialize schedule from DB hours
      if (restaurantInfo.hours) {
        const parsedSchedule = restaurantInfo.hours.map(h => ({
          day: h.day,
          slots: parseTime(h.time)
        }));
        // If parsing failed (empty slots) but day exists, add default empty slot
        const validSchedule = parsedSchedule.map(s =>
          s.slots.length > 0 ? s : { ...s, slots: [{ start: '', end: '' }] }
        );
        setSchedule(validSchedule);
      } else {
        setSchedule([
          { day: 'Lundi - Samedi', slots: [{ start: '11:00', end: '14:00' }, { start: '18:00', end: '22:00' }] }
        ]);
      }
    }
  }, [restaurantInfo]);

  const serializeSchedule = (): { day: string, time: string }[] => {
    return schedule.map(day => {
      const timeStr = day.slots
        .filter(s => s.start && s.end)
        .map(s => `${s.start.replace(':', 'h')} - ${s.end.replace(':', 'h')}`)
        .join(' et ');

      return {
        day: day.day,
        time: timeStr || 'Fermé'
      };
    });
  };

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
        holidays: holidays,
        pickupEnabled: formData.pickupEnabled,
        deliveryEnabled: formData.deliveryEnabled,
        minimumAdvanceNotice: formData.minimumAdvanceNotice,
        deliveryFees: deliveryZones.filter(z => z.postalCode.trim() !== ''),
        defaultDeliveryFee: formData.defaultDeliveryFee,
        freeDeliveryThreshold: formData.freeDeliveryThreshold,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving restaurant info:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const addDay = () => {
    setSchedule([...schedule, { day: '', slots: [{ start: '', end: '' }] }]);
  };

  const removeDay = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateDayName = (index: number, name: string) => {
    const newSchedule = [...schedule];
    newSchedule[index].day = name;
    setSchedule(newSchedule);
  };

  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ start: '', end: '' });
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots = newSchedule[dayIndex].slots.filter((_, i) => i !== slotIndex);
    setSchedule(newSchedule);
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
  };

  const addHoliday = () => {
    setHolidays([...holidays, { startDate: '', endDate: '', name: '', active: true }]);
  };

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const updateHoliday = (index: number, field: string, value: any) => {
    const newHolidays = [...holidays];
    newHolidays[index] = { ...newHolidays[index], [field]: value };
    setHolidays(newHolidays);
  };

  // Delivery zone management functions
  const addDeliveryZone = () => {
    setDeliveryZones([...deliveryZones, { postalCode: '', price: 0, name: '' }]);
  };

  const removeDeliveryZone = (index: number) => {
    setDeliveryZones(deliveryZones.filter((_, i) => i !== index));
  };

  const updateDeliveryZone = (index: number, field: keyof DeliveryZone, value: string | number) => {
    const newZones = [...deliveryZones];
    newZones[index] = { ...newZones[index], [field]: value };
    setDeliveryZones(newZones);
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl pb-20">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Paramètres du Restaurant</h1>
          <p className="text-slate-600 mt-2">Gérez les informations de votre restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Informations de Contact</h2>
              {expandedSections.contact ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.contact && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0 space-y-4">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('ordering')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Options de Commande</h2>
              {expandedSections.ordering ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.ordering && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0">
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">Commandes à Emporter</h3>
                      <p className="text-sm text-slate-500">Permettre aux clients de commander à emporter</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pickupEnabled}
                        onChange={(e) => setFormData({ ...formData, pickupEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">Commandes en Livraison</h3>
                      <p className="text-sm text-slate-500">Permettre aux clients de commander en livraison</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.deliveryEnabled}
                        onChange={(e) => setFormData({ ...formData, deliveryEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {!formData.pickupEnabled && !formData.deliveryEnabled && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>⚠️ Attention:</strong> Le retrait et la livraison sont désactivés. Les clients ne pourront pas passer de commandes.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-4">
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
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-sm text-slate-600">min</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-4">
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
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-sm text-slate-600">€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Zones Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('delivery')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Zones de livraison</h2>
              {expandedSections.delivery ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.delivery && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0">
                <div className="mt-4 space-y-6">
                  {/* Default Delivery Fee */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                          value={formData.defaultDeliveryFee}
                          onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-sm text-slate-600">€</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Zones List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900">Zones de livraison</h3>
                      <button
                        type="button"
                        onClick={addDeliveryZone}
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter une zone
                      </button>
                    </div>

                    <div className="space-y-3">
                      {deliveryZones.map((zone, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                          <button
                            type="button"
                            onClick={() => removeDeliveryZone(index)}
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
                                onChange={(e) => updateDeliveryZone(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
                                onChange={(e) => updateDeliveryZone(index, 'postalCode', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
                                onChange={(e) => updateDeliveryZone(index, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {deliveryZones.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                          Aucune zone de livraison configurée. Cliquez sur "Ajouter une zone" pour commencer.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('hours')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Heures d'Ouverture</h2>
              {expandedSections.hours ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.hours && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0">
                <div className="flex justify-end mb-4 mt-4">
                  <button
                    type="button"
                    onClick={addDay}
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un Jour
                  </button>
                </div>

                <div className="space-y-6">
                  {schedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                      <button
                        type="button"
                        onClick={() => removeDay(dayIndex)}
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
                          onChange={(e) => updateDayName(dayIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
                                  onChange={(e) => updateSlot(dayIndex, slotIndex, 'start', e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                              <span className="text-slate-400 text-center">-</span>
                              <div className="relative">
                                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateSlot(dayIndex, slotIndex, 'end', e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSlot(dayIndex, slotIndex)}
                              className="p-2 text-slate-400 hover:text-red-500"
                              title="Supprimer le créneau"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addSlot(dayIndex)}
                          className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium mt-2"
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
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('holidays')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Fermetures Exceptionnelles</h2>
              {expandedSections.holidays ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.holidays && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0">
                <div className="flex justify-end mb-6 mt-4">
                  <button
                    type="button"
                    onClick={addHoliday}
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une période
                  </button>
                </div>

                <div className="space-y-4">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                      <button
                        type="button"
                        onClick={() => removeHoliday(index)}
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
                            onChange={(e) => updateHoliday(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g. Vacances d'été"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de début</label>
                          <input
                            type="date"
                            value={holiday.startDate}
                            onChange={(e) => updateHoliday(index, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date de fin</label>
                          <input
                            type="date"
                            value={holiday.endDate}
                            onChange={(e) => updateHoliday(index, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`active-${index}`}
                            checked={holiday.active}
                            onChange={(e) => updateHoliday(index, 'active', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
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
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('social')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xl font-bold text-slate-900">Réseaux Sociaux</h2>
              {expandedSections.social ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.social && (
              <div className="p-6 pt-0 border-t border-slate-100 mt-0 space-y-4">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Facebook</label>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Instagram</label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Twitter</label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
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
    </>
  );
}
