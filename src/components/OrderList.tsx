"use client";
import { useMemo } from 'react';
import { X, ShoppingBag, Trash2, Sandwich, Gift, Plus, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useOrder } from '../context/OrderContext';
import FreeDeliveryBar from './FreeDeliveryBar';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { calculateDeliveryFee } from '../utils/deliveryFeeCalculator';

interface OrderListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderList({ isOpen, onClose }: OrderListProps) {
  const { orderItems, removeFromOrder, getTotalPrice, addToOrder } = useOrder();
  const { user } = useAuth();
  const restaurantInfo = useQuery(api.restaurantInfo.get);
  const activeCampaigns = useQuery(api.promoCodes.listActiveCampaigns);
  const upsellItems = useQuery(api.menuItems.listUpsellItems);

  const bogoFreeItems = useMemo(() => {
    if (!activeCampaigns) return [];
    const subtotal = getTotalPrice();
    const result: { menuItemId: string; name: string; image?: string; selectedToppings: { toppingId: string; name: string; price?: number }[]; finalPrice: number }[] = [];
    for (const campaign of activeCampaigns) {
      if (campaign.discountType !== 'bogo_same') continue;
      if (campaign.minOrderAmount != null && subtotal < campaign.minOrderAmount) continue;
      const eligibleIds: string[] = (campaign as any).applicableMenuItemIds ?? [];
      for (const item of orderItems) {
        if (eligibleIds.length > 0 && !eligibleIds.includes(item.menuItemId)) continue;
        const allToppingsForFree = item.selectedToppings.map(
          (t: any) => t.freeForBogo === true ? { ...t, price: 0 } : t
        );
        const toppingFinalPrice = allToppingsForFree.reduce((sum: number, t: any) => sum + (t.price ?? 0), 0);
        result.push({
          menuItemId: item.menuItemId,
          name: item.name,
          image: (item as any).image,
          selectedToppings: allToppingsForFree,
          finalPrice: toppingFinalPrice,
        });
      }
    }
    return result;
  }, [activeCampaigns, orderItems, getTotalPrice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-x-4 top-4 bottom-4 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 bg-white rounded-2xl lg:rounded-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 font-display">Votre Commande</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orderItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                Votre commande est vide
              </p>
              <p className="text-gray-400 text-sm">
                Ajoutez des articles pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 relative"
                >
                  <button
                    onClick={() => removeFromOrder(item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-3 pr-8">
                    {item.image ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Sandwich className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <span className="text-xs font-bold text-gray-400 shrink-0">
                          {item.basePrice.toFixed(2)}€
                        </span>
                      </div>

                      {item.selectedToppings.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.selectedToppings.map((topping: any, index: number) => (
                            <div
                              key={`${topping.toppingId}-${index}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="text-[10px] text-gray-400 truncate">
                                + {topping.name}
                              </span>
                              {typeof topping.price === 'number' && topping.price > 0 && (
                                <span className="text-[10px] text-red-400 font-bold flex-shrink-0">
                                  +{topping.price.toFixed(2)}€
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-display">Sous-total</span>
                    <span className="font-bold text-gray-900 font-display">
                      {item.totalPrice.toFixed(2)}€
                    </span>
                  </div>
                </div>
              ))}

              {bogoFreeItems.map((item, idx) => (
                <div
                  key={`bogo-${item.menuItemId}-${idx}`}
                  className="rounded-lg p-4 border-2 border-dashed border-emerald-200 bg-emerald-50/60"
                >
                  <div className="flex gap-3">
                    {item.image ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover opacity-80"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                          Offert
                        </span>
                        <h3 className="text-sm font-bold text-emerald-800 truncate">{item.name}</h3>
                      </div>
                      {item.selectedToppings && item.selectedToppings.length > 0 ? (
                        <div className="space-y-0.5">
                          {item.selectedToppings.map((t, tidx) => (
                            <div key={`${t.toppingId}-${tidx}`} className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-emerald-500 truncate">+ {t.name}</span>
                              {typeof t.price === 'number' && t.price > 0 && (
                                <span className="text-[10px] text-emerald-600 font-bold shrink-0">+{t.price.toFixed(2)}€</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-700 mt-1 font-medium">1 article offert — 1 acheté = 1 offert</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
                    <span className="text-xs text-emerald-600">Produit offert</span>
                    <span className="font-bold text-emerald-700">{item.finalPrice > 0 ? `${item.finalPrice.toFixed(2)}€` : '0.00€'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {orderItems.length > 0 && upsellItems && upsellItems.length > 0 && (() => {
          const cartItemIds = new Set(orderItems.map(i => i.menuItemId));
          const visibleUpsells = upsellItems.filter(u => !cartItemIds.has(u._id));
          if (visibleUpsells.length === 0) return null;
          return (
            <div className="border-t px-5 py-4 bg-orange-50/40">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ajouter à votre commande</p>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {visibleUpsells.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addToOrder({
                      id: `${item._id}-${Date.now()}`,
                      menuItemId: item._id,
                      name: item.name,
                      image: item.image || '',
                      basePrice: item.price,
                      selectedToppings: [],
                      totalPrice: item.price,
                    })}
                    className="flex-shrink-0 flex items-center gap-2.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl p-2.5 transition-all group w-44"
                  >
                    {item.image ? (
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                        <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Sandwich className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{item.name}</p>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">{item.price.toFixed(2)}€</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-orange-500 group-hover:bg-orange-600 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {orderItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {(() => {
              // 1. Prioritize general threshold if it exists
              let effectiveThreshold = restaurantInfo?.freeDeliveryThreshold;
              
              // 2. If no general threshold and user is logged in, try to find zone-specific threshold
              if ((!effectiveThreshold || effectiveThreshold <= 0) && user?.zipCode) {
                const zoneResult = calculateDeliveryFee(user.zipCode, restaurantInfo?.deliveryFees);
                if (zoneResult.matched && zoneResult.freeDeliveryThreshold) {
                  effectiveThreshold = zoneResult.freeDeliveryThreshold;
                }
              }

              // 3. Show if we have a threshold AND (general threshold exists OR user is logged in)
              const showBar = effectiveThreshold && effectiveThreshold > 0 && (
                (restaurantInfo?.freeDeliveryThreshold && restaurantInfo.freeDeliveryThreshold > 0) || 
                user
              );

              if (!showBar) return null;

              return (
                <FreeDeliveryBar
                  currentTotal={getTotalPrice()}
                  threshold={effectiveThreshold!}
                />
              );
            })()}

            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900 font-display">Total</span>
              <span className="text-red-500 font-display">
                {getTotalPrice().toFixed(2)}€
              </span>
            </div>

            {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled && !restaurantInfo.dineInEnabled ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-amber-800 font-medium">
                  Les commandes sont temporairement indisponibles
                </p>
                <p className="text-amber-600 text-sm mt-1">
                  Veuillez nous appeler pour passer commande
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/checkout';
                }}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Commander
                <Sandwich className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
