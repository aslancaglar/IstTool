"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { OrderItem } from '../types/order';

const STORAGE_KEY = 'mondo_pizza_order_items';

interface OrderContextType {
  orderItems: OrderItem[];
  isInitialized: boolean;
  addToOrder: (item: OrderItem) => void;
  removeFromOrder: (itemId: string) => void;
  clearOrder: () => void;
  getTotalPrice: () => number;
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

  const getTotalPrice = useCallback(() => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [orderItems]);

  const getItemCount = useCallback(() => {
    return orderItems.length;
  }, [orderItems]);

  // MEMOIZATION: Prevent all components consuming useOrder() from re-rendering just because the parent re-rendered
  const contextValue = useMemo(() => ({
    orderItems,
    isInitialized,
    addToOrder,
    removeFromOrder,
    clearOrder,
    getTotalPrice,
    getItemCount,
  }), [orderItems, isInitialized, addToOrder, removeFromOrder, clearOrder, getTotalPrice, getItemCount]);

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
