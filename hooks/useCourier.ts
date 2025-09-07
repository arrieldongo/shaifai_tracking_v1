// hooks/useCourier.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Courier } from "@/lib/types";

export function useCourier(
  courierId: string,
  opts?: { rid?: string } // possibilité de forcer le rid
) {
  const { claims } = useAuth();
  const [courier, setCourier] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);

  const rid = useMemo(
    () => opts?.rid ?? (claims?.rid as string | undefined),
    [opts?.rid, claims?.rid]
  );

  useEffect(() => {
    if (!rid || !courierId) {
      setCourier(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, `restaurants/${rid}/couriers/${courierId}`);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setCourier(null);
        } else {
          const d = snap.data() as any;
          const c: Courier = {
            id: snap.id,
            rid,
            name: d.name,
            currentStepId: d.currentStepId ?? null,
            updatedAt: d.updatedAt,
          };
          setCourier(c);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [rid, courierId]);

  return { courier, rid, loading };
}

/*
Résumé:
- Abonne restaurants/{rid}/couriers/{courierId}.
- Retourne bien un Courier | null conforme à lib/types.
*/
