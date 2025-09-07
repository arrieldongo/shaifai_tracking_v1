// scripts/seed.cjs (CommonJS)
require('dotenv/config');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json';
if (!fs.existsSync(credsPath)) {
  throw new Error('Service account JSON manquant. Vérifie GOOGLE_APPLICATION_CREDENTIALS et service-account.json');
}
const serviceAccount = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = getFirestore();

async function main() {
  const courierId = 'main-courier';
  const steps = ['A', 'B', 'C', 'D', 'E', 'F'];
  const clientCodes = ['abc123','def456','ghi789','jkl012','mno345','pqr678'];

  await db.collection('couriers').doc(courierId).set(
    {
      steps,
      currentStepIndex: 0,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  const batch = db.batch();
  clientCodes.forEach((code, i) => {
    const ref = db.collection('orders').doc();
    batch.set(ref, {
      courierId,
      clientCode: code,
      destinationStepIndex: i,
      status: 'pending',
      createdAt: Date.now(),
    });
  });
  await batch.commit();

  console.log('✅ Seed OK : courier + 6 orders créés.');
}

main().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
