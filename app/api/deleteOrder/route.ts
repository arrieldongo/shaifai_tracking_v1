// app/api/deleteOrder/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || token !== process.env.MANAGER_TOKEN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const body = await req.json();
    const orderId = String(body.orderId || '').trim();
    if (!orderId) return new NextResponse('orderId requis', { status: 400 });

    const ref = adminDb.collection('orders').doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) return new NextResponse('Commande introuvable', { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || 'Server error', { status: 500 });
  }
}
