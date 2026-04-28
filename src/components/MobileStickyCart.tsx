"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, X, ChevronUp, Trash2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { formatPrice } from '../utils/formatters';
import FreeDeliveryBar from './FreeDeliveryBar';

export default function MobileStickyCart() {
  const { getItemCount, getTotalPrice, orderItems, removeFromOrder, clearOrder, isInitialized } = useOrder();
  const restaurantInfo = useQuery(api.restaurantInfo.get);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isSideCartOpen, setIsSideCartOpen] = useState(false);
  const [canOpenCart, setCanOpenCart] = useState(true);
  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    // Show cart when items are added
    if (itemCount > 0) {
      setIsVisible(true);
      // Disable opening cart for 500ms to prevent accidental taps when modal closes
      setCanOpenCart(false);
      const timer = setTimeout(() => {
        setCanOpenCart(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Don't render until localized state is loaded
  if (!isInitialized) {
    return null;
  }

  // Don't render if no items
  if (itemCount === 0) {
    return null;
  }

  const handleCheckout = () => {
    if (restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled) {
      return;
    }
    setIsSideCartOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      {/* Side Cart Overlay */}
      {isSideCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSideCartOpen(false)}
        />
      )}

      {/* Side Cart Slide-out Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden transition-transform duration-300 ease-out shadow-[0_-8px_32px_rgba(0,0,0,0.15)] rounded-t-3xl ${isSideCartOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={() => setIsSideCartOpen(false)}
            className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Votre commande</h3>
            <p className="text-sm text-gray-500">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setIsSideCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: '50vh' }}>
          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              {item.image && (
                <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                  <span className="text-xs font-bold text-gray-400 shrink-0">{formatPrice(item.basePrice)}</span>
                </div>
                
                {item.selectedToppings && item.selectedToppings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.selectedToppings.map((t: any, idx: number) => (
                      <div key={`${t.toppingId}-${idx}`} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400 truncate">+ {t.name}</span>
                        {typeof t.price === 'number' && t.price > 0 && (
                          <span className="text-xs text-red-400 font-semibold flex-shrink-0">+{t.price.toFixed(2)}€</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-sm text-gray-900">{formatPrice(item.totalPrice)}</span>
                <button
                  onClick={() => removeFromOrder(item.id)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50 rounded-b-3xl">
          {/* Free Delivery Progress */}
          {(() => {
            const { useAuth } = require('../context/AuthContext');
            const { calculateDeliveryFee } = require('../utils/deliveryFeeCalculator');
            const { user } = useAuth();
            
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
              <div className="px-5 pb-1">
                <FreeDeliveryBar
                  currentTotal={totalPrice}
                  threshold={effectiveThreshold!}
                  compact
                />
              </div>
            );
          })()}

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-primary-600">{formatPrice(totalPrice)}</span>
          </div>

          {/* Clear Cart */}
          {orderItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Vider le panier ?')) {
                  clearOrder();
                  setIsSideCartOpen(false);
                }
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Vider le panier
            </button>
          )}

          {/* Checkout Button */}
          {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-amber-800 font-medium text-sm">Commandes indisponibles</p>
              <p className="text-amber-600 text-xs mt-1">Le restaurant est actuellement fermé</p>
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 active:scale-[0.98]"
            >
              Commander • {formatPrice(totalPrice)}
            </button>
          )}
        </div>
      </div>

      {/* Sticky Bottom Card - Compact version */}
      {!isSideCartOpen && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <button
            onClick={() => canOpenCart && setIsSideCartOpen(true)}
            disabled={!canOpenCart}
            className="flex items-center gap-3 bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full px-4 py-3 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] transition-all active:scale-95 disabled:opacity-90"
          >
            {/* Cart Icon with Badge */}
            <div className="relative">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {itemCount}
              </span>
            </div>

            {/* Info */}
            <div className="text-left pr-2">
              <p className="text-xs text-gray-500 font-medium">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
              <p className="font-bold text-gray-900">{formatPrice(totalPrice)}</p>
            </div>

            {/* Chevron */}
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}
    </>
  );
}
