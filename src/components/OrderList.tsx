"use client";
import { X, ShoppingBag, Trash2, Sandwich } from 'lucide-react';
import Image from 'next/image';
import { useOrder } from '../context/OrderContext';
import FreeDeliveryBar from './FreeDeliveryBar';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface OrderListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderList({ isOpen, onClose }: OrderListProps) {
  const { orderItems, removeFromOrder, clearOrder, getTotalPrice } = useOrder();
  const restaurantInfo = useQuery(api.restaurantInfo.get);

  if (!isOpen) return null;

  const formatPriceOption = (option: string) => {
    switch (option) {
      case 'seul':
        return 'Seul';
      case 'frites':
        return 'avec Frites';
      case 'menu':
        return 'Menu';
      default:
        return option;
    }
  };

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
            </div>
          )}
        </div>

        {orderItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <button
              onClick={clearOrder}
              className="w-full text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Vider la commande
            </button>

            {restaurantInfo?.freeDeliveryThreshold && restaurantInfo.freeDeliveryThreshold > 0 && (
              <FreeDeliveryBar
                currentTotal={getTotalPrice()}
                threshold={restaurantInfo.freeDeliveryThreshold}
              />
            )}

            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900 font-display">Total</span>
              <span className="text-red-500 font-display">
                {getTotalPrice().toFixed(2)}€
              </span>
            </div>

            {restaurantInfo && !restaurantInfo.pickupEnabled && !restaurantInfo.deliveryEnabled ? (
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
