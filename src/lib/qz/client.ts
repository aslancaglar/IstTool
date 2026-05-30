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

export async function initQz(signMessage: (msg: string) => Promise<string>): Promise<void> {
    if (initialized) return;
    const qz = await loadQz();

    // Async-function form — qz-tray detects AsyncFunction and uses the
    // returned promise directly (skipping its (resolve,reject) wrapper which
    // can silently swallow errors).
    const certHandler = async () => {
        const res = await fetch("/qz-digital-certificate.txt", { cache: "no-store" });
        if (!res.ok) throw new Error(`Certificate fetch failed (${res.status})`);
        const text = await res.text();
        if (!text.includes("BEGIN CERTIFICATE")) {
            throw new Error("Certificate file does not contain a PEM certificate");
        }
        console.log("[QZ] sending certificate to QZ Tray, length =", text.length);
        return text;
    };
    qz.security.setCertificatePromise(certHandler);

    qz.security.setSignatureAlgorithm("SHA512");

    const signFactory = async (toSign: string) => {
        const signature = await signMessage(toSign);
        console.log("[QZ] signed payload, signature length =", signature.length);
        return signature;
    };
    qz.security.setSignaturePromise(signFactory);

    initialized = true;
    console.log("[QZ] initialized");
}

export async function connectQz(): Promise<void> {
    const qz = await loadQz();
    if (qz.websocket.isActive()) return;
    await qz.websocket.connect();
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
