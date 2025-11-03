'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import Badge from '@/components/Badge';
import FormatDate from '@/components/FormatDate';
import type { Zone, Step } from '@/lib/types';
import TimelineZone from '@/components/courier/TimelineZone';

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
  // Infos supplémentaires
  customerName?: string;
  description?: string;
  price?: number;
  paymentMethod?: 'cash' | 'wave' | 'orange_money' | 'mtn_money' | 'moov_money';
  notes?: string;
};

const STEP_COLORS = {
  portail: '#9CA3AF',
  bibliotheque: '#F59E0B',
  activite_libre: '#10B981',
  batiment: '#6B7280',
} as const;

// Assets dynamiques (client)
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

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string | string[] }>();
  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] ?? '' : params?.orderId ?? '';

  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<PublicOrder[]>([]);
  const [assetsSud, setAssetsSud] = useState<AssetsMap>({});
  const [assetsCentre, setAssetsCentre] = useState<AssetsMap>({});

  useEffect(() => {
    fetchZoneAssets('sud').then(setAssetsSud);
    fetchZoneAssets('centre').then(setAssetsCentre);
  }, []);

  const asset = (zone: Zone, name: string) => {
    const key = normalizeKey(name);
    const m = zone === 'centre' ? assetsCentre : assetsSud;
    return m[key] || m[normalizeKey(name.replace(/_/g, ''))] || `/${zone}/${name}.png`;
  };

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
      label: `${o.customerName || o.clientCode || `Commande ${o.id}`}${o.roomNumber ? ` • Ch. ${o.roomNumber}` : ''}`,
      image: asset(o.zone, 'batiment'),
      color: STEP_COLORS.batiment,
      status: 'upcoming',
      kind: 'order',
    }));
  }, [order, queue, assetsSud, assetsCentre]);

  const fixedSteps = (zone: Zone): Step[] =>
    zone === 'centre'
      ? [
          { id: 'centre-portail', label: 'Portail principal centre', image: asset('centre','portail'), color: STEP_COLORS.portail, status: 'upcoming', kind: 'fixed' },
          { id: 'centre-bibliotheque', label: 'Bibliothèque centrale', image: asset('centre','bibliotheque'), color: STEP_COLORS.bibliotheque, status: 'upcoming', kind: 'fixed' },
          { id: 'centre-activite', label: 'Activité libre (centre)', image: asset('centre','activite_libre'), color: STEP_COLORS.activite_libre, status: 'upcoming', kind: 'fixed' },
        ]
      : [
          { id: 'sud-portail', label: 'Portail Sud', image: asset('sud','portail'), color: STEP_COLORS.portail, status: 'upcoming', kind: 'fixed' },
          { id: 'sud-bibliotheque', label: 'Bibliothèque Sud', image: asset('sud','bibliotheque'), color: STEP_COLORS.bibliotheque, status: 'upcoming', kind: 'fixed' },
          { id: 'sud-activite', label: 'Activité libre (sud)', image: asset('sud','activite_libre'), color: STEP_COLORS.activite_libre, status: 'upcoming', kind: 'fixed' },
        ];

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
          <div className="text-sm text-slate-700 mb-1">Vous êtes au: {order.zone.toUpperCase()}</div>
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
