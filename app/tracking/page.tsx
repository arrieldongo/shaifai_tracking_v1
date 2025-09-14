
"use client";

import SmoothScrollLink from "@/components/SmoothScrollLink";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useState } from "react";
import { notifyError } from "@/lib/notify";

export default function TrackingHubPage() {
  const { user, signIn, signOut, claims } = useAuth();
  const rid = (claims?.rid as string) || undefined;
  const role = (claims?.role as string) || undefined;
  const { restaurant } = useRestaurant(rid);

  // Login state (section 3)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goOrWarn = (href: string) => {
    if (!user) {
      notifyError("Veuillez vous connecter pour accéder à cet espace.");
      return;
    }
    window.location.href = href;
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try { setSubmitting(true); await signIn(email, password); } finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-screen">
      {/* ===== Section 1: Accueil (full screen) ===== */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div>
          <p className="-m-1.5 text-xl md:text-2xl text-gray-300 font-extrabold tracking-tighter whitespace-nowrap">
            Bienvenue chez
          </p>
          <span
            className="text-8xl leading-tight bg-clip-text text-transparent font-extrabold tracking-tighter whitespace-nowrap"
            style={{ backgroundImage: 'linear-gradient(90deg,#c11e38,#220b34)' }}
          >
            Tracking
          </span>
          {/** 
          <p className="text-gray-500 max-w-2xl mx-auto">
            <span className="text-3xl text-[#c11e38]/80 font-bold">EHHH,</span> <br />
            livreur là est passé où avec ma commande !?
            <br />
            Ça fait 22min !
          </p>
          */}
          <p className="text-gray-700 mt-8 max-w-2xl mx-auto">
            <span className="text-[#c11e38] font-bold">Spécial INP-HB Centre & Sud</span> <br />
            Suivi en temps réel des commandes — pensé pour les étudiants, les gérants et les livreurs.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <SmoothScrollLink targetId="tracking-s2" className="inline-flex items-center rounded-full border border-[#111827] text-[#111827] px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">Découvrir</SmoothScrollLink>
            <SmoothScrollLink targetId="tracking-s3" className="inline-flex items-center rounded-full bg-[#c11e38] text-white px-6 py-3 text-sm md:text-base font-semibold hover:brightness-95">Se connecter</SmoothScrollLink>
          </div>
        </div>
      </section>

      {/* ===== Section 2: Présentation (full screen) ===== */}
      <section id="tracking-s2" className="min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full px-6">
          <h2 className="text-center text-3xl md:text-5xl font-black tracking-tight mb-12">
            Trois rôles, une seule plateforme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gérant */}
            <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-600 text-2xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Pour le Gérant</h3>
              <p className="text-gray-600 mb-3">Interface claire pour créer, suivre et gérer les commandes.</p>
              <p className="text-sm text-gray-500 italic">Exemple : Oura, gérante de shaifai-food, crée une commande en 30 secondes et l’assigne à son livreur.</p>
            </div>

            {/* Livreur */}
            <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 text-2xl mb-4">🛵</div>
              <h3 className="text-xl font-semibold mb-2">Pour le Livreur</h3>
              <p className="text-gray-600 mb-3">Outil simple pour organiser la tournée et signaler la progression.</p>
              <p className="text-sm text-gray-500 italic">Exemple : Alvin reçoit la commande de Oura, démarre sa tournée et met à jour sa position au fil du trajet.</p>
            </div>

            {/* Client */}
            <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 text-2xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Pour le Client</h3>
              <p className="text-gray-600 mb-3">Lien unique pour suivre en temps réel, sans inscription.</p>
              <p className="text-sm text-gray-500 italic">Exemple : Binta, la cliente, suit sur son téléphone l’arrivée de sa commande</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 3: Accès + Connexion (full screen) ===== */}
      <section id="tracking-s3" className="min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Cartes Accès (même style que section 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
            <button onClick={() => goOrWarn('/tracking/manager')} className="text-left p-6 rounded-2xl bg-white shadow-md border border-gray-200 hover:shadow-lg transition">
              <div className="text-2xl font-semibold">Gérant</div>
              <div className="text-base text-slate-600 mt-1">Créer et suivre les commandes</div>
            </button>
            <button onClick={() => goOrWarn('/tracking/courier')} className="text-left p-6 rounded-2xl bg-white shadow-md border border-gray-200 hover:shadow-lg transition">
              <div className="text-2xl font-semibold">Livreur</div>
              <div className="text-base text-slate-600 mt-1">Itinéraires et progression</div>
            </button>
          </div>

          {/* Connexion (prod) */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-4">Connexion</h3>
            {user ? (
              <div className="p-4 border rounded-2xl bg-white shadow-sm">
                <div className="text-sm text-slate-700">
                  Vous êtes connecté{role === 'manager' && restaurant?.name ? ` en tant que le gérant de "${restaurant.name}"` : ''}.
                </div>
                <button onClick={() => signOut()} className="mt-3 px-3 py-2 rounded bg-slate-800 text-white text-sm">Se déconnecter</button>
              </div>
            ) : (
              <form onSubmit={onLogin} className="space-y-3 p-4 border rounded-2xl bg-white shadow-sm">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="border rounded p-2 w-full" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mot de passe" type="password" className="border rounded p-2 w-full" />
                <button disabled={submitting} type="submit" className="px-3 py-2 bg-[#c11e38] text-white rounded w-full">{submitting ? 'Connexion…' : 'Se connecter'}</button>
                <div className="text-xs text-slate-600 text-center">
                  Vous n&apos;avez pas d&apos;identifant ? {" "}
                  <a className="text-[#c11e38] underline" href="https://wa.me/2250799239383?text=Demande%20d%E2%80%99identifiants%20shaifai%20tracking" target="_blank" rel="noreferrer">Écrire sur WhatsApp</a>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
