// scripts/bootstrapAdmin.cjs
// Bootstraps an initial admin by setting { admin: true } on a user.
// Usage:
//   node scripts/bootstrapAdmin.cjs --email you@example.com
// or
//   node scripts/bootstrapAdmin.cjs --uid <FIREBASE_UID>

require('dotenv/config');
const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), 'service-account.json');
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Missing service account JSON at ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}
const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
const creds = JSON.parse(raw);
if (!creds.project_id && process.env.FIREBASE_PROJECT_ID) {
  creds.project_id = process.env.FIREBASE_PROJECT_ID;
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(creds), projectId: creds.project_id });
}

const adminAuth = getAuth();

function parseArgs(argv) {
  const out = { email: null, uid: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email') out.email = argv[++i];
    else if (a === '--uid') out.uid = argv[++i];
  }
  return out;
}

async function main() {
  const { email, uid } = parseArgs(process.argv);
  let targetUid = uid;
  if (!targetUid && email) {
    const u = await adminAuth.getUserByEmail(email);
    targetUid = u.uid;
  }
  if (!targetUid) {
    console.error('Provide --email or --uid');
    process.exit(1);
  }

  await adminAuth.setCustomUserClaims(targetUid, { admin: true });
  await adminAuth.revokeRefreshTokens(targetUid);
  console.log(`✅ Admin claim set on UID=${targetUid}. Ask user to re-login.`);
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
