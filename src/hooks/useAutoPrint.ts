"use client";

import { useEffect, useRef } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface UseAutoPrintArgs {
    enabled: boolean;
    adminToken: string | null;
    orders: any[] | undefined;
    print: (printerName: string, base64: string) => Promise<void>;
}

// Watches the orders list and, for each pending+unprinted order, atomically
// claims it via markOrderPrinted then sends the receipt bytes to QZ Tray.
// Runs only when provider === 'qz' and admin token is present.
export function useAutoPrint({ enabled, adminToken, orders, print }: UseAutoPrintArgs) {
    const convex = useConvex();
    const markOrderPrinted = useMutation(api.printing.markOrderPrinted);
    const queueRef = useRef<Promise<void>>(Promise.resolve());
    const attemptedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!enabled || !adminToken || !orders) return;

        const candidates = orders.filter(
            (o) => o.status === "pending" && !o.printedAt && !attemptedRef.current.has(o._id),
        );
        if (candidates.length === 0) return;

        for (const order of candidates) {
            const orderId = order._id as Id<"orders">;
            attemptedRef.current.add(orderId);

            queueRef.current = queueRef.current.then(async () => {
                try {
                    const { claimed } = await markOrderPrinted({ orderId, adminToken });
                    if (!claimed) return;

                    const payload = await convex.query(api.printing.getReceiptPayload, {
                        orderId,
                        adminToken,
                    });
                    if (!payload || !payload.printerName) return;

                    await print(payload.printerName, payload.base64);
                } catch (e) {
                    console.error("Auto-print failed for order", orderId, e);
                    // Drop from attempted set so a manual reprint can retry later;
                    // but printedAt stays set so we don't spam-retry the same order.
                }
            });
        }
    }, [enabled, adminToken, orders, markOrderPrinted, convex, print]);
}
