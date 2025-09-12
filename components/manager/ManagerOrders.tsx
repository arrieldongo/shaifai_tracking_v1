'use client';

import { assignOrder, deleteOrder } from '@/lib/api';
import Badge from '@/components/Badge';
import { copyOrShare, formatXOF } from '@/lib/utils';
import FormatDate from '@/components/FormatDate';
import { Order, Courier } from '@/lib/types';

export default function ManagerOrders({ orders, courier, onFlash }: { orders: Order[]; courier: Courier | null; onFlash?: (msg: string) => void }) {
  const takeOrder = async (id: string) => {
    try {
      await assignOrder(id, true);
      onFlash?.('Commande prise en charge ✅');
    } catch (e: any) {
      onFlash?.(e.message || 'Erreur prise en charge');
    }
  };

  const removeOrder = async (id: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await deleteOrder(id);
      onFlash?.('Commande supprimée ❌');
    } catch (e: any) {
      onFlash?.(e.message || 'Erreur suppression');
    }
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/tracking/track/${code}`;
    const res = await copyOrShare(url);
    if (res === 'shared') onFlash?.('Lien partagé ✅');
    else if (res === 'copied') onFlash?.('Lien copié ✅');
    else if (res === 'shown') onFlash?.('Lien affiché pour copie');
    else onFlash?.('Impossible de copier le lien');
  };

  const assigned = orders
    .filter((o) => o.assigned)
    .sort(
      (a, b) =>
        (a.priority ?? a.assignedAt ?? 0) - (b.priority ?? b.assignedAt ?? 0)
    );

  const pending = orders
    .filter((o) => !o.assigned)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-title font-black mb-3">Commandes en cours</h2>
        {assigned.length === 0 && (
          <p className="text-sm text-slate-600">Aucune commande prise en charge.</p>
        )}
        <ul className="space-y-2">
          {assigned.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between border rounded p-3 flex-wrap gap-2"
            >
              <div>
                <div className="font-medium">
                  {o.clientCode}{' '}
                  {o.customerName && <span className="text-slate-500">— {o.customerName}</span>}
                </div>
                <div className="text-xs text-slate-600">
                  Zone {o.zone} • Chambre {o.roomNumber ?? '—'} • {formatXOF(o.price)}
                </div>
                <div className="mt-1">
                  <Badge variant="blue">Pris en charge</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  className="text-blue-600 underline text-sm"
                  href={`/tracking/track/${o.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  /tracking/track/{o.id}
                </a>
                <button
                  onClick={() => copyLink(o.id!)}
                  className="px-2 py-1 rounded ring-1 ring-slate-300 text-xs"
                >
                  Copier
                </button>
                <span className="text-[11px] text-slate-500">
                  <FormatDate ts={o.createdAt} prefix="Créée" /> • <FormatDate ts={o.updatedAt} prefix="Maj" />
                </span>
                <button
                  onClick={() => removeOrder(o.id!)}
                  className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-3">En attente</h2>
        {pending.length === 0 && (
          <p className="text-sm text-slate-600">Aucune commande en attente.</p>
        )}
        <ul className="space-y-2">
          {pending.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between border rounded p-3 flex-wrap gap-2"
            >
              <div>
                <div className="font-medium">{o.clientCode}</div>
                <div className="text-xs text-slate-600">
                  Zone {o.zone} • Chambre {o.roomNumber ?? '—'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => takeOrder(o.id!)}
                  className="px-3 py-1.5 rounded bg-black text-white text-xs"
                >
                  Prendre en charge
                </button>
                <span className="text-[11px] text-slate-500">
                  <FormatDate ts={o.createdAt} prefix="Créée" /> • <FormatDate ts={o.updatedAt} prefix="Maj" />
                </span>
                <button
                  onClick={() => removeOrder(o.id!)}
                  className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
