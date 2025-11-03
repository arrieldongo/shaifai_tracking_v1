// app/tracking/courier/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderTabs from "@/components/HeaderTabs";
import TimelineZone from "@/components/courier/TimelineZone";
import CourierRouteList from "@/components/courier/CourierRouteList";
import { useCourier } from "@/hooks/useCourier";
import { useOrders } from "@/hooks/useOrders";
import type { Order, Step, Zone } from "@/lib/types";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { useRestaurant } from "@/hooks/useRestaurant";

// Palette rapide (tu peux remplacer par tes couleurs finales)
const STEP_COLORS = {
  portail: "#9CA3AF",
  bibliotheque: "#F59E0B",
  activite_libre: "#10B981",
  batiment: "#6B7280",
} as const;

// Helpers client: liste/resolve des assets par zone via API
type AssetsMap = Record<string, string>;
const normalizeKey = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

async function fetchZoneAssets(zone: Zone): Promise<AssetsMap> {
  try {
    const res = await fetch(`/api/assets/zone?zone=${zone}`);
    if (!res.ok) return {};
    const data = await res.json();
    return (data?.map as AssetsMap) || {};
  } catch {
    return {};
  }
}

// Demandé: fonctions listZoneSud / listZoneCentre (retourne la liste d'URLs)
async function listZoneSud(): Promise<string[]> {
  try {
    const r = await fetch('/api/assets/zone?zone=sud');
    if (!r.ok) return [];
    const d = await r.json();
    return (d?.files as string[]) || [];
  } catch {
    return [];
  }
}
async function listZoneCentre(): Promise<string[]> {
  try {
    const r = await fetch('/api/assets/zone?zone=centre');
    if (!r.ok) return [];
    const d = await r.json();
    return (d?.files as string[]) || [];
  } catch {
    return [];
  }
}

function CourierPageInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { loading, claims } = useAuth();
  const ridFromClaims = (claims?.rid as string) || undefined;
  const ridFromQuery = (search.get("rid") || undefined) as string | undefined;
  const effectiveRid = ridFromClaims ?? ridFromQuery;
  const { restaurant } = useRestaurant(effectiveRid);

  const view = (search.get("view") || "list") as "list" | "sud" | "centre";

  // Utilise le courierId des claims si dispo, sinon fallback
  const courierId = (claims?.courierId as string) || "main-courier";
  const { courier } = useCourier(courierId, { rid: effectiveRid });
  const { orders } = useOrders(undefined, { rid: effectiveRid });

  // Assets dynamiques
  const [assetsSud, setAssetsSud] = useState<AssetsMap>({});
  const [assetsCentre, setAssetsCentre] = useState<AssetsMap>({});

  useEffect(() => {
    // Charger une seule fois
    fetchZoneAssets('sud').then(setAssetsSud);
    fetchZoneAssets('centre').then(setAssetsCentre);
  }, []);

  const asset = (zone: Zone, name: string) => {
    const key = normalizeKey(name);
    const m = zone === 'centre' ? assetsCentre : assetsSud;
    // compat activite_libre -> activiteLibre
    return m[key] || m[normalizeKey(name.replace(/_/g, ''))] || `/${zone}/${name}.png`;
  };

  // Onglets
  const computedActiveKey = view === "list" ? "" : view;
  const setView = (key: "list" | "sud" | "centre") => {
    const p = new URLSearchParams(search.toString());
    p.set("view", key);
    router.push(`/tracking/courier?${p.toString()}`);
  };

  /** Transforme Orders -> Steps pour UNE zone (status !== done) */
  const ordersToSteps = (zone: Zone): Step[] =>
    (orders as Order[])
      .filter((o) => o.zone === zone && o.status !== "done" && o.assigned)
      .sort((a, b) => (a.priority ?? 999999) - (b.priority ?? 999999))
      .map<Step>((o) => ({
        id: o.id!, // Firestore id
        label: o.customerName ? `${o.customerName} ${o.roomNumber ? ` •   en ${o.roomNumber}` : ""}` : `Commande ${o.id}`,
        image: asset(zone, "batiment"),
        color: STEP_COLORS.batiment,
        status: "upcoming",
        kind: "order",
      }));

  /** Étapes fixes par zone */
  const fixedSteps = (zone: Zone): Step[] =>
    zone === "centre"
      ? [
        { id: "centre-portail", label: "Portail principal centre", image: asset("centre", "portail"), color: STEP_COLORS.portail, status: "upcoming", kind: "fixed" },
        { id: "centre-bibliotheque", label: "Bibliothèque centrale", image: asset("centre", "bibliotheque"), color: STEP_COLORS.bibliotheque, status: "upcoming", kind: "fixed" },
        { id: "centre-activite", label: "Activité libre (centre)", image: asset("centre", "activiteLibre"), color: STEP_COLORS.activite_libre, status: "upcoming", kind: "fixed" },
      ]
      : [
        { id: "sud-portail", label: "Portail Sud", image: asset("sud", "portail"), color: STEP_COLORS.portail, status: "upcoming", kind: "fixed" },
        { id: "sud-bibliotheque", label: "Bibliothèque Sud", image: asset("sud", "bibliotheque"), color: STEP_COLORS.bibliotheque, status: "upcoming", kind: "fixed" },
        { id: "sud-activite", label: "Activité libre (sud)", image: asset("sud", "activite_libre"), color: STEP_COLORS.activite_libre, status: "upcoming", kind: "fixed" },
      ];

  // Étape courante telle que posée par le livreur
  const currentStepId = courier?.currentStepId ?? null;

  /** Callbacks réseau */

  // "ICI on/off" : bascule sur l'ID de l'étape
  const onToggleHere = async (stepId: string) => {
    const currentId = currentStepId;
    const newId = currentId === stepId ? null : stepId;
    await apiFetch(`/api/courier/toggleHere`, {
      method: "POST",
      body: JSON.stringify({ courierId, stepId: newId }),
    });
  };

  // "Pending" : uniquement pour les orders (id = orderId)
  const onTogglePending = async (stepId: string) => {
    await apiFetch(`/api/orders/setPending`, {
      method: "POST",
      body: JSON.stringify({ orderId: stepId }),
    });
  };

  const sudOrders = ordersToSteps("sud");
  const centreOrders = ordersToSteps("centre");

  return (
    <RoleGuard
      require={["courier", "manager"]}
      fallback={
        <div className="p-6 text-center text-red-600">
          Accès refusé — rôle <b>courier</b> ou <b>manager</b> requis.
          <div className="mt-2 text-sm text-slate-600">
            Vérifie ta connexion sur <a className="underline" href="/tracking/login">/tracking/login</a> (claims et email).
          </div>
        </div>
      }
    >
      <main>
        {loading && <div className="p-4 text-sm text-gray-500">Chargement…</div>}
        {!effectiveRid && (
          <div className="p-4 text-xs text-amber-700 bg-amber-100 rounded mb-2">Admin: ajoute ?rid=&lt;restaurantId&gt; à l’URL pour sélectionner un resto</div>
        )}

        <h1 className="text-center text-2xl font-bold my-4">
          {restaurant?.name}
        </h1>

        <HeaderTabs
          leftIcon="list"
          onLeftClick={() => setView("list")}
          tabs={[
            { key: "sud", label: "Sud" },
            { key: "centre", label: "Centre" },
          ]}
          activeKey={computedActiveKey}
          onTabChange={(k) => setView(k as "list" | "sud" | "centre")}
          segmented
        />

        <div className="p-4 max-w-5xl mx-auto">
          {view === "list" && (
            <CourierRouteList sud={sudOrders} centre={centreOrders} />
          )}

          {view === "sud" && (
            <TimelineZone
              zone="sud"
              fixedSteps={fixedSteps("sud")}
              orderSteps={sudOrders}
              currentStepId={currentStepId}
              onToggleHere={onToggleHere}
              onTogglePending={onTogglePending}
            />
          )}

          {view === "centre" && (
            <TimelineZone
              zone="centre"
              fixedSteps={fixedSteps("centre")}
              orderSteps={centreOrders}
              currentStepId={currentStepId}
              onToggleHere={onToggleHere}
              onTogglePending={onTogglePending}
            />
          )}
        </div>
      </main>
    </RoleGuard>
  );
}

export default function CourierPage() {
  return (
    <Suspense fallback={<main className="p-4 text-sm text-gray-500">Chargement…</main>}>
      <CourierPageInner />
    </Suspense>
  );
}

/*
Aperçu:
- S’aligne sur le nouveau Courier (steps + currentStepIndex).
- Calcule currentStepId à partir de l’index pour TimelineZone.
- Plus de paramètre token; utilise apiFetch (ID token).
*/
