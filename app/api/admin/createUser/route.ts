// app/api/admin/createUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { assertAdmin, getClaimsFromRequest } from '@/lib/apiAuth';
import '@/lib/firebaseAdmin';

type Body = {
  email: string;
  password: string;
  role?: 'manager' | 'courier';
  rid?: string;
  courierId?: string;
  admin?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertAdmin(claims);

    const body = (await req.json()) as Body;
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: 'email & password required' }, { status: 400 });
    }

    const adminAuth = getAuth();
    const u = await adminAuth.createUser({ email: body.email, password: body.password });

    const customClaims: Record<string, any> = {};
    if (typeof body.admin === 'boolean') customClaims.admin = body.admin;
    if (body.role) customClaims.role = body.role;
    if (body.rid) customClaims.rid = body.rid;
    if (body.courierId) customClaims.courierId = body.courierId;

    if (Object.keys(customClaims).length > 0) {
      await adminAuth.setCustomUserClaims(u.uid, customClaims);
      await adminAuth.revokeRefreshTokens(u.uid);
    }

    return NextResponse.json({ ok: true, uid: u.uid, claims: customClaims });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 });
  }
}

/*
But :
- Admin crée un user + (optionnel) pose role/rid/courierId/admin en 1 appel.
*/
