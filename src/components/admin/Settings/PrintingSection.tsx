"use client";

import { useState, useRef, useEffect } from 'react';
import { useAction, useConvex } from 'convex/react';
import { Loader2, Printer, RefreshCw, CheckCircle2, AlertCircle, Cloud, Wifi, WifiOff } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { useQzPrinter } from '../../../hooks/useQzPrinter';

interface PrinterOption {
  id: number;
  name: string;
  state: string;
}

type Provider = 'printnode' | 'qz';

interface PrintingSectionProps {
  adminToken: string | null;
  printingEnabled: boolean;
  printingProvider: Provider;
  printNodeApiKey: string;
  printerPickupId: number | undefined;
  printerDeliveryId: number | undefined;
  qzPrinterPickupName: string | undefined;
  qzPrinterDeliveryName: string | undefined;
  onPrintingEnabledChange: (v: boolean) => void;
  onProviderChange: (p: Provider) => void;
  onApiKeyChange: (v: string) => void;
  onPickupPrinterChange: (id: number | undefined) => void;
  onDeliveryPrinterChange: (id: number | undefined) => void;
  onQzPickupPrinterChange: (name: string | undefined) => void;
  onQzDeliveryPrinterChange: (name: string | undefined) => void;
}

export default function PrintingSection(props: PrintingSectionProps) {
  const {
    adminToken,
    printingEnabled,
    printingProvider,
    onPrintingEnabledChange,
    onProviderChange,
  } = props;

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

      {/* Provider selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fournisseur d'impression</label>
        <div className="grid grid-cols-2 gap-2">
          <ProviderTile
            active={printingProvider === 'printnode'}
            icon={<Cloud className="w-4 h-4" />}
            title="PrintNode"
            sub="Cloud (abonnement)"
            onClick={() => onProviderChange('printnode')}
          />
          <ProviderTile
            active={printingProvider === 'qz'}
            icon={<Wifi className="w-4 h-4" />}
            title="QZ Tray"
            sub="Local (websocket)"
            onClick={() => onProviderChange('qz')}
          />
        </div>
      </div>

      {printingProvider === 'printnode' ? (
        <PrintNodeSection {...props} adminToken={adminToken} />
      ) : (
        <QzTraySection {...props} adminToken={adminToken} />
      )}
    </div>
  );
}

function ProviderTile({
  active, icon, title, sub, onClick,
}: { active: boolean; icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border text-left transition ${
        active
          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
          : 'border-slate-200 bg-white hover:border-slate-300 opacity-60'
      }`}
    >
      {active && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white rounded">
          Actif
        </span>
      )}
      <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
        {icon}
        {title}
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </button>
  );
}

// ─── PrintNode (existing flow) ──────────────────────────────────────

function PrintNodeSection({
  adminToken, printNodeApiKey, printerPickupId, printerDeliveryId,
  onApiKeyChange, onPickupPrinterChange, onDeliveryPrinterChange,
}: PrintingSectionProps) {
  const listPrintersAction = useAction(api.printing.listPrinters);
  const [printers, setPrinters] = useState<PrinterOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didAutoFetch = useRef(false);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PrintNodePrinterSelect
          label="Imprimante — À EMPORTER"
          value={printerPickupId}
          onChange={onPickupPrinterChange}
          printers={printers}
        />
        <PrintNodePrinterSelect
          label="Imprimante — LIVRAISON"
          value={printerDeliveryId}
          onChange={onDeliveryPrinterChange}
          printers={printers}
        />
      </div>
    </div>
  );
}

function PrintNodePrinterSelect({
  label, value, onChange, printers,
}: {
  label: string;
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  printers: PrinterOption[] | null;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
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

// ─── QZ Tray ────────────────────────────────────────────────────────

function QzTraySection({
  adminToken, qzPrinterPickupName, qzPrinterDeliveryName,
  onQzPickupPrinterChange, onQzDeliveryPrinterChange,
}: PrintingSectionProps) {
  const convex = useConvex();
  const qz = useQzPrinter(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'printing' | 'done' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const handleTest = async (target: 'pickup' | 'delivery') => {
    if (!adminToken) return;
    setTestStatus('printing');
    setTestError(null);
    try {
      const payload = await convex.query(api.printing.getTestReceiptPayload, { adminToken, target });
      if (!payload?.printerName) {
        throw new Error(`Aucune imprimante ${target === 'delivery' ? 'livraison' : 'emporter'} sélectionnée.`);
      }
      await qz.print(payload.printerName, payload.base64);
      setTestStatus('done');
    } catch (e: any) {
      setTestError(e?.message ?? String(e));
      setTestStatus('error');
    }
  };

  const statusPill = (() => {
    if (qz.status === 'connected') return { Icon: Wifi, text: 'Connecté à QZ Tray', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    if (qz.status === 'connecting') return { Icon: Loader2, text: 'Connexion en cours…', cls: 'bg-amber-50 text-amber-700 border-amber-100', spin: true };
    if (qz.status === 'error') return { Icon: WifiOff, text: `Erreur : ${qz.error ?? 'inconnue'}`, cls: 'bg-red-50 text-red-700 border-red-100' };
    return { Icon: WifiOff, text: 'Déconnecté', cls: 'bg-slate-50 text-slate-600 border-slate-100' };
  })();

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-sm font-semibold ${statusPill.cls}`}>
        <div className="flex items-center gap-2">
          <statusPill.Icon className={`w-4 h-4 ${statusPill.spin ? 'animate-spin' : ''}`} />
          <span>{statusPill.text}</span>
        </div>
        <button
          type="button"
          onClick={() => qz.refreshPrinters()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rafraîchir
        </button>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
        <p className="font-bold">Installation requise</p>
        <p>QZ Tray doit être installé et démarré sur cet ordinateur (téléchargement : qz.io). Le certificat <code className="bg-white px-1 rounded">override.crt</code> doit être copié dans le dossier d'installation de QZ Tray pour supprimer l'invite de sécurité.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QzPrinterSelect
          label="Imprimante — À EMPORTER"
          value={qzPrinterPickupName}
          onChange={onQzPickupPrinterChange}
          printers={qz.printers}
          onTest={() => handleTest('pickup')}
          testStatus={testStatus}
        />
        <QzPrinterSelect
          label="Imprimante — LIVRAISON"
          value={qzPrinterDeliveryName}
          onChange={onQzDeliveryPrinterChange}
          printers={qz.printers}
          onTest={() => handleTest('delivery')}
          testStatus={testStatus}
        />
      </div>

      {testError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{testError}</span>
        </div>
      )}
      {testStatus === 'done' && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>Impression de test envoyée.</span>
        </div>
      )}
    </div>
  );
}

function QzPrinterSelect({
  label, value, onChange, printers, onTest, testStatus,
}: {
  label: string;
  value: string | undefined;
  onChange: (name: string | undefined) => void;
  printers: string[];
  onTest: () => void;
  testStatus: 'idle' | 'printing' | 'done' | 'error';
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">— Aucune —</option>
          {value && !printers.includes(value) && (
            <option value={value}>{`${value} (non détectée)`}</option>
          )}
          {printers.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onTest}
          disabled={!value || testStatus === 'printing'}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-40"
        >
          {testStatus === 'printing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
          Test
        </button>
      </div>
    </div>
  );
}
