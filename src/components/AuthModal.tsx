"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, UserPlus, LogIn, User, Phone, MapPin, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Convex wraps thrown server errors as
 * "[CONVEX M(...)] [Request ID: ...] Server Error\nUncaught Error: <message>\n  at handler ...".
 * Pull out the clean, user-facing message the server threw.
 */
function extractServerErrorMessage(err: unknown): string {
  const raw = (err as { message?: string })?.message ?? "";
  const match = raw.match(/Uncaught Error:\s*([^\n]+)/);
  return (match?.[1] ?? "").trim();
}

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

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const requestPasswordReset = useAction(api.passwordReset.requestPasswordReset);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMessage("");
      setIsLoading(false);
    }
  }, [isOpen, mode]);

  const close = () => {
    setError("");
    setSuccessMessage("");
    closeAuthModal();
  };

  const handleForgotPasswordSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await requestPasswordReset({ email: forgotPasswordEmail });
      setSuccessMessage("Si un compte existe avec cette adresse, un email de réinitialisation vous a été envoyé.");
      setForgotPasswordEmail("");
    } catch (err: unknown) {
      setError(extractServerErrorMessage(err) || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
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
    } catch (err: unknown) {
      // Surface real server errors (e.g. rate limiting); fall back to generic.
      setError(extractServerErrorMessage(err) || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
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
    } catch (err: unknown) {
      const serverMsg = extractServerErrorMessage(err);
      const lower = serverMsg.toLowerCase();
      if (lower.includes("already exists") || lower.includes("email already") || lower.includes("existe déjà")) {
        setError("Un compte existe déjà avec cette adresse email. Veuillez vous connecter.");
      } else if (serverMsg) {
        // Server validation messages are already user-facing French
        // (e.g. "Le mot de passe doit contenir au moins 8 caractères.").
        setError(serverMsg);
      } else {
        setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <>
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
              {mode === "login" ? "Connexion" : mode === "signup" ? "Inscription" : "Mot de passe oublié"}
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
          {mode === "forgot_password" ? (
            <div className="space-y-4">
              {successMessage ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-start gap-3 border border-green-100">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{successMessage}</p>
                </div>
              ) : (
                <form 
                  autoComplete="on" 
                  className="space-y-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.currentTarget.reportValidity()) handleForgotPasswordSubmit(e);
                    }
                  }}
                >
                  <p className="text-gray-600 text-sm mb-4">
                    Entrez votre adresse email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="text-sm font-bold text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="forgot-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-11 focus:ring-2 focus:ring-red-500 text-gray-900"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      if (form && form.reportValidity()) handleForgotPasswordSubmit(e);
                    }}
                    disabled={isLoading}
                    className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Envoi..." : "Envoyer le lien"}
                    <KeyRound className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          ) : mode === "login" ? (
            <form 
              autoComplete="on" 
              className="space-y-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.currentTarget.reportValidity()) handleLoginSubmit(e);
                }
              }}
            >
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot_password")}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form');
                  if (form && form.reportValidity()) handleLoginSubmit(e);
                }}
                disabled={isLoading}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
                <LogIn className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form 
              autoComplete="on" 
              className="space-y-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.currentTarget.reportValidity()) handleSignupSubmit(e);
                }
              }}
            >
              <div className="space-y-2">
                <label htmlFor="signup-firstName" className="text-sm font-bold text-gray-700">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="signup-firstName"
                    type="text"
                    name="firstName"
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
                    name="lastName"
                    autoComplete="family-name"
                    required
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl p-3 pl-10 focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                    placeholder="Dupont"
                  />
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
                    autoComplete="username"
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

              <button
                type="button"
                onClick={(e) => {
                  const form = e.currentTarget.closest('form');
                  if (form && form.reportValidity()) handleSignupSubmit(e);
                }}
                disabled={isLoading}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Création..." : "Créer mon compte"}
                <UserPlus className="w-5 h-5" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center flex flex-col gap-3">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="inline-flex items-center justify-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Créer un compte
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : mode === "signup" ? (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="inline-flex items-center justify-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                J'ai déjà un compte
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="inline-flex items-center justify-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Retour à la connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

      {error && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer le message d'erreur"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setError("")}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-900 mb-2">Erreur</h3>
            <p className="text-sm text-gray-600 mb-6 break-words leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors shadow-md active:scale-95"
            >
              D'accord
            </button>
          </div>
        </div>
      )}
    </>
  );
}
