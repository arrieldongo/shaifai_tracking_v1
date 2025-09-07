// app/api/courier/toggleHere/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, assertRole, getClaimsFromRequest } from '@/lib/apiAuth';
import { writePublicOrder } from '@/lib/publicMirror';

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertRole(claims, 'courier');

    const { courierId, stepId } = await req.json();
    if (!courierId || typeof stepId === 'undefined') {
      return NextResponse.json({ error: 'courierId and stepId are required' }, { status: 400 });
    }
    if (!claims.rid) {
      return NextResponse.json({ error: 'Missing rid in claims' }, { status: 403 });
    }

    const ref = adminDb.doc(`restaurants/${claims.rid}/couriers/${courierId}`);
    const now = Date.now();
    await ref.set({ currentStepId: stepId ?? null, updatedAt: now }, { merge: true });

    // Répercute le currentStepId sur le miroir public des commandes de ce resto (lecture client)
    const pubSnap = await adminDb
      .collection('public_orders')
      .where('rid', '==', claims.rid)
      .get();
    const batch = adminDb.batch();
    pubSnap.forEach((doc) => {
      batch.set(doc.ref, { currentStepId: stepId ?? null, updatedAt: now }, { merge: true });
    });
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}
