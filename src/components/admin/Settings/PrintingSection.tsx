"use client";

import { useState, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { Loader2, Printer, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

interface PrinterOption {
  id: number;
  name: string;
  state: string;
}

interface PrintingSectionProps {
  adminToken: string | null;
  printingEnabled: boolean;
  printNodeApiKey: string;
  printerPickupId: number | undefined;
  printerDeliveryId: number | undefined;
  onPrintingEnabledChange: (v: boolean) => void;
  onApiKeyChange: (v: string) => void;
  onPickupPrinterChange: (id: number | undefined) => void;
  onDeliveryPrinterChange: (id: number | undefined) => void;
}

export default function PrintingSection({
  adminToken,
  printingEnabled,
  printNodeApiKey,
  printerPickupId,
  printerDeliveryId,
  onPrintingEnabledChange,
  onApiKeyChange,
  onPickupPrinterChange,
  onDeliveryPrinterChange,
}: PrintingSectionProps) {
  const listPrintersAction = useAction(api.printing.listPrinters);
  const [printers, setPrinters] = useState<PrinterOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didAutoFetch = useRef(false);

  // Auto-fetch printers on mount when a saved API key exists
  useEffect(() => {
    if (didAutoFetch.current || !adminToken || !printNodeApiKey) return;
    didAutoFetch.current = true;
    setIsLoading(true);
    listPrintersAction({ adminToken, apiKey: printNodeApiKey })
      .then((result) => {
        setPrinters(result.printers);
        if (result.error) setError(result.error);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [adminToken, printNodeApiKey, listPrintersAction]);

  const handleTest = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listPrintersAction({ adminToken, apiKey: printNodeApiKey });
      setPrinters(result.printers);
      if (result.error) {
        setError(result.error);
      } else if (result.printers.length === 0) {
        setError("Aucune imprimante détectée. Vérifiez que le client PrintNode est en ligne.");
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion à PrintNode.');
      setPrinters(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-900">Activer l'impression automatique</h3>
          <p className="text-sm text-slate-500">Imprime un reçu à chaque nouvelle commande confirmée.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={printingEnabled}
            onChange={(e) => onPrintingEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Clé API PrintNode
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={printNodeApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Votre clé API"
            autoComplete="off"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={isLoading || !printNodeApiKey || !adminToken}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Tester
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Entrez votre clé API PrintNode puis cliquez sur Tester pour vérifier la connexion.
        </p>
      </div>

      {/* Status */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {printers && printers.length > 0 && !error && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>{printers.length} imprimante(s) détectée(s).</span>
        </div>
      )}

      {/* Printer assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PrinterSelect
          label="Imprimante — À EMPORTER"
          value={printerPickupId}
          onChange={onPickupPrinterChange}
          printers={printers}
        />
        <PrinterSelect
          label="Imprimante — LIVRAISON"
          value={printerDeliveryId}
          onChange={onDeliveryPrinterChange}
          printers={printers}
        />
      </div>
    </div>
  );
}

function PrinterSelect({
  label,
  value,
  onChange,
  printers,
}: {
  label: string;
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  printers: PrinterOption[] | null;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">— Aucune —</option>
        {value != null && !printers?.some((p) => p.id === value) && (
          <option value={value}>{`Imprimante #${value} (non détectée)`}</option>
        )}
        {(printers ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {p.state !== 'online' ? `[${p.state}]` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
