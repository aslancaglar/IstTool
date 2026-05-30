// QZ Tray browser client wrapper.
// QZ Tray is a local daemon (wss://localhost:8181) that bridges the browser
// to attached printers. This module is the single entry point for everything
// the app needs: initialization (cert + sign), connection, printer listing,
// raw ESC/POS printing.
//
// All functions are async and safe to call only in the browser. The qz-tray
// package touches `window` lazily inside connect()/print() — importing the
// module on the server is fine, but never invoke these from server code.

// qz-tray ships without TypeScript typings. Minimal local declaration.
type QzApi = {
    security: {
        // qz-tray accepts a (resolve,reject)=>void function, an async function,
        // or a Promise<string>. Keep the type permissive.
        setCertificatePromise: (fn: any) => void;
        setSignatureAlgorithm: (alg: string) => void;
        // qz-tray accepts a factory (toSign)=>(resolve,reject)=>void OR an
        // async function (toSign)=>Promise<string>.
        setSignaturePromise: (fn: any) => void;
    };
    websocket: {
        connect: (options?: any) => Promise<void>;
        disconnect: () => Promise<void>;
        isActive: () => boolean;
    };
    printers: {
        find: () => Promise<string[] | string>;
        getDefault: () => Promise<string>;
    };
    configs: {
        create: (printer: string, opts?: any) => unknown;
    };
    print: (config: unknown, data: any[]) => Promise<void>;
};

let qzModule: QzApi | null = null;
let initialized = false;

async function loadQz(): Promise<QzApi> {
    if (qzModule) return qzModule;
    // Dynamic import avoids pulling qz-tray into any SSR bundle path.
    const mod = await import("qz-tray");
    qzModule = (mod as any).default ?? (mod as unknown as QzApi);
    return qzModule!;
}

// Signed mode: browser sends our public cert during connect; each call is
// signed by our Convex action with the matching private key. With override.crt
// installed on the local QZ Tray (`/Applications/QZ Tray.app/Contents/Resources/`
// on macOS), this gives silent printing from any origin that signs with the
// matching key — no QZ Tray dialogs.
export async function initQz(signMessage: (msg: string) => Promise<string>): Promise<void> {
    if (initialized) return;
    const qz = await loadQz();

    // Public cert — sent during the websocket connect handshake.
    // Async-function form (qz-tray detects AsyncFunction via .constructor.name
    // and uses the returned promise directly, avoiding the silent-failure mode
    // of the (resolve, reject) => ... wrapper).
    qz.security.setCertificatePromise(async () => {
        const res = await fetch("/qz-digital-certificate.txt", { cache: "no-store" });
        if (!res.ok) throw new Error(`Certificate fetch failed (${res.status})`);
        const text = await res.text();
        if (!text.includes("BEGIN CERTIFICATE")) {
            throw new Error("Certificate file does not contain a PEM certificate");
        }
        return text;
    });

    // Per-call signing — must match the Convex action's algorithm (RSA-SHA512).
    qz.security.setSignatureAlgorithm("SHA512");
    qz.security.setSignaturePromise(async (toSign: string) => signMessage(toSign));

    initialized = true;
    console.log("[QZ] initialized (signed mode)");
}

export async function connectQz(): Promise<void> {
    const qz = await loadQz();
    if (qz.websocket.isActive()) return;
    // Force insecure WS (port 8182) — avoids the browser rejecting QZ Tray's
    // self-signed TLS cert on the WSS handshake. Fine on http://localhost.
    // For https:// production deploys we'll need to provision a proper WSS cert.
    await qz.websocket.connect({ usingSecure: false });
}

export async function disconnectQz(): Promise<void> {
    if (!qzModule) return;
    if (!qzModule.websocket.isActive()) return;
    await qzModule.websocket.disconnect();
}

export async function listQzPrinters(): Promise<string[]> {
    const qz = await loadQz();
    await connectQz();
    const result = await qz.printers.find();
    return Array.isArray(result) ? result : [result];
}

export async function printRaw(printerName: string, base64Bytes: string): Promise<void> {
    const qz = await loadQz();
    await connectQz();
    const config = qz.configs.create(printerName);
    await qz.print(config, [{ type: "raw", format: "base64", data: base64Bytes }]);
}

export async function isQzConnected(): Promise<boolean> {
    if (!qzModule) return false;
    return qzModule.websocket.isActive();
}
