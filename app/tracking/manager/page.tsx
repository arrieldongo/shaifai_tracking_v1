// app/manager/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import HeaderTabs from "@/components/HeaderTabs";
import ManagerHome from "@/components/manager/ManagerHome";
import ManagerFollow from "@/components/manager/ManagerFollow";
import ManagerOrders from "@/components/manager/ManagerOrders";
import { useCourier } from "@/hooks/useCourier";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRestaurant } from "@/hooks/useRestaurant";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ManagerPage() {
  const search = useSearchParams();
  const router = useRouter();
  const { loading, claims } = useAuth();
  const ridFromClaims = (claims?.rid as string) || undefined;
  const ridFromQuery = (search.get("rid") || undefined) as string | undefined;
  const effectiveRid = ridFromClaims ?? ridFromQuery;
  const { restaurant } = useRestaurant(effectiveRid);

  // On garde l’id fixe actuel (enchaînera plus tard avec claims.rid/courierId si besoin)
  const { courier } = useCourier("main-courier", { rid: effectiveRid });
  const { orders } = useOrders("main-courier", { rid: effectiveRid });

  if (loading) return <div className="p-4 text-sm text-gray-500">Chargement…</div>;

  // Deux onglets: commandes / suivre
  const tab = (search.get("tab") || "commandes") as "commandes" | "suivre";

  // bouton "home" => formulaire de création seul
  const showCreate = search.get("create") === "1";
  const computedActiveKey = showCreate ? "" : tab;

  const setTab = (key: "commandes" | "suivre") => {
    const p = new URLSearchParams(search.toString());
    p.set("tab", key);
    p.delete("create");
    router.push(`/tracking/manager?${p.toString()}`);
  };

  const openCreate = () => {
    const p = new URLSearchParams(search.toString());
    p.set("create", "1");
    router.push(`/tracking/manager?${p.toString()}#create`);
  };

  const flash = (msg: string) => alert(msg);

  return (
    <RoleGuard
      require="manager"
      fallback={<div className="p-6 text-center text-red-600">Accès refusé — rôle <b>manager</b> requis.</div>}
    >
      <main className="max-w-5xl mx-auto">
        <HeaderTabs
          leftIcon="home"
          onLeftClick={openCreate}
          title={restaurant?.name}
          tabs={[
            { key: "commandes", label: "Commandes" },
            { key: "suivre", label: "Suivre" },
          ]}
          activeKey={computedActiveKey}
          onTabChange={(k) => setTab(k as "commandes" | "suivre")}
          segmented
        />

        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => router.push('/tracking/courier')}
              className="px-3 py-1.5 rounded bg-slate-800 text-white text-xs"
            >
              Voir la page Livreur
            </button>
            {!effectiveRid && (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">Admin: ajoute ?rid=&lt;restaurantId&gt; à l’URL pour sélectionner un resto</span>
            )}
          </div>
          {showCreate && (
            <div id="create" className="mb-8">
              <ManagerHome courier={courier} onFlash={flash} />
            </div>
          )}

          {!showCreate && (
            <>
              {tab === "commandes" && (
                <ManagerOrders orders={orders} courier={courier} onFlash={flash} />
              )}

              {tab === "suivre" && (
                <ManagerFollow courier={courier} orders={orders} onFlash={flash} />
              )}
            </>
          )}
        </div>
      </main>
    </RoleGuard>
  );
}

/*
Aperçu:
- Garde RoleGuard(require="manager") intacte.
- Propage courier & orders (types alignés via hooks).
- Retire toute notion de token côté manager.
*/
