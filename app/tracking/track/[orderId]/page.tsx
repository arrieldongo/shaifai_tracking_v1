'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import Badge from '@/components/Badge';
import FormatDate from '@/components/FormatDate';
import type { Zone, Step } from '@/lib/types';
import TimelineZone from '@/components/courier/TimelineZone';
import { zoneAsset } from '@/lib/types';

type PublicOrder = {
  id: string;
  clientCode?: string;
  zone: 'sud' | 'centre';
  roomNumber?: string;
  status: 'pending' | 'done';
  rid?: string;
  currentStepId?: string | null;
  assigned?: boolean;
  priority?: number;
  updatedAt: number;
};

const STEP_COLORS = {
  portail: '#9CA3AF',
  bibliotheque: '#F59E0B',
  activite_libre: '#10B981',
  batiment: '#6B7280',
} as const;

function fixedSteps(zone: Zone): Step[] {
  return zone === 'centre'
    ? [
        { id: 'centre-portail', label: 'Portail principal centre', image: zoneAsset('centre','portail'), color: STEP_COLORS.portail, status: 'upcoming', kind: 'fixed' },
        { id: 'centre-bibliotheque', label: 'Bibliothèque centrale', image: zoneAsset('centre','bibliotheque'), color: STEP_COLORS.bibliotheque, status: 'upcoming', kind: 'fixed' },
        { id: 'centre-activite', label: 'Activité libre (centre)', image: zoneAsset('centre','activite_libre'), color: STEP_COLORS.activite_libre, status: 'upcoming', kind: 'fixed' },
      ]
    : [
        { id: 'sud-portail', label: 'Portail Sud', image: zoneAsset('sud','portail'), color: STEP_COLORS.portail, status: 'upcoming', kind: 'fixed' },
        { id: 'sud-bibliotheque', label: 'Bibliothèque Sud', image: zoneAsset('sud','bibliotheque'), color: STEP_COLORS.bibliotheque, status: 'upcoming', kind: 'fixed' },
        { id: 'sud-activite', label: 'Activité libre (sud)', image: zoneAsset('sud','activite_libre'), color: STEP_COLORS.activite_libre, status: 'upcoming', kind: 'fixed' },
      ];
}

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string | string[] }>();
  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] ?? '' : params?.orderId ?? '';

  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<PublicOrder[]>([]);

  useEffect(() => {
    if (!orderId) return;
    const ref = doc(db, 'public_orders', orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setOrder(snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as PublicOrder) : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [orderId]);

  useEffect(() => {
    (async () => {
      try {
        if (!order?.rid) return setQueue([]);
        const q = query(collection(db, 'public_orders'), where('rid', '==', order.rid));
        const snap = await getDocs(q);
        let out: PublicOrder[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as PublicOrder));
        out = out.filter((o) => o.zone === order.zone && o.status !== 'done' && o.assigned);
        out.sort((a, b) => (a.priority ?? 999999) - (b.priority ?? 999999));
        setQueue(out);
      } catch {
        setQueue([]);
      }
    })();
  }, [order?.rid, order?.zone, order?.status, order?.assigned, order?.priority]);

  const orderSteps: Step[] = useMemo(() => {
    if (!order) return [];
    const list = queue;
    return list.map<Step>((o) => ({
      id: o.id,
      label: o.clientCode ? `${o.clientCode}${o.roomNumber ? ` • Ch. ${o.roomNumber}` : ''}` : `Commande ${o.id}`,
      image: zoneAsset(o.zone, 'batiment'),
      color: STEP_COLORS.batiment,
      status: 'upcoming',
      kind: 'order',
    }));
  }, [order, queue]);

  return (
    <main className="p-6 max-w-lg mx-auto">
      {!orderId ? (
        <div>Identifiant de commande manquant.</div>
      ) : loading ? (
        <div>Chargement…</div>
      ) : !order ? (
        <>
          <h1 className="text-xl font-bold mb-2">Suivi commande</h1>
          <p className="text-sm text-slate-600">Commande introuvable ou supprimée.</p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-2">Suivi commande</h1>
          <div className="text-sm text-slate-700 mb-2">ID: {order.id}</div>
          {order.clientCode && <div className="text-sm text-slate-700 mb-1">Code client: {order.clientCode}</div>}
          <div className="text-sm text-slate-700 mb-1">Zone: {order.zone.toUpperCase()}</div>
          <div className="text-sm text-slate-700 mb-3">Chambre: {order.roomNumber ?? '—'}</div>
          <div>
            {order.status === 'done' ? (
              <Badge variant="green">Livré</Badge>
            ) : (
              <Badge variant="yellow">En cours</Badge>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">Dernière mise à jour: <FormatDate ts={order.updatedAt} /></div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Itinéraire</h2>
            <TimelineZone
              zone={order.zone}
              fixedSteps={fixedSteps(order.zone)}
              orderSteps={orderSteps}
              currentStepId={order.currentStepId ?? null}
              onToggleHere={() => {}}
              onTogglePending={() => {}}
              readonly
              highlightStepId={order.id}
              highlightLabel="Vous"
            />
          </div>
        </>
      )}
    </main>
  );
}

