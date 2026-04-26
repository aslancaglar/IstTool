/**
 * Shared constants for the Kdeniz application
 */

// Order status values - must match schema.ts union type
export const ORDER_STATUS = {
    PENDING: "pending",
    PREPARING: "preparing",
    READY: "ready",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Price option values
export const PRICE_OPTIONS = {
    SEUL: "seul",
    FRITES: "frites",
    MENU: "menu",
} as const;

export type PriceOption = typeof PRICE_OPTIONS[keyof typeof PRICE_OPTIONS];
