// lib/apiAuth.ts
// Vérifications d'auth pour les routes /api/** (Next.js App Router)

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import '@/lib/firebaseAdmin'; // s'assure que l'Admin SDK est initialisé

export type AppRole = 'admin' | 'manager' | 'courier';

export type AppClaims = {
  uid: string;
  admin?: boolean;
  role?: AppRole;
  rid?: string;
  courierId?: string;
};

export const adminAuth = getAuth();
export const adminDb = getFirestore();

export async function getClaimsFromRequest(req: NextRequest): Promise<AppClaims> {
  const authz = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authz || !authz.startsWith('Bearer ')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const idToken = authz.slice('Bearer '.length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      admin: Boolean(decoded.admin),
      role: (decoded.role as AppRole) || undefined,
      rid: (decoded.rid as string) || undefined,
      courierId: (decoded.courierId as string) || undefined,
    };
  } catch (e) {
    throw new Response('Invalid token', { status: 401 });
  }
}

export function assertAdmin(claims: AppClaims) {
  if (!claims.admin) throw new Response('Forbidden: admin only', { status: 403 });
}

export function assertRole(claims: AppClaims, role: AppRole) {
  if (claims.admin) return; // admin passe
  if (claims.role !== role) throw new Response(`Forbidden: ${role} only`, { status: 403 });
}

export function assertRidMatch(claims: AppClaims, rid: string) {
  if (claims.admin) return;
  if (!claims.rid || claims.rid !== rid) {
    throw new Response('Forbidden: rid mismatch', { status: 403 });
  }
}

/*
Aperçu:
- getClaimsFromRequest: lit Bearer <idToken> et renvoie { uid, admin, role, rid, courierId }.
- assertAdmin / assertRole / assertRidMatch: gardes réutilisables.
- adminDb: Firestore Admin pour écrire en toute sécurité.
*/
