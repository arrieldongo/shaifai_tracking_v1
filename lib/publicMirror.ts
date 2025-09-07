// lib/publicMirror.ts
// Utilitaire côté serveur (Admin SDK) pour tenir à jour le miroir public.

import { Firestore } from "firebase-admin/firestore";

type PublicOrder = {
  id: string;
  clientCode?: string;
  zone: "sud" | "centre";
  roomNumber?: string;
  status: "pending" | "done";
  rid?: string;
  currentStepId?: string | null;
  assigned?: boolean;
  priority?: number;
  updatedAt: number;
};

export async function writePublicOrder(db: Firestore, orderId: string, data: PublicOrder) {
  const ref = db.doc(`public_orders/${orderId}`);
  await ref.set(data, { merge: true });
}

export async function deletePublicOrder(db: Firestore, orderId: string) {
  const ref = db.doc(`public_orders/${orderId}`);
  await ref.delete();
}

/*
Aperçu:
- writePublicOrder: écrit/merge le miroir public.
- deletePublicOrder: supprime l’entrée publique.
- À appeler depuis tes routes Admin SDK (create, update status, delete).
*/
