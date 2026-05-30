#!/usr/bin/env node
// MondoPizza standalone print-agent.
// Runs in the background on the shop machine. Subscribes to Convex for
// pending+unprinted orders and sends receipts to QZ Tray over the local
// websocket. No browser required.
//
// Required env vars:
//   CONVEX_URL              — your Convex deployment URL (e.g. https://abc-xyz.convex.cloud)
//   PRINT_AGENT_TOKEN       — shared secret matching Convex env var PRINT_AGENT_TOKEN
//   QZ_PRIVATE_KEY_PATH     — absolute path to private-key.pem
//   QZ_CERT_PATH            — absolute path to digital-certificate.txt (public cert)
//
// Optional env vars:
//   QZ_HOST                 — default "localhost"
//   QZ_USE_SECURE           — "1" to use WSS (port 8181); otherwise WS (8182)
//   POLL_BACKOFF_MS         — ms to wait before retrying a failed QZ connection (default 5000)

import fs from "node:fs";
import crypto from "node:crypto";
import qz from "qz-tray";
import WebSocket from "ws";
import { ConvexClient } from "convex/browser";

const {
  CONVEX_URL,
  PRINT_AGENT_TOKEN,
  QZ_PRIVATE_KEY_PATH,
  QZ_CERT_PATH,
  QZ_USE_SECURE,
  POLL_BACKOFF_MS = "5000",
} = process.env;

if (!CONVEX_URL || !PRINT_AGENT_TOKEN || !QZ_PRIVATE_KEY_PATH || !QZ_CERT_PATH) {
  console.error("[print-agent] Missing required env var. Need CONVEX_URL, PRINT_AGENT_TOKEN, QZ_PRIVATE_KEY_PATH, QZ_CERT_PATH.");
  process.exit(1);
}

const privateKey = fs.readFileSync(QZ_PRIVATE_KEY_PATH, "utf8");
const publicCert = fs.readFileSync(QZ_CERT_PATH, "utf8");
const backoffMs = Number.parseInt(POLL_BACKOFF_MS, 10) || 5000;

// ── QZ Tray setup ────────────────────────────────────────────────────
// qz-tray is browser-first; in Node we have to inject the WebSocket impl.
qz.api.setWebSocketType(WebSocket);

qz.security.setCertificatePromise(async () => publicCert);

qz.security.setSignatureAlgorithm("SHA512");
qz.security.setSignaturePromise(async (toSign) => {
  const signer = crypto.createSign("RSA-SHA512");
  signer.update(toSign);
  signer.end();
  return signer.sign(privateKey, "base64");
});

async function ensureQzConnected() {
  if (qz.websocket.isActive()) return;
  await qz.websocket.connect({ usingSecure: QZ_USE_SECURE === "1" });
  console.log("[print-agent] connected to QZ Tray");
}

// ── Print queue ──────────────────────────────────────────────────────
// Serialize prints — never overlap a print with another.
let queue = Promise.resolve();
const inFlight = new Set();

async function printOrder(client, orderId) {
  if (inFlight.has(orderId)) return;
  inFlight.add(orderId);
  try {
    const claim = await client.mutation("printAgent:claim", {
      agentToken: PRINT_AGENT_TOKEN,
      orderId,
    });
    if (!claim.claimed) return;

    const payload = await client.query("printAgent:getPayload", {
      agentToken: PRINT_AGENT_TOKEN,
      orderId,
    });
    if (!payload || !payload.printerName) {
      console.warn(`[print-agent] order ${orderId}: no printer configured for its order type`);
      return;
    }

    await retryWithBackoff(async () => {
      await ensureQzConnected();
      const config = qz.configs.create(payload.printerName);
      await qz.print(config, [{ type: "raw", format: "base64", data: payload.base64 }]);
    });

    console.log(`[print-agent] printed order ${orderId} on ${payload.printerName}`);
  } catch (err) {
    console.error(`[print-agent] failed to print order ${orderId}:`, err);
  } finally {
    inFlight.delete(orderId);
  }
}

async function retryWithBackoff(fn, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`[print-agent] attempt ${i + 1}/${attempts} failed:`, err?.message ?? err);
      // Drop the dead QZ socket so the next attempt re-handshakes.
      try { await qz.websocket.disconnect(); } catch { /* ignore */ }
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  throw lastErr;
}

// ── Convex subscription ──────────────────────────────────────────────
const client = new ConvexClient(CONVEX_URL);

client.onUpdate(
  "printAgent:listUnprintedOrders",
  { agentToken: PRINT_AGENT_TOKEN },
  (orderIds) => {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return;
    for (const id of orderIds) {
      queue = queue.then(() => printOrder(client, id));
    }
  },
  (err) => {
    console.error("[print-agent] Convex subscription error:", err);
  },
);

console.log(`[print-agent] started; watching ${CONVEX_URL}`);

// ── Graceful shutdown ────────────────────────────────────────────────
async function shutdown() {
  console.log("[print-agent] shutting down");
  try { await qz.websocket.disconnect(); } catch { /* ignore */ }
  try { await client.close(); } catch { /* ignore */ }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
