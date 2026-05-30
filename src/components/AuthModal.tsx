"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, UserPlus, LogIn, User, Phone, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export default function AuthModal() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const {
    isOpen,
    mode,
    redirectPath,
    setMode,
    closeAuthModal,
  } = useAuthModal();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsLoading(false);
    }
  }, [isOpen, mode]);

  const close = () => {
    setError("");
    closeAuthModal();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(loginForm.email, loginForm.password);
      if (!success) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      close();
      router.push(redirectPath);
    } catch {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = signupForm;
      await signup(signupData);
      close();
      router.push(redirectPath);
    } catch (err: any) {
      const raw: string = err?.message ?? "";
      if (raw.toLowerCase().includes("already exists") || raw.toLowerCase().includes("email already")) {
        setError("Un compte existe déjà avec cette adresse email. Veuillez vous connecter.");
      } else if (raw.toLowerCase().includes("password")) {
        setError("Le mot de passe ne respecte pas les exigences de sécurité.");
      } else if (raw.toLowerCase().includes("invalid email")) {
        setError("L'adresse email n'est pas valide.");
      } else {
        setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer la fenêtre d'authentification"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-gray-900">
              {mode === "login" ? "Connexion" : "Inscription"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} autoComplete="on" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-bold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-11 focus:ring-2 focus:ring-red-500 text-gray-900"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-bold text-gray-700">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-11 focus:ring-2 focus:ring-red-500 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium flex items-start gap-2">
                  <span className="mt-0.5 text-red-500 flex-shrink-0">⚠</span>
                  <span className="break-words min-w-0">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
                <LogIn className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} autoComplete="on" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="signup-firstName" className="text-sm font-bold text-gray-700">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="signup-firstName"
                      type="text"
                      name="given-name"
                      autoComplete="given-name"
                      required
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="Jean"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-lastName" className="text-sm font-bold text-gray-700">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="signup-lastName"
                      type="text"
                      name="family-name"
                      autoComplete="family-name"
                      required
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-bold text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-phone" className="text-sm font-bold text-gray-700">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="signup-phone"
                    type="tel"
                    name="tel"
                    autoComplete="tel"
                    required
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Adresse
                </p>
                <div className="relative">
                  <input
                    id="signup-street"
                    type="text"
                    name="street-address"
                    autoComplete="street-address"
                    required
                    value={signupForm.street}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, street: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                    placeholder="Numéro et nom de rue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      id="signup-city"
                      type="text"
                      name="address-level2"
                      autoComplete="address-level2"
                      required
                      value={signupForm.city}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="Ville"
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="signup-zipCode"
                      type="text"
                      name="postal-code"
                      autoComplete="postal-code"
                      required
                      value={signupForm.zipCode}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="Code Postal"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Hidden field to help password managers associate the email with the password */}
                <input type="email" name="username" autoComplete="username" value={signupForm.email} readOnly className="hidden" />
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-bold text-gray-700">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="signup-password"
                      type="password"
                      name="new-password"
                      autoComplete="new-password"
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-confirmPassword" className="text-sm font-bold text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="signup-confirmPassword"
                      type="password"
                      name="confirm-password"
                      autoComplete="new-password"
                      required
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium flex items-start gap-2">
                  <span className="mt-0.5 text-red-500 flex-shrink-0">⚠</span>
                  <span className="break-words min-w-0">{error}</span>
                </div>
              )}


              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Création..." : "Créer mon compte"}
                <UserPlus className="w-5 h-5" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="inline-flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Créer un compte
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="inline-flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                J'ai déjà un compte
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
