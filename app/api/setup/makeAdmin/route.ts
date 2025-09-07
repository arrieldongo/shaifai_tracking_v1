// app/api/setup/makeAdmin/route.ts
// One-time setup endpoint to promote a user to admin using a shared secret.
// Usage (DEV ONLY):
//   GET /api/setup/makeAdmin?uid=<UID>&secret=<SETUP_SECRET>
//   or
//   GET /api/setup/makeAdmin?email=<EMAIL>&secret=<SETUP_SECRET>

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.SETUP_SECRET;
    if (!secret) return NextResponse.json({ error: 'SETUP_SECRET not configured' }, { status: 500 });

    const q = req.nextUrl.searchParams;
    const provided = q.get('secret') || '';
    if (provided !== secret) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const uid = q.get('uid') || '';
    const email = q.get('email') || '';
    if (!uid && !email) return NextResponse.json({ error: 'uid or email required' }, { status: 400 });

    const adminAuth = getAuth();
    const user = uid ? await adminAuth.getUser(uid) : await adminAuth.getUserByEmail(email);

    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    await adminAuth.revokeRefreshTokens(user.uid);

    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}

