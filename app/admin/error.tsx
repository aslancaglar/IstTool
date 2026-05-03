"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur Admin</h2>
        <p className="text-slate-500 mb-6">{error.message || "Une erreur est survenue dans le panel admin."}</p>
        <button
          onClick={reset}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
