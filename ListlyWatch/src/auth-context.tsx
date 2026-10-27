import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthSession, clearAuthSession, loadAuthSession, onAuthSessionCleared, saveAuthSession } from './auth-storage';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  saveSession: (session: AuthSession) => Promise<void>;
  activateSession: (session: AuthSession) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let sessionWasCleared = false;
    const unsubscribe = onAuthSessionCleared(() => {
      sessionWasCleared = true;
      setSession(null);
    });
    loadAuthSession()
      .then(storedSession => {
        if (mounted && !sessionWasCleared) setSession(storedSession);
      })
      .catch(loadError => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudo recuperar la sesión.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const saveSession = async (nextSession: AuthSession) => {
    await saveAuthSession(nextSession);
  };

  const activateSession = (nextSession: AuthSession) => {
    setSession(nextSession);
    setError(null);
  };

  const signOut = async () => {
    await clearAuthSession();
    setSession(null);
  };

  const value = useMemo(() => ({
    session,
    isLoading,
    error,
    saveSession,
    activateSession,
    signOut,
  }), [session, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
