// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Initialisation robuste pour dev (service-account.json) et prod (Firebase Hosting/Functions)
function initAdmin() {
  if (getApps().length) return getApps()[0]!;

  // En environnement Functions/Hosting, FIREBASE_CONFIG est défini et applicationDefault suffit
  const isFirebaseEnv = !!process.env.FIREBASE_CONFIG || !!process.env.K_SERVICE || !!process.env.FUNCTION_TARGET;

  if (isFirebaseEnv) {
    return initializeApp({ credential: applicationDefault() });
  }

  // Local dev: on tente service-account.json si présent
  const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    const serviceAccount: any = JSON.parse(raw);
    const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID;
    return initializeApp({ credential: cert(serviceAccount as any), projectId });
  }

  // Fallback: applicationDefault (ex: GOOGLE_APPLICATION_CREDENTIALS)
  return initializeApp({ credential: applicationDefault() });
}

const app = initAdmin();
export const adminDb = getFirestore(app);
