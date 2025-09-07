// components/orders/OrdersTable.tsx
'use client';

import Badge from '@/components/Badge';
import { copyOrShare, formatXOF } from '@/lib/utils';
import OrderActions from './OrderActions';
import type { Courier, Order } from '@/lib/types';

export default function OrdersTable({
  orders,
  courier,
  onFlash,
}: {
  orders: Order[];
  courier: Courier | null;
  onFlash?: (msg: string) => void;
}) {
  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/track/${code}`;
    const res = await copyOrShare(url);
    if (res === 'shared') onFlash?.('Lien partagé ✅');
    else if (res === 'copied') onFlash?.('Lien copié ✅');
    else if (res === 'shown') onFlash?.('Lien affiché pour copie manuelle');
    else onFlash?.('Impossible de copier le lien');
  };

  if (!orders.length) return <p className="text-sm text-slate-600">Aucune commande.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border rounded">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Client</th>
            <th className="p-2">Zone</th>
            <th className="p-2">Chambre</th>
            <th className="p-2">Statut</th>
            <th className="p-2">ICI</th>
            <th className="p-2">Prix</th>
            <th className="p-2">Paiement</th>
            <th className="p-2">Téléphone</th>
            <th className="p-2">Lien</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-2">
                <div className="font-medium">{o.clientCode}</div>
                {o.customerName && <div className="text-xs text-slate-600">{o.customerName}</div>}
              </td>
              <td className="p-2"><Badge variant={o.zone === 'sud' ? 'blue' : 'gray'}>{o.zone}</Badge></td>
              <td className="p-2">{o.roomNumber ?? '—'}</td>
              <td className="p-2">{o.status === 'done' ? <Badge variant="green">done</Badge> : <Badge variant="yellow">pending</Badge>}</td>
              <td className="p-2"><span className="text-xs text-slate-500">—</span></td>
              <td className="p-2">{formatXOF(o.price)}</td>
              <td className="p-2">{o.paymentMethod?.replace('_', ' ') ?? '—'}</td>
              <td className="p-2">{o.phone ?? '—'}</td>
              <td className="p-2">
                <a className="text-blue-600 underline" href={`/track/${o.id}`} target="_blank" rel="noreferrer">
                  /track/{o.id}
                </a>
                <button onClick={() => copyLink(o.id!)} className="ml-2 text-xs px-2 py-0.5 rounded ring-1 ring-slate-200">Copier</button>
              </td>
              <td className="p-2">
                <OrderActions order={o} onError={(m)=>onFlash?.(m)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
