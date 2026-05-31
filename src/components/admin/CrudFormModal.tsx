import { X } from 'lucide-react';

interface CrudFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal title (e.g. "Modifier la Catégorie"). */
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  /** Submit button label (e.g. "Créer" / "Mettre à jour"). */
  submitLabel: string;
  /** Form field inputs supplied by the page. */
  children: React.ReactNode;
}

/**
 * Shared modal chrome for the simple admin CRUD forms: backdrop, card, header,
 * close button, and the cancel/submit footer. Pages provide only their fields.
 */
export default function CrudFormModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel,
  children,
}: CrudFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
