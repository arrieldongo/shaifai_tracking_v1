// components/HeaderTabs.tsx
'use client';

type Tab = { key: string; label: string };

type LeftIcon = 'home' | 'list' | 'back';

export default function HeaderTabs({
  leftIcon = 'back',
  onLeftClick,
  title,                 // ex: "Détails des livraisons"
  tabs,                  // ex: [{key:'sud', label:'Sud'}, {key:'centre', label:'Centre'}]
  activeKey,
  onTabChange,
  segmented = true,      // affiche un switch segmenté comme sur le mock
  className = '',
}: {
  leftIcon?: LeftIcon;
  onLeftClick?: () => void;
  title?: string;
  tabs: Tab[];
  activeKey: string;
  onTabChange: (key: string) => void;
  segmented?: boolean;
  className?: string;
}) {
  return (
    <header className={`flex items-center gap-3 p-3 ${className}`}>

      {/* ______Bouton gauche : cercle noir avec icône blanche_______ */}
      <button
        onClick={onLeftClick}
        className="w-12 h-12 rounded-full bg-black text-white grid place-items-center 
             transition hover:bg-gray-800 active:scale-[0.95]"
        aria-label="Retour"
      >

        {leftIcon === 'home' ? (
          <svg width="36" height="36" viewBox="0 0 24 24" className="text-white">
            <path fill="currentColor" d="M12 3l8 7h-3v8h-4v-5H11v5H7v-8H4l8-7z" />
          </svg>
        ) : leftIcon === 'list' ? (
          <svg width="36" height="36" viewBox="0 0 24 24" className="text-white">
            <path fill="currentColor" d="M4 6h16v2H4V6m0 5h16v2H4v-2m0 5h16v2H4v-2z" />
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" className="text-white">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z" />
          </svg>
        )}
      </button>

      {/*____PAS UTILISÉ____ Titre en pilule noire */}
      {title && (
        <div className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold">
          {title}
        </div>
      )}

      {/* ______Segmented control_______ */}
      <nav>
        {segmented ? (
          <div className="inline-flex rounded-2xl bg-gray-200 p-1">
            {tabs.map((t) => {
              const active = t.key === activeKey;   // si activeKey ne correspond à rien -> aucun actif
              return (
                <button
                  key={t.key}
                  onClick={() => onTabChange(t.key)}
                  className={`px-10 py-3 text-[16px] font-[600] rounded-2xl transition
        ${active
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-700 bg-transparent hover:bg-slate-100 active:scale-[0.98]"
                    }`}
                >
                  {t.label}
                </button>
              );
            })}

          </div>
        ) : (
          <div className="flex items-center gap-2">
            {tabs.map((t) => {
              const active = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => onTabChange(t.key)}
                  className={`px-3 py-1.5 rounded text-sm transition
        ${active
                      ? "bg-black text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]"
                    }`}
                >
                  {t.label}
                </button>
              );
            })}

          </div>
        )}
      </nav>
    </header >
  );
}
