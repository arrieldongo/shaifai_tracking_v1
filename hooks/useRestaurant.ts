// hooks/useRestaurant.ts
"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Restaurant = { id: string; name: string; zones?: string[] };

export function useRestaurant(rid?: string | null) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rid) {
      setRestaurant(null);
      setLoading(false);
      return;
    }
    const ref = doc(db, `restaurants/${rid}`);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setRestaurant(null);
        } else {
          const x = snap.data() as any;
          setRestaurant({ id: snap.id, name: x.name || '(sans nom)', zones: x.zones });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [rid]);

  return { restaurant, loading };
}

