// app/api/orders/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, assertRole, assertRidMatch, getClaimsFromRequest } from '@/lib/apiAuth';

type Item = { orderId: string; priority: number };

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    try { assertRole(claims, 'manager'); } catch { assertRole(claims, 'courier'); }

    const { items } = (await req.json()) as { items: Item[] };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items[] required' }, { status: 400 });
    }

    const batch = adminDb.batch();

    for (const it of items) {
      if (!it?.orderId || typeof it.priority !== 'number') {
        return NextResponse.json({ error: 'invalid_item' }, { status: 400 });
      }
      const ref = adminDb.doc(`orders/${it.orderId}`);
      const snap = await ref.get();
      if (!snap.exists) return NextResponse.json({ error: `order_not_found:${it.orderId}` }, { status: 404 });
      const rid = (snap.data()?.rid as string) || '';
      assertRidMatch(claims, rid);
      const now = Date.now();
      batch.set(ref, { priority: it.priority, updatedAt: now }, { merge: true });
      const pubRef = adminDb.doc(`public_orders/${it.orderId}`);
      batch.set(pubRef, { priority: it.priority, updatedAt: now }, { merge: true });
    }

    await batch.commit();
    return NextResponse.json({ ok: true, count: items.length });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}

/*
Note:
- Assure-toi d'avoir renommé le dossier "reorde" -> "reorder".
  app/api/orders/reorder/route.ts
*/
