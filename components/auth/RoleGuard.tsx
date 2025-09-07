"use client";
// components/auth/RoleGuard.tsx
// Garde d'affichage basée sur les claims (admin passe partout)

import React from 'react';
import { AppRole, useAuth } from './AuthProvider';

type Props = {
  require?: AppRole | 'admin' | Array<AppRole | 'admin'>;
  ridMatch?: string; // si on veut restreindre à un resto précis
  fallback?: React.ReactNode; // affiché si non autorisé
  loadingFallback?: React.ReactNode; // affiché pendant le chargement
  children: React.ReactNode;
};

export const RoleGuard: React.FC<Props> = ({
  require,
  ridMatch,
  fallback = null,
  loadingFallback = <div className="p-4 text-sm text-gray-500">Chargement…</div>,
  children,
}) => {
  const { loading, isAdmin, hasRole, claims } = useAuth();

  if (loading) return <>{loadingFallback}</>;

  // Admin => accès total
  if (isAdmin) return <>{children}</>;

  if (!require) return <>{children}</>; // aucune contrainte

  // Autoriser si tableau de rôles
  if (Array.isArray(require)) {
    const okSome = require.some((r) => (r === 'admin' ? isAdmin : hasRole(r, { rid: ridMatch })));
    return <>{okSome ? children : fallback}</>;
  }

  if (require === 'admin') {
    return <>{fallback}</>;
  }

  const ok = hasRole(require, { rid: ridMatch });
  return <>{ok ? children : fallback}</>;
};

/*
Résumé (RoleGuard) :
- Affiche children si l’utilisateur correspond au rôle requis (ou admin).
- Option ridMatch pour restreindre à un restaurant donné.
- Sert de brique d’affichage ; en étape 2 on l’emploiera pour protéger /admin, /manager, /courier.
*/
