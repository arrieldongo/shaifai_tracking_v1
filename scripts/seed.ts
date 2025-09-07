// scripts/seed.ts
import 'dotenv/config';
import { adminDb } from '../lib/firebaseAdmin';

async function main() {
  const courierId = 'main-courier';
  const steps = ['A', 'B', 'C', 'D', 'E', 'F'];
  const clientCodes = ['abc123','def456','ghi789','jkl012','mno345','pqr678'];

  // 1) Upsert du courier (itinéraire global)
  await adminDb.collection('couriers').doc(courierId).set(
    {
      steps,
      currentStepIndex: 0,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  // 2) 6 commandes fictives (une par étape)
  const batch = adminDb.batch();
  clientCodes.forEach((code, i) => {
    const ref = adminDb.collection('orders').doc();
    batch.set(ref, {
      courierId,
      clientCode: code,
      destinationStepIndex: i, // A→F = 0..5
      status: 'pending',
      createdAt: Date.now(),
    });
  });
  await batch.commit();

  console.log('✅ Seed OK : courier + 6 orders créés.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  });
