// app/api/updateProgress/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || token !== process.env.COURIER_GLOBAL_TOKEN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { courierId } = await req.json();
    if (!courierId) {
      return new NextResponse('courierId manquant', { status: 400 });
    }

    const ref = adminDb.collection('couriers').doc(courierId);
    const snap = await ref.get();
    if (!snap.exists) {
      return new NextResponse('Courier introuvable', { status: 404 });
    }

    const data = snap.data()!;
    const steps: string[] = data.steps || [];
    const currentStepIndex: number = typeof data.currentStepIndex === 'number' ? data.currentStepIndex : 0;

    const nextIndex = Math.min(currentStepIndex + 1, Math.max(steps.length - 1, 0));

    await ref.update({
      currentStepIndex: nextIndex,
      updatedAt: Date.now(),
    });

    // Marquer en "done" les commandes dont la destination est <= étape atteinte
    const ordersSnap = await adminDb
      .collection('orders')
      .where('courierId', '==', courierId)
      .get();

    const batch = adminDb.batch();
    ordersSnap.forEach(doc => {
      const o = doc.data() as any;
      if (typeof o.destinationStepIndex === 'number' && o.destinationStepIndex <= nextIndex) {
        batch.update(doc.ref, { status: 'done' });
      }
    });
    await batch.commit();

    return NextResponse.json({ ok: true, nextIndex });
  } catch (e: any) {
    return new NextResponse(e.message || 'Server error', { status: 500 });
  }
}
