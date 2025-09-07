// hooks/useCouriers.ts
"use client";

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Courier } from '@/lib/types';

export function useCouriers(opts?: { rid?: string }) {
  const { claims } = useAuth();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);

  const rid = useMemo(() => opts?.rid ?? (claims?.rid as string | undefined), [opts?.rid, claims?.rid]);

  useEffect(() => {
    if (!rid) {
      setCouriers([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, `restaurants/${rid}/couriers`);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list: Courier[] = snap.docs.map((d) => {
          const x = d.data() as any;
          return {
            id: d.id,
            rid,
            name: x.name || d.id,
            currentStepId: x.currentStepId ?? null,
            updatedAt: x.updatedAt,
          };
        });
        setCouriers(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [rid]);

  return { couriers, rid, loading };
}

