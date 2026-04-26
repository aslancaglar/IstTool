"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Package, Bell, BellOff } from 'lucide-react';
import OrderCard from '../../../src/components/admin/Orders/OrderCard';
import OrderDetailsModal from '../../../src/components/admin/Orders/OrderDetailsModal';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

export default function OrdersPage() {
  const { adminToken } = useAdminAuth();
  const orders = useQuery(api.queries.getAllOrders, adminToken ? { adminToken } : "skip");
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const toppings = useQuery(api.toppingsAdmin.listToppings);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);
  const updatePaymentStatus = useMutation(api.mutations.updatePaymentStatus);
  const deleteOrderMutation = useMutation(api.mutations.deleteOrder);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-orders-sound-enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
      soundEnabledRef.current = true;
    }
  }, []);



  const filteredOrders = useMemo(() =>
    orders?.filter((order) => selectedStatus === 'all' || order.status === selectedStatus),
    [orders, selectedStatus]
  );

  const selectedOrder = useMemo(() =>
    orders?.find(o => o._id === selectedOrderId),
    [orders, selectedOrderId]
  );


  const toggleSound = useCallback(() => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundEnabledRef.current = nextState;
    localStorage.setItem('admin-orders-sound-enabled', String(nextState));

    if (nextState) {
      // iOS Safari REQUIRES that Audio is created AND play() is called synchronously
      // within a user gesture handler. This is the only reliable way to unlock audio on iOS.
      if (!audioRef.current) {
        const audio = new Audio('/sounds/new-order.mp3?v=2');
        audio.loop = true;
        audioRef.current = audio;
      }

      // Always call play() during the click event to unlock iOS audio context
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // If no pending orders, immediately pause after unlocking
          const hasPending = orders?.some(o => o.status === 'pending');
          if (!hasPending && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }).catch(e => console.log('iOS audio unlock failed:', e));
      }
    } else {
      // Disable: stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [soundEnabled, orders]);

  // Monitor pending orders and play/stop sound accordingly
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      const audio = new Audio('/sounds/new-order.mp3?v=' + Date.now());
      audio.loop = true;
      audioRef.current = audio;
    }

    if (!orders || !audioRef.current) return;

    const hasPending = orders.some(o => o.status === 'pending');
    
    const tryPlay = () => {
      if (soundEnabledRef.current && hasPending && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser blocked autoplay. Will retry on next interaction.
          });
        }
      }
    };

    if (soundEnabledRef.current && hasPending) {
      tryPlay();
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Add global listener to robustly unlock the audio context on ANY user interaction
    const unlockAudioContext = () => {
      if (audioRef.current && audioRef.current.dataset.unlocked !== 'true') {
        const p = audioRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            audioRef.current!.dataset.unlocked = 'true';
            // Only keep playing if we actually have pending orders and sound is enabled
            const stillPending = orders?.some(o => o.status === 'pending');
            if (!soundEnabledRef.current || !stillPending) {
              audioRef.current!.pause();
              audioRef.current!.currentTime = 0;
            }
          }).catch(() => {
            // Failed to unlock (e.g., simulated click), will retry on next click
          });
        }
      } else if (soundEnabledRef.current && hasPending && audioRef.current?.paused) {
        // Already unlocked but currently paused when it should be playing
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', unlockAudioContext, { passive: true });
    document.addEventListener('touchstart', unlockAudioContext, { passive: true });
    document.addEventListener('keydown', unlockAudioContext, { passive: true });
    
    return () => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
      document.removeEventListener('keydown', unlockAudioContext);
    };
  }, [orders, soundEnabled]);

  const handleStatusChange = useCallback(async (orderId: Id<'orders'>, newStatus: string) => {
    if (!adminToken) return;
    try {
      await updateOrderStatus({ orderId, status: newStatus as any, adminToken });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }, [updateOrderStatus, adminToken]);

  const handleDeleteOrder = useCallback(async (orderId: Id<'orders'>) => {
    if (!adminToken) return;
    try {
      await deleteOrderMutation({ orderId, adminToken });
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }, [deleteOrderMutation, adminToken]);

  const handlePaymentStatusChange = useCallback(async (orderId: Id<'orders'>, paymentStatus: 'paid' | 'unpaid') => {
    if (!adminToken) return;
    try {
      await updatePaymentStatus({ orderId, paymentStatus, adminToken });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }, [updatePaymentStatus, adminToken]);

    const getCount = (status: string) => {
      if (!orders) return 0;
      if (status === 'all') return orders.length;
      return orders.filter(o => o.status === status).length;
    };

    const tabConfig: { key: string; label: string; dot?: string }[] = [
      { key: 'all', label: 'Toutes' },
      { key: 'pending', label: 'En attente', dot: 'bg-amber-500' },
      { key: 'preparing', label: 'En préparation', dot: 'bg-blue-500' },
      { key: 'delivering', label: 'En livraison', dot: 'bg-purple-500' },
      { key: 'completed', label: 'Terminée', dot: 'bg-emerald-500' },
      { key: 'cancelled', label: 'Annulée', dot: 'bg-slate-400' },
    ];

    return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commandes</h1>
            <p className="text-slate-500 text-sm mt-1">{orders?.length ?? 0} commande{(orders?.length ?? 0) > 1 ? 's' : ''} au total</p>
          </div>
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition group ${soundEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {soundEnabled ? (
              <Bell className="w-4 h-4 text-emerald-600 active:scale-95 transition-transform" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
            )}
            <span className="font-semibold text-sm">
              {soundEnabled ? 'Son Activé' : 'Son Désactivé'}
            </span>
          </button>
        </div>

        {/* Filter tabs with counts */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {tabConfig.map((tab) => {
            const count = getCount(tab.key);
            const isActive = selectedStatus === tab.key;
            const hasPendingPulse = tab.key === 'pending' && count > 0;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {tab.dot && !isActive && (
                  <span className={`w-2 h-2 rounded-full ${tab.dot} ${hasPendingPulse ? 'animate-pulse' : ''}`} />
                )}
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md tabular-nums ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Order list */}
        <div className="space-y-3">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={setSelectedOrderId}
                onStatusChange={(id, status) => handleStatusChange(id as Id<'orders'>, status)}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Aucune commande</h3>
              <p className="text-sm text-slate-500">Rien à afficher pour ce filtre.</p>
            </div>
          )}
        </div>
      </div>

      <OrderDetailsModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onDeleteOrder={handleDeleteOrder}
        toppings={toppings}
        toppingCategories={toppingCategories}
      />
    </>
  );
}
