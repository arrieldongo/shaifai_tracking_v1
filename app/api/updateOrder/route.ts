export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import type { OrderStatus } from '@/lib/types';

function allowToken(t: string | null) {
  return !!t && (t === process.env.MANAGER_TOKEN || t === process.env.COURIER_GLOBAL_TOKEN);
}

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!allowToken(token)) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const orderId = String(body.orderId || '').trim();
    // Plus de condition sur courierId; on s'aligne sur rid ailleurs

    const hasSetHere = false;
    const setHere = undefined;

    const allowedStatus: OrderStatus[] = ['pending', 'done'];
    const setStatus: OrderStatus | undefined = allowedStatus.includes(body.setStatus)
      ? body.setStatus
      : undefined;

    const hasSetAssigned = Object.prototype.hasOwnProperty.call(body, 'setAssigned');
    const setAssigned = hasSetAssigned ? Boolean(body.setAssigned) : undefined;

    const hasSetPriority = Object.prototype.hasOwnProperty.call(body, 'setPriority');
    const setPriority = hasSetPriority ? Number(body.setPriority) : undefined;

    if (!orderId) return new NextResponse('orderId requis', { status: 400 });
    if (!hasSetHere && setStatus === undefined && !hasSetAssigned && !hasSetPriority) {
      return new NextResponse('Aucun changement demandé', { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) return new NextResponse('Commande introuvable', { status: 404 });
    const data = snap.data()!;
    // Ne plus vérifier courierId

    const batch = adminDb.batch();

    // Exclusivité ICI
    // isHere supprimé

    // Statut
    if (setStatus) {
      batch.update(orderRef, { status: setStatus });
    }

    // Prise en charge
    if (hasSetAssigned) {
      if (setAssigned === true) {
        const when = Date.now();
        const updates: Record<string, any> = { assigned: true, assignedAt: when };
        if (data.priority == null) updates.priority = when; // init priority par défaut
        batch.update(orderRef, updates);
      } else {
        batch.update(orderRef, { assigned: false, assignedAt: null, priority: null });
      }
    }

    // Tri manuel
    if (hasSetPriority && Number.isFinite(setPriority)) {
      batch.update(orderRef, { priority: setPriority });
    }

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || 'Server error', { status: 500 });
  }
}
