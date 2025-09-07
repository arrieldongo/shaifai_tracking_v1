// app/api/orders/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, assertRole, assertRidMatch, getClaimsFromRequest } from '@/lib/apiAuth';
import { deletePublicOrder } from '@/lib/publicMirror';

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertRole(claims, 'manager');

    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const ref = adminDb.doc(`orders/${orderId}`);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
    const data = snap.data() as any;
    assertRidMatch(claims, data.rid);

    await ref.delete();
    await deletePublicOrder(adminDb, orderId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}

