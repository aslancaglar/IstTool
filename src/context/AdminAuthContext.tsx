"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  adminToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
const ADMIN_STORAGE_KEY = 'admin_session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const convex = useConvex();

  useEffect(() => {
    const hydrate = async () => {
      localStorage.removeItem('admin');
      const storedSession = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedSession);
        const sessionToken: string | undefined = parsed?.sessionToken;
        if (!sessionToken) {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        const currentAdmin = await convex.query(api.auth.getCurrentAdmin, { sessionToken });
        if (!currentAdmin) {
          localStorage.removeItem(ADMIN_STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        setAdmin({
          id: currentAdmin.id,
          username: currentAdmin.username,
          role: currentAdmin.role,
        });
        setAdminToken(sessionToken);
      } catch (error) {
        console.error('Failed to restore admin session:', error);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [convex]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await convex.mutation(api.auth.verifyAdmin, { username, password });

      if (result) {
        const adminUser = {
          id: result.id,
          username: result.username,
          role: result.role,
        };
        setAdmin(adminUser);
        setAdminToken(result.sessionToken);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
          admin: adminUser,
          sessionToken: result.sessionToken,
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [convex]);

  const logout = useCallback(async () => {
    if (adminToken) {
      try {
        await convex.mutation(api.auth.logoutAdmin, { sessionToken: adminToken });
      } catch (error) {
        console.error('Failed to revoke admin session:', error);
      }
    }

    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }, [adminToken, convex]);

  // MEMOIZATION: Prevent all components consuming useAdminAuth() from re-rendering just because the parent re-rendered
  const contextValue = useMemo(() => ({
    admin,
    adminToken,
    login,
    logout,
    isLoading
  }), [admin, adminToken, login, logout, isLoading]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
