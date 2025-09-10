"use client";

import { useEffect, useState } from 'react';

export default function CreaGallery({ images }: { images: string[] }) {
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

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      {images.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune affiche trouvée dans <code>public/crrea</code>.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"><div className="hidden" />
          {images.map((src, i) => (
            <div key={src} className="mb-4 break-inside-avoid rounded-xl overflow-hidden border bg-white shadow-sm cursor-pointer" onClick={() => onOpen(src)}>
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`crea-${i}`} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                <a
                  href={wa(src)}
                  onClick={(e) => e.stopPropagation()}
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

      {/* Lightbox */}
      {open && current && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt="preview" className="w-full h-auto object-contain max-h-[80vh] rounded-xl shadow-2xl bg-white" />
            <div className="mt-3 flex items-center justify-between">
              <a href={wa(current)} target="_blank" rel="noreferrer" className="inline-block text-sm px-4 py-2 rounded bg-[#10B981] text-white">comme ça</a>
              <button onClick={onClose} className="text-sm px-4 py-2 rounded border bg-white hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

