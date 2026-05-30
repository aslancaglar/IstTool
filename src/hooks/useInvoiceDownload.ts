"use client";

import { useCallback, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type AuthArgs = { adminToken: string } | { userToken: string };

interface DownloadOptions extends Partial<{ adminToken: string; userToken: string }> {
  orderId: Id<"orders">;
}

export function useInvoiceDownload() {
  const generate = useAction(api.invoices.generateInvoicePdf);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (opts: DownloadOptions & AuthArgs) => {
      setError(null);
      setDownloadingId(opts.orderId);
      try {
        const { base64, filename } = await generate({
          orderId: opts.orderId,
          adminToken: "adminToken" in opts ? opts.adminToken : undefined,
          userToken: "userToken" in opts ? opts.userToken : undefined,
        });

        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e: any) {
        const msg = e?.message ?? "Erreur lors de la génération de la facture";
        setError(msg);
        throw new Error(msg);
      } finally {
        setDownloadingId(null);
      }
    },
    [generate],
  );

  return { download, downloadingId, error };
}
