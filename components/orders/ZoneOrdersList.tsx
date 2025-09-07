// components/orders/ZoneOrdersList.tsx
'use client';

import Badge from '@/components/Badge';
import OrderActions from './OrderActions';
import { formatXOF } from '@/lib/utils';
import type { Courier, Order, Zone } from '@/lib/types';

export default function ZoneOrdersList({ orders, zone, courier, onFlash }: { orders: Order[]; zone: Zone; courier: Courier | null; onFlash?: (msg: string) => void }) {
  const list = orders
    .filter((o) => o.zone === zone)
    .sort((a, b) => (a.priority ?? 999999) - (b.priority ?? 999999));

  if (!list.length) return <p className="text-sm text-slate-600">Aucune commande dans cette zone.</p>;

  return (
    <ul className="text-sm space-y-2">
      {list.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-2 border rounded p-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium">
                {o.clientCode} {o.customerName && <span className="text-slate-500">— {o.customerName}</span>}
              </div>
              <div className="text-xs text-slate-600">Chambre {o.roomNumber ?? '—'} • {formatXOF(o.price)} • {o.paymentMethod?.replace('_',' ') ?? '—'}</div>
            </div>
            {/* ICI supprimé (position via currentStepId du livreur) */}
            {o.status === 'done' ? <Badge variant="green">done</Badge> : <Badge variant="yellow">pending</Badge>}
          </div>

          <OrderActions order={o} compact onError={(m) => onFlash?.(m)} />
        </li>
      ))}
    </ul>
  );
}
