"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronUp } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../utils/formatters';

export default function MobileStickyCart() {
  const { totalPrice, itemCount, isInitialized, isCartOpen, setIsCartOpen } = useOrder();
  
  const [isVisible, setIsVisible] = useState(false);
  const [canOpenCart, setCanOpenCart] = useState(true);

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


  return (
    <>
      {/* Sticky Bottom Card - Compact version */}
      {!isCartOpen && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <button
            onClick={() => canOpenCart && setIsCartOpen(true)}
            disabled={!canOpenCart}
            className="flex items-center gap-3 bg-primary-600 shadow-[0_4px_20px_rgba(185,28,28,0.4)] rounded-full px-4 py-3 hover:bg-primary-700 hover:shadow-[0_6px_24px_rgba(185,28,28,0.5)] transition-all active:scale-95 disabled:opacity-90"
          >
            {/* Cart Icon with Badge */}
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary-600">
                {itemCount}
              </span>
            </div>

            {/* Info */}
            <div className="text-left pr-2">
              <p className="text-xs text-white/75 font-medium">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
              <p className="font-bold text-white">{formatPrice(totalPrice)}</p>
            </div>

            {/* Chevron */}
            <ChevronUp className="w-5 h-5 text-white/80" />
          </button>
        </div>
      )}
    </>
  );
}
