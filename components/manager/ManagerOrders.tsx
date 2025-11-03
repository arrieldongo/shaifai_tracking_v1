'use client';

import { assignOrder, deleteOrder } from '@/lib/api';
import Badge from '@/components/Badge';
import { copyOrShare, copyText, formatXOF } from '@/lib/utils';
import FormatDate from '@/components/FormatDate';
import { Order, Courier } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function ManagerOrders({ orders, courier, onFlash }: { orders: Order[]; courier: Courier | null; onFlash?: (msg: string) => void }) {
  const { claims } = useAuth();
  const rid = (claims?.rid as string) || undefined;
  const { restaurant } = useRestaurant(rid);

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

  const copySummary = async (o: Order) => {
    const name = o.customerName || '';
    const desc = o.description || '';
    const price = typeof o.price === 'number' ? formatXOF(o.price) : '—';
    const pm = o.paymentMethod ? o.paymentMethod.replace(/_/g, ' ') : '—';
    const link = `${window.location.origin}/tracking/track/${o.id}`;
    const resto = restaurant?.name || '';
    const text = `Hi ${name},
nous vous confirmons que votre commande à bien été prise en charge.

commande: ${desc}
prix: ${price}
moyen de payement: ${pm}

Suivez votre commande en temps réel grâce à ce lien:
${link}

${resto} | Shaifai`;
    const res = await copyText(text);
    if (res === 'copied' || res === 'shown') onFlash?.('Résumé copié ✅');
    else onFlash?.('Impossible de copier le résumé');
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/tracking/track/${code}`;
    const res = await copyOrShare(url);
    if (res === 'shared') onFlash?.('Lien partagé ✅');
    else if (res === 'copied') onFlash?.('Lien copié ✅');
    else if (res === 'shown') onFlash?.('Lien affiché pour copie');
    else onFlash?.('Impossible de copier le lien');
  };

  const trackingUrl = (id?: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/tracking/track/${id ?? ''}`;

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
            className="flex flex-col sm:flex-row justify-between border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
          >
            {/* --- Bloc gauche --- */}
            <div className="flex-1 space-y-2">
              {/* En-tête client */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-800">
                  {o.customerName && <span>{o.customerName}</span>}
                  <span className="text-slate-500"> • Chambre {o.roomNumber ?? '—'}</span>
                  <span className="text-slate-500"> • {o.zone}</span>
                </div>
          
                <Badge variant="blue" className="shrink-0">
                  Pris en charge
                </Badge>
              </div>
          
              {/* Description / Notes */}
              {(o.description || o.notes) && (
                <div className="text-xs text-slate-600 leading-relaxed">
                  {o.description && (
                    <p>
                      <span className="font-medium text-slate-700">Description :</span>{' '}
                      {o.description}
                    </p>
                  )}
                  {o.notes && (
                    <p>
                      <span className="font-medium text-slate-700">Notes :</span> {o.notes}
                    </p>
                  )}
                <a
                  href={trackingUrl(o.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline break-all"
                  title="Ouvrir le suivi"
                >
                  {trackingUrl(o.id)}
                </a>
                </div>
              )}
          
              {/* Prix / Paiement */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {typeof o.price === 'number' && (
                  <span className="font-medium text-green-700">{formatXOF(o.price)}</span>
                )}
                {o.paymentMethod && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                    {o.paymentMethod.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          
            {/* --- Bloc actions --- */}
            <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
              <button
                onClick={() => copySummary(o)}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium hover:bg-slate-50 active:scale-95 transition"
              >
                Résumer
              </button>
          
              <button
                onClick={() => removeOrder(o.id!)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 active:scale-95 transition"
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
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white gap-3"
          >
            {/* --- Bloc gauche : infos commande --- */}
            <div className="flex-1 space-y-2">
              {/* Client & chambre */}
              <div className="text-sm font-semibold text-slate-800">
                {o.customerName && <span>{o.customerName}</span>}
                <span className="text-slate-500"> • Chambre {o.roomNumber ?? '—'}</span>
                <span className="text-slate-500"> • {o.zone}</span>
              </div>
          
              {/* Description & notes */}
              {(o.description || o.notes) && (
                <div className="text-xs text-slate-600 leading-relaxed">
                  {o.description && (
                    <p>
                      <span className="font-medium text-slate-700">Description :</span>{' '}
                      {o.description}
                    </p>
                  )}
                  {o.notes && (
                    <p>
                      <span className="font-medium text-slate-700">Notes :</span> {o.notes}
                    </p>
                  )}
                </div>
              )}
          
              {/* Prix & paiement */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {typeof o.price === 'number' && (
                  <span className="font-medium text-green-700">{formatXOF(o.price)}</span>
                )}
                {o.paymentMethod && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                    {o.paymentMethod.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          
            {/* --- Bloc droit : actions --- */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => takeOrder(o.id!)}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 active:scale-95 transition"
              >
                Prendre en charge
              </button>
          
              <button
                onClick={() => removeOrder(o.id!)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 active:scale-95 transition"
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
