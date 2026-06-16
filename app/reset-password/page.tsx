"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import AppLoaderWrapper from "../../src/components/AppLoaderWrapper";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = useMutation(api.passwordReset.resetPasswordWithToken);

  useEffect(() => {
    if (!token) {
      setError("Lien de réinitialisation invalide ou manquant.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err: any) {
      const msg = err.message || "Une erreur est survenue lors de la réinitialisation.";
      const cleanMsg = msg.match(/Uncaught Error:\s*([^\n]+)/)?.[1] || msg;
      setError(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLoaderWrapper>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">Nouveau mot de passe</h1>
            <p className="text-gray-500 mt-2">Veuillez entrer votre nouveau mot de passe</p>
          </div>

          {success ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center justify-center border border-green-100 gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-bold text-lg">Mot de passe modifié !</p>
                <p className="text-sm">Votre mot de passe a été réinitialisé avec succès.</p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
              >
                Retour à l'accueil
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    disabled={!token || isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-11 focus:ring-2 focus:ring-red-500 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    disabled={!token || isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-11 focus:ring-2 focus:ring-red-500 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!token || isLoading}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 mt-4"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppLoaderWrapper>
  );
}
