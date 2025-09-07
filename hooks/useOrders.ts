// hooks/useOrders.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Order } from "@/lib/types";

type Options = {
  statusIn?: Array<Order["status"]>;
  zoneIn?: Array<Order["zone"]>;
  limitTo?: number;
  rid?: string; // permet d'outrepasser le rid des claims (ex: admin)
};

export function useOrders(_deprecatedCourierId?: string, opts?: Options) {
  const { claims } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const rid = useMemo(() => (opts?.rid as string | undefined) ?? (claims?.rid as string | undefined), [opts?.rid, claims?.rid]);

  useEffect(() => {
    if (!rid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("rid", "==", rid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        let out: Order[] = snap.docs.map((d) => {
          const x = d.data() as any;
          const o: Order = {
            id: d.id,
            rid: x.rid,
            clientCode: x.clientCode ?? undefined,
            roomNumber: x.roomNumber ?? undefined,
            phone: x.phone ?? undefined,
            zone: x.zone,
            status: x.status,
            assigned: Boolean(x.assigned),
            assignedAt: typeof x.assignedAt === 'number' ? x.assignedAt : undefined,
            priority: x.priority,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
          };
          return o;
        });

        if (opts?.statusIn?.length) out = out.filter((o) => opts.statusIn!.includes(o.status));
        if (opts?.zoneIn?.length) out = out.filter((o) => opts.zoneIn!.includes(o.zone));
        // Tri par priorité côté client (évite l'index composite rid+priority)
        out.sort((a, b) => (a.priority ?? 999999) - (b.priority ?? 999999));
        if (opts?.limitTo) out = out.slice(0, opts.limitTo);

        setOrders(out);
        setLoading(false);
      },
      (err) => {
        console.error('[useOrders] onSnapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [rid, opts?.statusIn?.join(","), opts?.zoneIn?.join(","), opts?.limitTo]);

  return { orders, rid, loading };
}

/*
Résumé:
- Lit orders/ filtrées par rid (claims).
- Retourne un tableau Order strictement aligné avec lib/types.
*/
