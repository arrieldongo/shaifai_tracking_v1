"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthDebug from "@/components/auth/AuthDebug";

export default function LoginPage() {
  const { signIn, signOut, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
    } catch (e: any) {
      setError(e?.message || "Erreur de connexion");
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Connexion</h1>

      {user ? (
        <div className="space-y-3">
          <div className="text-sm">Connecté comme {user.email}</div>
          <div className="flex gap-2">
            <button onClick={() => signOut()} className="px-3 py-2 bg-slate-800 text-white rounded">Se déconnecter</button>
            <button
              onClick={async () => {
                try {
                  setInfo(null);
                  await user.getIdToken(true); // force refresh claims
                  setInfo('Droits rafraîchis. Recharge la page cible.');
                } catch (e: any) {
                  setInfo(e?.message || 'Impossible de rafraîchir les droits');
                }
              }}
              className="px-3 py-2 bg-black text-white rounded"
            >
              Rafraîchir droits
            </button>
          </div>
          {info && <div className="text-xs text-slate-600">{info}</div>}
        </div>
      ) : (
        <form onSubmit={onLogin} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="border rounded p-2 w-full" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mot de passe" type="password" className="border rounded p-2 w-full" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="px-3 py-2 bg-black text-white rounded w-full">Se connecter</button>
        </form>
      )}

      <div>
        <h2 className="font-semibold mb-2">Debug session</h2>
        <AuthDebug />
      </div>
    </main>
  );
}
