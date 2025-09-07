"use client";
// components/auth/AuthProvider.tsx
// Contexte d'auth Firebase + lecture des custom claims pour Admin/Manager/Courier.
// Hypothèse: lib/firebase.ts exporte { auth } (Client SDK)

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  User,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  getIdTokenResult,
} from 'firebase/auth';

export type AppRole = 'admin' | 'manager' | 'courier';

export type AppClaims = {
  admin?: boolean;
  role?: AppRole;
  rid?: string;
  courierId?: string;
};

type AuthContextType = {
  user: User | null;
  claims: AppClaims | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  hasRole: (role: AppRole, opts?: { rid?: string }) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<AppClaims | null>(null);
  const [loading, setLoading] = useState(true);

  // Écoute l'état d'auth et recharge les custom claims
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setClaims(null);
        setLoading(false);
        return;
      }
      try {
        const token = await getIdTokenResult(u, true);
        const c = token.claims || {};
        const mapped: AppClaims = {
          admin: Boolean(c.admin),
          role: (c.role as AppRole) || undefined,
          rid: (c.rid as string) || undefined,
          courierId: (c.courierId as string) || undefined,
        };
        setClaims(mapped);
      } catch {
        setClaims(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const isAdmin = Boolean(claims?.admin);

  const hasRole = (role: AppRole, opts?: { rid?: string }) => {
    if (isAdmin) return true; // l'admin passe partout
    if (!claims?.role) return false;
    if (claims.role !== role) return false;
    if (opts?.rid) return claims.rid === opts.rid;
    return true;
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, claims, loading, signIn, signOut, isAdmin, hasRole }),
    [user, claims, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pratique
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

/*
Résumé (AuthProvider) :
- Monte un contexte global d’auth.
- Écoute onIdTokenChanged pour rafraîchir l’utilisateur et ses custom claims.
- Expose signIn/signOut, isAdmin et hasRole(role, { rid }).
- Ne protège aucune route ici : c’est le socle pour l’étape suivante.
*/
