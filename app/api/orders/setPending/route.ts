// app/api/orders/setPending/route.ts (ajout miroir public)
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, assertRole, getClaimsFromRequest, assertRidMatch } from '@/lib/apiAuth';
import { writePublicOrder } from '@/lib/publicMirror';

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    try { assertRole(claims, 'manager'); } catch { assertRole(claims, 'courier'); }

    const { orderId, status } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const ref = adminDb.doc(`orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

    const data = snap.data() as any;
    assertRidMatch(claims, data.rid);

    const newStatus = status ?? (data.status === 'pending' ? 'done' : 'pending');
    if (!['pending', 'done'].includes(newStatus)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }

    const now = Date.now();
    await ref.set({ status: newStatus, updatedAt: now }, { merge: true });

    // Miroir public
    await writePublicOrder(adminDb, orderId, {
      id: orderId,
      clientCode: data.clientCode,
      zone: data.zone,
      roomNumber: data.roomNumber,
      status: newStatus,
      rid: data.rid,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}
