shaifai — Services hub (tracking + créa)

Monorepo front (Next.js App Router) pour les services shaifai:
- Vitrine: page d’accueil avec sections hero et services.
- Crréa: galerie d’affiches (masonry) + lightbox + CTA WhatsApp.
- Tracking: hub et espaces Admin, Gérant, Livreur, suivi client.

Déploiement: Firebase Hosting (frameworks backend activé).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Prérequis
- Node 18+
- Firebase CLI (`npm i -g firebase-tools`)

Scripts
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

Déploiement Firebase (résumé)
1) `firebase login`
2) Remplacer le project id dans `.firebaserc`
3) `firebase deploy`

# shaifai_tracking_v1
