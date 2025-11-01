import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Évite d'échouer le build à cause du lint (déploiement initial)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionnel: tolère des erreurs TS au build si nécessaire
    ignoreBuildErrors: true,
  },
  images: {
    // Désactive l'optimisation côté serveur (utile sur hébergements sans route /_next/image)
    unoptimized: true,
  },
};

export default nextConfig;
