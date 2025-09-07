// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'service-account.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  throw new Error(`Fichier service-account.json introuvable à: ${SERVICE_ACCOUNT_PATH}`);
}

const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
const serviceAccount: any = JSON.parse(raw);

// Complète project_id depuis l'env si manquant
if (!serviceAccount.project_id && process.env.FIREBASE_PROJECT_ID) {
  serviceAccount.project_id = process.env.FIREBASE_PROJECT_ID;
}

// Garde une vérif stricte (évite l'erreur "project_id manquant")
if (typeof serviceAccount.project_id !== 'string' || !serviceAccount.project_id) {
  throw new Error('Le JSON service-account.json ne contient pas un "project_id" de type string.');
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    });

export const adminDb = getFirestore(app);
