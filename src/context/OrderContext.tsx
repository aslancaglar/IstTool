"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { OrderItem } from '../types/order';

const STORAGE_KEY = 'mondo_pizza_order_items';

interface OrderContextType {
  orderItems: OrderItem[];
  isInitialized: boolean;
  totalPrice: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToOrder: (item: OrderItem) => void;
  removeFromOrder: (itemId: string) => void;
  clearOrder: () => void;
  /** @deprecated Use totalPrice directly */
  getTotalPrice: () => number;
  /** @deprecated Use itemCount directly */
  getItemCount: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function loadOrderItems(): OrderItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load order items from localStorage:', error);
  }
  return [];
}

function saveOrderItems(items: OrderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save order items to localStorage:', error);
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize from localStorage ONLY on client
  useEffect(() => {
    const items = loadOrderItems();
    if (items.length > 0) {
      setOrderItems(items);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage only after initialization
  useEffect(() => {
    if (isInitialized) {
      saveOrderItems(orderItems);
    }
  }, [orderItems, isInitialized]);

  const addToOrder = useCallback((item: OrderItem) => {
    setOrderItems(prev => [...prev, item]);
  }, []);

  const removeFromOrder = useCallback((itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  // Derived values — computed once here, not re-computed by every consumer
  const totalPrice = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [orderItems]
  );
  const itemCount = orderItems.length;

  // Keep legacy function API for backwards compatibility during migration
  const getTotalPrice = useCallback(() => totalPrice, [totalPrice]);
  const getItemCount = useCallback(() => itemCount, [itemCount]);

  // MEMOIZATION: Prevent all components consuming useOrder() from re-rendering just because the parent re-rendered
  const contextValue = useMemo(() => ({
    orderItems,
    isInitialized,
    totalPrice,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    addToOrder,
    removeFromOrder,
    clearOrder,
    getTotalPrice,
    getItemCount,
  }), [orderItems, isInitialized, totalPrice, itemCount, isCartOpen, addToOrder, removeFromOrder, clearOrder, getTotalPrice, getItemCount]);

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
