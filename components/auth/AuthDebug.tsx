// components/auth/AuthDebug.tsx
import React from 'react';
import { useAuth } from './AuthProvider';

export default function AuthDebug() {
  const { user, claims, loading, isAdmin } = useAuth();
  if (loading) return null;
  return (
    <pre className="text-xs bg-gray-100 p-3 rounded-xl overflow-x-auto">
      {JSON.stringify(
        {
          uid: user?.uid || null,
          email: user?.email || null,
          isAdmin,
          claims,
        },
        null,
        2
      )}
    </pre>
  );
}

/*
Résumé (AuthDebug) :
- Affiche les infos de session/claims pour contrôle visuel rapide.
- À retirer ensuite en prod.
*/
