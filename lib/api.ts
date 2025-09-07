// lib/api.ts
import { auth } from '@/lib/firebase';
import type { Order, Zone } from '@/lib/types';

type Opts = RequestInit & { parseJson?: boolean };

export async function apiFetch<T = unknown>(path: string, opts: Opts = {}): Promise<T | Response> {
  const u = auth.currentUser;
  const idToken = u ? await u.getIdToken(/* forceRefresh */ false) : null;

  const headers = new Headers(opts.headers || {});
  headers.set('Content-Type', 'application/json');
  if (idToken) headers.set('Authorization', `Bearer ${idToken}`);

  const res = await fetch(path, { ...opts, headers });
  if (!opts.parseJson && (res.headers.get('content-type') || '').includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res;
}

/*
Aperçu:
- Ajoute automatiquement Authorization: Bearer <ID token>.
- Évite d’éparpiller la logique d’auth dans les composants.
*/

// ---- Helpers métier côté client ----

export async function createOrder(input: {
  clientCode?: string;
  zone: Zone;
  roomNumber?: string;
  phone?: string;
  priority?: number;
}): Promise<{ ok: true; id: string }>
{
  return apiFetch<{ ok: true; id: string }>(`/api/createOrder`, {
    method: 'POST',
    body: JSON.stringify(input),
  }) as Promise<{ ok: true; id: string }>;
}

export async function setPending(orderId: string, status?: 'pending' | 'done') {
  return apiFetch<{ ok: true }>(`/api/orders/setPending`, {
    method: 'POST',
    body: JSON.stringify({ orderId, status }),
  });
}

export async function reorder(items: Array<{ orderId: string; priority: number }>) {
  return apiFetch<{ ok: true; count: number }>(`/api/orders/reorder`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function toggleHere(courierId: string, stepId: string | null) {
  return apiFetch<{ ok: true }>(`/api/courier/toggleHere`, {
    method: 'POST',
    body: JSON.stringify({ courierId, stepId }),
  });
}

export async function assignOrder(orderId: string, assigned: boolean = true, _courierId?: string) {
  return apiFetch<{ ok: true }>(`/api/orders/assign`, {
    method: 'POST',
    body: JSON.stringify({ orderId, assigned }),
  });
}

export async function deleteOrder(orderId: string) {
  return apiFetch<{ ok: true }>(`/api/orders/delete`, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

// setCourier removed (courierId not tracked on orders anymore)
