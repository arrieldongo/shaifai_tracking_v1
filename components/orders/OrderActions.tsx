// components/orders/OrderActions.tsx
'use client';

import { setPending } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrderActions({ order, compact = false, onError }: { order: Order; compact?: boolean; onError?: (msg: string) => void }) {
  const toggleStatus = async () => {
    try {
      await setPending(order.id!, order.status === 'done' ? 'pending' : 'done');
    } catch (e: any) {
      onError?.(e?.message || 'Erreur statut');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={toggleStatus} className="text-xs px-2 py-1 rounded ring-1 ring-slate-200">
          {order.status === 'done' ? 'Pending' : 'Commande faite'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-x-2">
      <button onClick={toggleStatus} className="text-xs px-2 py-1 rounded ring-1 ring-slate-200">
        {order.status === 'done' ? 'Marquer pending' : 'Commande faite'}
      </button>
    </div>
  );
}
