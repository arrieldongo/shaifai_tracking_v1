// components/manager/ManagerFollow.tsx
'use client';

import { useState } from 'react';
import ZoneOrdersList from '@/components/orders/ZoneOrdersList';
import type { Courier, Order, Zone } from '@/lib/types';

export default function ManagerFollow({ courier, orders, onFlash }: { courier: Courier | null; orders: Order[]; onFlash?: (msg: string) => void }) {
  const [zone, setZone] = useState<Zone>('sud');
  const [loading] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setZone('sud')} className={`px-3 py-1.5 rounded text-sm ${zone === 'sud' ? 'bg-black text-white' : 'bg-slate-100'}`}>
          Sud
        </button>
        <button onClick={() => setZone('centre')} className={`px-3 py-1.5 rounded text-sm ${zone === 'centre' ? 'bg-black text-white' : 'bg-slate-100'}`}>
          Centre
        </button>
      </div>

      

      <div>
        <h2 className="font-semibold mb-2">Commandes — Zone {zone}</h2>
        <ZoneOrdersList orders={orders} zone={zone} courier={courier} onFlash={onFlash} />
      </div>
    </section>
  );
}
