"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import crypto from "node:crypto";

// QZ Tray asks the page to sign every websocket message with our private key.
// The page calls this action with the message; we sign and return base64.
// Requires Convex env var QZ_PRIVATE_KEY (PEM-formatted RSA private key).
//
// Gated behind a valid admin session: without this check the action is a public
// signing oracle for the QZ private key. Printing is an admin-only surface, so
// requiring an admin token here is safe.
export const signMessage = action({
  args: { message: v.string(), adminToken: v.string() },
  handler: async (ctx, { message, adminToken }) => {
    const admin = await ctx.runQuery(api.auth.getCurrentAdmin, { sessionToken: adminToken });
    if (!admin) {
      throw new Error("Unauthorized");
    }

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
