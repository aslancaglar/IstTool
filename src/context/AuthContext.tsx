"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    street?: string;
    city?: string;
    zipCode?: string;
}

interface AuthContextType {
    user: User | null;
    sessionToken: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (data: any) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const convex = useConvex();

    useEffect(() => {
        const hydrate = async () => {
            localStorage.removeItem('user');
            const storedSession = localStorage.getItem(USER_STORAGE_KEY);
            if (!storedSession) {
                setIsLoading(false);
                return;
            }

            try {
                const parsed = JSON.parse(storedSession);
                const storedToken: string | undefined = parsed?.sessionToken;
                if (!storedToken) {
                    localStorage.removeItem(USER_STORAGE_KEY);
                    setIsLoading(false);
                    return;
                }

                const currentUser = await convex.query(api.auth.getCurrentUser, { sessionToken: storedToken });
                if (!currentUser) {
                    localStorage.removeItem(USER_STORAGE_KEY);
                    setIsLoading(false);
                    return;
                }

                setUser({
                    id: currentUser.id,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    email: currentUser.email,
                    phone: currentUser.phone,
                    street: currentUser.street,
                    city: currentUser.city,
                    zipCode: currentUser.zipCode,
                });
                setSessionToken(storedToken);
            } catch (error) {
                console.error('Failed to restore user session:', error);
                localStorage.removeItem(USER_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        hydrate();
    }, [convex]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await convex.mutation(api.auth.verifyUser, { email, password });
            if (result) {
                const userSession: User = {
                    id: result.id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: result.phone,
                    street: result.street,
                    city: result.city,
                    zipCode: result.zipCode
                };
                setUser(userSession);
                setSessionToken(result.sessionToken);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
                    user: userSession,
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

    const signup = useCallback(async (data: any): Promise<boolean> => {
        try {
            const result = await convex.mutation(api.auth.signupUser, data);
            if (result) {
                // Auto login after signup
                const userSession: User = {
                    id: result.id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: data.phone,
                    street: result.street,
                    city: result.city,
                    zipCode: result.zipCode
                };
                setUser(userSession);
                setSessionToken(result.sessionToken);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
                    user: userSession,
                    sessionToken: result.sessionToken,
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }, [convex]);

    const logout = useCallback(async () => {
        if (sessionToken) {
            try {
                await convex.mutation(api.auth.logoutUser, { sessionToken });
            } catch (error) {
                console.error('Failed to revoke user session:', error);
            }
        }

        setUser(null);
        setSessionToken(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        window.location.href = '/'; // Native browser redirect for full cleanup support
    }, [sessionToken, convex]);

    const updateUser = useCallback((data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
                user: updatedUser,
                sessionToken,
            }));
        }
    }, [user, sessionToken]);

    // MEMOIZATION: Prevent all components consuming useAuth() from re-rendering just because the parent re-rendered
    const contextValue = useMemo(() => ({
        user,
        sessionToken,
        login,
        signup,
        logout,
        updateUser,
        isLoading
    }), [user, sessionToken, login, signup, logout, updateUser, isLoading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
