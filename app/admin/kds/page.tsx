"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell, BellOff, Clock3, GripVertical, MapPin, Package, Phone, Truck } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAdminAuth } from "../../../src/context/AdminAuthContext";
import type { Id } from "../../../convex/_generated/dataModel";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

type StatusColumn = {
  status: OrderStatus;
  title: string;
  subtitle: string;
  badgeClass: string;
};

const STATUS_COLUMNS: StatusColumn[] = [
  { status: "pending", title: "En attente", subtitle: "Nouvelles commandes", badgeClass: "bg-amber-100 text-amber-700" },
  { status: "preparing", title: "Préparation", subtitle: "En cuisine", badgeClass: "bg-blue-100 text-blue-700" },
  { status: "ready", title: "Prête", subtitle: "En attente de retrait", badgeClass: "bg-emerald-100 text-emerald-700" },
  { status: "completed", title: "Terminée", subtitle: "Fini", badgeClass: "bg-slate-200 text-slate-700" },
  { status: "cancelled", title: "Annulée", subtitle: "Arrêtée", badgeClass: "bg-rose-100 text-rose-700" },
];

function formatSchedule(value: string) {
  if (!value || value === "asap") return "ASAP";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatCreatedAt(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminKdsPage() {
  const { adminToken } = useAdminAuth();
  const orders = useQuery(api.queries.getAllOrders, adminToken ? { adminToken } : "skip");
  const toppings = useQuery(api.toppingsAdmin.listToppings);
  const updateOrderStatus = useMutation(api.mutations.updateOrderStatus);

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [draggingOrderId, setDraggingOrderId] = useState<Id<"orders"> | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<OrderStatus | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<Id<"orders"> | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-kds-sound-enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
    }
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toppingNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const topping of toppings || []) {
      map.set(topping.toppingId, topping.name);
    }
    return map;
  }, [toppings]);

  const groupedOrders = useMemo(() => {
    const grouped: Record<OrderStatus, any[]> = {
      pending: [],
      preparing: [],
      ready: [],
      completed: [],
      cancelled: [],
    };

    for (const order of orders || []) {
      grouped[order.status as OrderStatus]?.push(order);
    }

    grouped.pending.sort((a, b) => a.createdAt - b.createdAt);
    grouped.preparing.sort((a, b) => a.createdAt - b.createdAt);
    grouped.ready.sort((a, b) => a.createdAt - b.createdAt);
    grouped.completed.sort((a, b) => b.createdAt - a.createdAt);
    grouped.cancelled.sort((a, b) => b.createdAt - a.createdAt);

    return grouped;
  }, [orders]);

  const activeCount = (groupedOrders.pending?.length || 0) + (groupedOrders.preparing?.length || 0) + (groupedOrders.ready?.length || 0);

  const toggleOrderDetails = useCallback((orderId: string) => {
    setExpandedOrders((previous) => {
      const next = new Set(previous);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const moveOrderToStatus = useCallback(
    async (orderId: Id<"orders">, nextStatus: OrderStatus, currentStatus?: OrderStatus) => {
      if (!adminToken) return;
      if (currentStatus === nextStatus) return;

      setUpdatingOrderId(orderId);
      try {
        await updateOrderStatus({
          orderId,
          adminToken,
          status: nextStatus,
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [adminToken, updateOrderStatus],
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      // Append timestamp to prevent browser caching of the old sound file
      const audio = new Audio('/sounds/new-order.mp3?v=' + Date.now());
      audio.loop = true;
      audioRef.current = audio;
    }

    if (!orders || !audioRef.current) return;

    const hasPending = orders.some((order) => order.status === "pending");

    const tryPlay = () => {
      if (soundEnabled && hasPending && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio autoplay prevented. Awaiting interaction."));
        }
      }
    };

    if (soundEnabled && hasPending) {
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
            if (!soundEnabled || !stillPending) {
              audioRef.current!.pause();
              audioRef.current!.currentTime = 0;
            }
          }).catch(() => {
            // Failed to unlock (e.g., simulated click), will retry on next click
          });
        }
      } else if (soundEnabled && hasPending && audioRef.current?.paused) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">KDS Kanban</h1>
          <p className="mt-2 text-slate-600">Faites glisser les commandes entre les colonnes pour mettre à jour le statut en cuisine en temps réel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const nextState = !soundEnabled;
              if (nextState && audioRef.current) {
                // If turning on and there are pending orders, try to play immediately to bypass autoplay blocking
                const hasPending = orders?.some(o => o.status === 'pending');
                if (hasPending) {
                  audioRef.current.play().catch(e => console.log(e));
                }
              }
              setSoundEnabled(nextState);
              localStorage.setItem('admin-kds-sound-enabled', String(nextState));
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${soundEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            title={soundEnabled ? "Désactiver le son" : "Activer le son"}
          >
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {soundEnabled ? "Son Activé" : "Son Désactivé"}
          </button>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Commandes Actives</p>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>
      </div>

      {orders === undefined ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Chargement du tableau KDS...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
          {STATUS_COLUMNS.map((column) => {
            const items = groupedOrders[column.status] || [];
            const isDropActive = dragOverStatus === column.status;

            return (
              <section
                key={column.status}
                className={`min-h-[420px] rounded-2xl border border-slate-200 bg-white p-4 transition ${isDropActive ? "ring-2 ring-indigo-300 bg-indigo-50/50" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverStatus(column.status);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  const droppedOrderId = (event.dataTransfer.getData("text/plain") as Id<"orders">) || draggingOrderId;
                  const droppedFromStatus = event.dataTransfer.getData("application/x-kds-status") as OrderStatus;
                  setDragOverStatus(null);
                  setDraggingOrderId(null);

                  if (!droppedOrderId) return;
                  void moveOrderToStatus(droppedOrderId, column.status, droppedFromStatus);
                }}
              >
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{column.title}</h2>
                    <p className="text-xs text-slate-500">{column.subtitle}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${column.badgeClass}`}>{items.length}</span>
                </div>

                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                      Aucune commande
                    </div>
                  ) : (
                    items.map((order) => {
                      const isExpanded = expandedOrders.has(order._id);
                      const isUpdating = updatingOrderId === order._id;

                      return (
                        <article
                          key={order._id}
                          draggable={!isUpdating}
                          onDragStart={(event) => {
                            setDraggingOrderId(order._id);
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", order._id);
                            event.dataTransfer.setData("application/x-kds-status", order.status);
                          }}
                          onDragEnd={() => {
                            setDragOverStatus(null);
                            setDraggingOrderId(null);
                          }}
                          className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition ${isUpdating ? "opacity-60" : "hover:border-slate-300 hover:shadow-md"}`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-black text-slate-900">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs font-medium text-slate-500">
                                {order.customer.firstName} {order.customer.lastName}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <GripVertical className="h-3.5 w-3.5" />
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatCreatedAt(order.createdAt)}
                            </div>
                          </div>

                          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                              <span className="font-semibold text-slate-900">{order.totalPrice.toFixed(2)}€</span>
                              <span className="ml-1">Total</span>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                              <span className="font-semibold text-slate-900">{formatSchedule(order.scheduledTime)}</span>
                              <span className="ml-1">Heure</span>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                              <span className="font-semibold text-slate-900">{order.items.length}</span>
                              <span className="ml-1">Items</span>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-slate-600">
                              <span className="font-semibold text-slate-900">{order.type === "delivery" ? "Livraison" : "Emporter"}</span>
                            </div>
                          </div>

                          <div className="mb-3 flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`tel:${order.customer.phone}`} className="hover:underline">
                              {order.customer.phone}
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleOrderDetails(order._id)}
                            className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
                          >
                            {isExpanded ? "Masquer les détails" : "Afficher les détails"}
                          </button>

                          {isExpanded && (
                            <div className="mb-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                              {order.items.map((item: any, index: number) => (
                                <div key={`${order._id}-item-${index}`} className="rounded-md border border-slate-200 bg-white p-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                                    <p className="text-xs font-bold text-slate-700">{item.finalPrice.toFixed(2)}€</p>
                                  </div>
                                  {item.selectedSize && <p className="text-[11px] text-slate-500">Taille : {item.selectedSize}</p>}
                                  {item.selectedToppings?.length > 0 && (
                                    <p className="mt-1 text-[11px] text-slate-500">
                                      Garnitures :{" "}
                                      {item.selectedToppings
                                        .flatMap((group: any) => group.toppingNames || group.toppingIds || [])
                                        .map((nameOrId: string) => toppingNameById.get(nameOrId) || nameOrId)
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                              ))}

                              {order.type === "delivery" && order.address && (
                                <div className="rounded-md border border-purple-100 bg-purple-50 p-2 text-[11px] text-purple-900">
                                  <p className="mb-1 flex items-center gap-1 font-semibold">
                                    <Truck className="h-3.5 w-3.5" /> Adresse de livraison
                                  </p>
                                  <p className="leading-tight">
                                    <MapPin className="mr-1 inline h-3 w-3" />
                                    {order.address.street}, {order.address.zipCode} {order.address.city}
                                  </p>
                                  {order.address.instructions && (
                                    <p className="mt-1 rounded bg-white/70 p-1 text-[10px]">Note : {order.address.instructions}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-500" />
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(event) => void moveOrderToStatus(order._id, event.target.value as OrderStatus, order.status as OrderStatus)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed"
                            >
                              {STATUS_COLUMNS.map((statusOption) => (
                                <option key={`${order._id}-${statusOption.status}`} value={statusOption.status}>
                                  {statusOption.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
