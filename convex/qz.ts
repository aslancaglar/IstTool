"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "node:crypto";

// QZ Tray asks the page to sign every websocket message with our private key.
// The page calls this action with the message; we sign and return base64.
// Requires Convex env var QZ_PRIVATE_KEY (PEM-formatted RSA private key).
export const signMessage = action({
  args: { message: v.string() },
  handler: async (_ctx, { message }) => {
    const privateKey = process.env.QZ_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("QZ_PRIVATE_KEY not configured in Convex env");
    }
    const signer = crypto.createSign("RSA-SHA512");
    signer.update(message);
    signer.end();
    return signer.sign(privateKey, "base64");
  },
});
