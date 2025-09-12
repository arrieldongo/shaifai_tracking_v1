// app/crréa/page.tsx (ou src/app/crréa/page.tsx)
// Pinterest-like masonry, 2 colonnes sur mobile, CTA améliorés,
// header avec dégradés (orange, noir, beige) + "Bienvenue chez Crréa".

import fs from 'fs';
import path from 'path';
import { FaWhatsapp } from 'react-icons/fa';
import CreaMasonry from '@/components/CreaMasonry';

function listCreas(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'crrea');
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
      .map((f) => `/crrea/${f}`);
  } catch {
    return [];
  }
}

export default function CreaPage() {
  const images = listCreas();
  const wa = (img?: string) => {
    const base = 'https://wa.me/2250799239383';
    const msg = `Bonjour, je veux une créa comme celle-ci${img ? `: ${img}` : ''}`;
    return `${base}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-4">
        <a href="/" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50">
          <span>←</span>
          <span>Retour</span>
        </a>
      </div>
      {/* Header */}
      <header className="mb-8 sm:mb-12">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="-m-1.5 text-xl md:text-2xl text-gray-300 font-extrabold tracking-tighter whitespace-nowrap">
            Bienvenue chez
          </p>
          <span
            className="text-8xl bg-clip-text text-transparent font-extrabold tracking-tighter whitespace-nowrap"
            style={{ backgroundImage: 'linear-gradient(90deg,#f4762d,#ffd78a)' }}
          >
            Crréa
          </span>
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mt-8"
            style={{
              WebkitTextFillColor: 'transparent',
              backgroundImage: 'linear-gradient(90deg,#FB923C,#111827)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            Quel genre d'affiche voulez vous ?
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mt-3 max-w-2xl tracking-tighter">
            Inspirez-vous, cliquez, et commandez la vôtre en un message.
          </p>
        </div>

      </header>

      {/* Masonry façon Pinterest + Lightbox (client) */}
      <CreaMasonry images={images} />

      {/* Call-to-action global */}
      <div className="mt-10 sm:mt-12 text-center">
        <a
          href={wa()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#f4762d] text-white px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg hover:brightness-105"
        >
          <FaWhatsapp className="text-white/90" />
          Ajouter mes crréas
        </a>
      </div>

      {/* Notes: */}
      {/* - Masonry via CSS columns : 2 colonnes sur mobile, 3 en md, 4 en xl. */}
      {/* - Chaque carte a un overlay tag et un CTA WhatsApp en pill. */}
      {/* - Header : dégradé orange→noir→beige sur la question, dégradé vert→indigo sur "Crréa". */}
    </main>
  );
}
