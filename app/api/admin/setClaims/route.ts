// app/api/admin/setClaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { assertAdmin, getClaimsFromRequest } from '@/lib/apiAuth';
import '@/lib/firebaseAdmin';

type Body = {
  uid: string;
  admin?: boolean;           // true/false (optionnel)
  role?: 'manager' | 'courier';
  rid?: string;              // requis si role=manager|courier
  courierId?: string;        // utile si role=courier
};

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertAdmin(claims);

    const body = (await req.json()) as Body;
    if (!body?.uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

    const customClaims: Record<string, any> = {};
    if (typeof body.admin === 'boolean') customClaims.admin = body.admin;
    if (body.role) customClaims.role = body.role;
    if (body.rid) customClaims.rid = body.rid;
    if (body.courierId) customClaims.courierId = body.courierId;

    // Validation simple : si role spécifié, rid doit exister
    if ((body.role === 'manager' || body.role === 'courier') && !body.rid) {
      return NextResponse.json({ error: 'rid required for role' }, { status: 400 });
    }

    const adminAuth = getAuth();
    await adminAuth.setCustomUserClaims(body.uid, customClaims);

    // Invalide les sessions existantes (force refresh token côté client)
    await adminAuth.revokeRefreshTokens(body.uid);

    return NextResponse.json({ ok: true, claims: customClaims });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}

/*
But :
- Admin pose/retire des claims pour un utilisateur Firebase.
- Exemples :
  POST /api/admin/setClaims
  { "uid":"<UID>", "role":"manager", "rid":"resto_abc" }

  { "uid":"<UID>", "role":"courier", "rid":"resto_abc", "courierId":"c123" }

  { "uid":"<UID>", "admin": true }  // super admin
*/
