"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    initQz,
    connectQz,
    disconnectQz,
    listQzPrinters,
    printRaw,
    isQzConnected,
} from "../lib/qz/client";

export type QzStatus = "idle" | "connecting" | "connected" | "error";

export interface UseQzPrinter {
    status: QzStatus;
    error: string | null;
    printers: string[];
    refreshPrinters: () => Promise<void>;
    print: (printerName: string, base64: string) => Promise<void>;
    reconnect: () => Promise<void>;
}

// Mounts the QZ Tray websocket connection and exposes printer ops.
// Pass `enabled=false` to leave QZ dormant (e.g. when the admin chose PrintNode).
export function useQzPrinter(enabled: boolean): UseQzPrinter {
    const signMessage = useAction(api.qz.signMessage);
    const [status, setStatus] = useState<QzStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [printers, setPrinters] = useState<string[]>([]);
    const initRef = useRef(false);

    const doConnect = useCallback(async () => {
        setStatus("connecting");
        setError(null);
        try {
            if (!initRef.current) {
                await initQz((msg) => signMessage({ message: msg }));
                initRef.current = true;
            }
            await connectQz();
            const found = await listQzPrinters();
            setPrinters(found);
            setStatus("connected");
        } catch (e: any) {
            console.error("QZ connect failed:", e);
            setError(e?.message ?? String(e));
            setStatus("error");
        }
    }, [signMessage]);

    useEffect(() => {
        if (!enabled) {
            // Don't disconnect on disable — other tabs may still need it.
            setStatus("idle");
            return;
        }
        doConnect();
        return () => {
            // Best-effort cleanup; only disconnect if we own the connection in
            // this tab. Leave open across re-renders.
        };
    }, [enabled, doConnect]);

    const refreshPrinters = useCallback(async () => {
        try {
            if (!(await isQzConnected())) await doConnect();
            const found = await listQzPrinters();
            setPrinters(found);
            setStatus("connected");
            setError(null);
        } catch (e: any) {
            console.error("QZ refresh failed:", e);
            setError(e?.message ?? String(e));
            setStatus("error");
        }
    }, [doConnect]);

    const print = useCallback(async (printerName: string, base64: string) => {
        if (!(await isQzConnected())) await doConnect();
        await printRaw(printerName, base64);
    }, [doConnect]);

    const reconnect = useCallback(async () => {
        try { await disconnectQz(); } catch { /* ignore */ }
        await doConnect();
    }, [doConnect]);

    return { status, error, printers, refreshPrinters, print, reconnect };
}
