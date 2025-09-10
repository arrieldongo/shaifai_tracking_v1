"use client";

import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function CreaMasonry({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const wa = (img?: string) => {
    const base = 'https://wa.me/2250799239383';
    const msg = `Bonjour, je veux une créa comme celle-ci${img ? `: ${img}` : ''}`;
    return `${base}?text=${encodeURIComponent(msg)}`;
  };

  const onOpen = (src: string) => {
    setCurrent(src);
    setOpen(true);
  };
  const onClose = () => setOpen(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      {images.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune affiche trouvée dans <code>public/crrea</code>.</p>
      ) : (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
          <div className="hidden" />
          {images.map((src, i) => (
            <article
              key={src}
              className="mb-4 break-inside-avoid rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm group relative cursor-pointer"
              onClick={() => onOpen(src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`crea-${i}`} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              <a
                href={wa(src)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-sm text-white/95 px-3.5 py-2 text-[12px] sm:text-sm font-semibold shadow-lg hover:brightness-110 active:translate-y-[1px] transition"
              >
                <FaWhatsapp className="text-[#25D366]" />
                Comme ça
              </a>
            </article>
          ))}
        </div>
      )}

      {open && current && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt="preview" className="w-full h-auto object-contain max-h-[80vh] rounded-xl shadow-2xl bg-white" />
            <div className="mt-3 flex items-center justify-between">
              <a href={wa(current)} target="_blank" rel="noreferrer" className="inline-block text-sm px-4 py-2 rounded bg-[#10B981] text-white">Comme ça</a>
              <button onClick={onClose} className="text-sm px-4 py-2 rounded border bg-white hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

