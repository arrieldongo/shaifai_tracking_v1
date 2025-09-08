import fs from 'fs';
import path from 'path';

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
    <main className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">shaifai créa</h1>
        <p className="text-slate-600 mt-1">Affiches réalisées par des graphistes pro</p>
      </header>

      {images.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune affiche trouvée dans <code>public/crrea</code>.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"><div className="hidden" />
          {images.map((src, i) => (
            <div key={src} className="mb-4 break-inside-avoid rounded-xl overflow-hidden border bg-white shadow-sm">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`crea-${i}`} className="w-full h-auto object-cover" />
                <a
                  href={wa(src)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 text-xs px-3 py-1.5 rounded bg-black/80 text-white hover:bg-black"
                >
                  comme ça
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-lg font-semibold">Vous voulez un crréa…</div>

      <div className="mt-8 text-center">
        <a href={wa()} target="_blank" rel="noreferrer" className="inline-block text-sm px-4 py-2 rounded bg-black text-white">
          Nous écrire sur WhatsApp
        </a>
      </div>
    </main>
  );
}

