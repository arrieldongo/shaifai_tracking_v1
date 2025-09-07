// app/api/orders/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, assertRole, assertRidMatch, getClaimsFromRequest } from '@/lib/apiAuth';
import { writePublicOrder } from '@/lib/publicMirror';

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertRole(claims, 'manager');

    const { orderId, assigned } = (await req.json()) as { orderId?: string; assigned?: boolean };
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const ref = adminDb.doc(`orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

    const data = snap.data() as any;
    assertRidMatch(claims, data.rid);

    const now = Date.now();
    const updates: Record<string, any> = {};
    if (assigned === false) {
      updates.assigned = false;
      updates.assignedAt = null;
      updates.priority = null;
    } else {
      updates.assigned = true;
      updates.assignedAt = now;
      if (data.priority == null) updates.priority = now;
    }

    await ref.set({ ...updates, updatedAt: now }, { merge: true });

    // Miroir public: juste mettre à jour updatedAt
    await writePublicOrder(adminDb, orderId, {
      id: orderId,
      clientCode: data.clientCode,
      zone: data.zone,
      roomNumber: data.roomNumber,
      status: data.status,
      rid: data.rid,
      assigned: updates.assigned ?? data.assigned,
      priority: (updates as any).priority ?? data.priority,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}
