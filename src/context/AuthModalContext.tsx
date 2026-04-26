"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthModalMode = "login" | "signup";

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthModalMode;
  redirectPath: string;
  openAuthModal: (mode: AuthModalMode, redirectPath?: string) => void;
  openLoginModal: (redirectPath?: string) => void;
  openSignupModal: (redirectPath?: string) => void;
  setMode: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

function normalizeRedirectPath(path?: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>("login");
  const [redirectPath, setRedirectPath] = useState("/");

  const openAuthModal = useCallback((nextMode: AuthModalMode, nextRedirectPath?: string) => {
    setMode(nextMode);
    setRedirectPath(normalizeRedirectPath(nextRedirectPath));
    setIsOpen(true);
  }, []);

  const openLoginModal = useCallback((nextRedirectPath?: string) => {
    openAuthModal("login", nextRedirectPath);
  }, [openAuthModal]);

  const openSignupModal = useCallback((nextRedirectPath?: string) => {
    openAuthModal("signup", nextRedirectPath);
  }, [openAuthModal]);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      redirectPath,
      openAuthModal,
      openLoginModal,
      openSignupModal,
      setMode,
      closeAuthModal,
    }),
    [isOpen, mode, redirectPath, openAuthModal, openLoginModal, openSignupModal, closeAuthModal],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
