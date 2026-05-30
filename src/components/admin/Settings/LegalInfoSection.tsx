"use client";

export interface LegalInfoData {
  legalName: string;
  legalForm: string;
  siret: string;
  rcsCity: string;
  rcsNumber: string;
  shareCapital: number | undefined;
  tvaIntraNumber: string;
  legalAddress: string;
  invoicePrefix: string;
}

interface LegalInfoSectionProps {
  data: LegalInfoData;
  onChange: (next: LegalInfoData) => void;
}

const LEGAL_FORMS = ["EI", "EURL", "SARL", "SAS", "SASU", "SA", "SNC", "Autre"];

export default function LegalInfoSection({ data, onChange }: LegalInfoSectionProps) {
  const update = <K extends keyof LegalInfoData>(field: K, value: LegalInfoData[K]) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Ces informations apparaissent obligatoirement sur les factures émises (art. L441-9 du Code de commerce).
        Sans elles, le bouton de téléchargement reste désactivé.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Raison sociale *</label>
          <input
            type="text"
            value={data.legalName}
            onChange={(e) => update("legalName", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Mondo Pizza SARL"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Forme juridique</label>
          <select
            value={data.legalForm}
            onChange={(e) => update("legalForm", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">—</option>
            {LEGAL_FORMS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Capital social (€)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={data.shareCapital ?? ""}
            onChange={(e) => update("shareCapital", e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="10000"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adresse du siège social *</label>
          <input
            type="text"
            value={data.legalAddress}
            onChange={(e) => update("legalAddress", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="12 rue du Commerce, 75015 Paris"
          />
          <p className="text-xs text-slate-400 mt-1">Si vide, l&apos;adresse du restaurant est utilisée.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">SIRET *</label>
          <input
            type="text"
            value={data.siret}
            onChange={(e) => update("siret", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="12345678900012"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">N° TVA intracommunautaire *</label>
          <input
            type="text"
            value={data.tvaIntraNumber}
            onChange={(e) => update("tvaIntraNumber", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="FR12345678900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ville du RCS</label>
          <input
            type="text"
            value={data.rcsCity}
            onChange={(e) => update("rcsCity", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Paris"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">N° RCS</label>
          <input
            type="text"
            value={data.rcsNumber}
            onChange={(e) => update("rcsNumber", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="123 456 789"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Préfixe des numéros de facture</label>
          <input
            type="text"
            value={data.invoicePrefix}
            onChange={(e) => update("invoicePrefix", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="F{YYYY}-"
          />
          <p className="text-xs text-slate-400 mt-1">
            <code>{"{YYYY}"}</code> est remplacé par l&apos;année. Le compteur reprend à 1 chaque année. Exemple : <code>F2026-000001</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
