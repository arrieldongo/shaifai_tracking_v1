// components/courier/CourierRouteList.tsx
"use client";
import { useEffect, useState } from "react";
import type { Step, Zone } from "@/lib/types";
import { reorder } from "@/lib/api";

type Props = {
  sud: Step[];     // seulement steps de type 'order' (zone=sud)
  centre: Step[];  // seulement steps de type 'order' (zone=centre)
};

export default function CourierRouteList({ sud, centre }: Props) {
  // Local state pour feedback immédiat
  const [sudList, setSudList] = useState<Step[]>(sud);
  const [centreList, setCentreList] = useState<Step[]>(centre);
  const [saving, setSaving] = useState<null | Zone>(null);

  useEffect(() => setSudList(sud), [sud]);
  useEffect(() => setCentreList(centre), [centre]);

  const move = (zone: Zone, id: string, dir: "up" | "down") => {
    const list = zone === "sud" ? [...sudList] : [...centreList];
    const i = list.findIndex((s) => s.id === id);
    if (i < 0) return;
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return;
    const [m] = list.splice(i, 1);
    list.splice(j, 0, m);
    zone === "sud" ? setSudList(list) : setCentreList(list);
    persist(zone, list.map((s) => s.id));
  };

  // Sauvegarde simple: priorité = index + 1 (1,2,3, …)
  const persist = async (_zone: Zone, orderedIds: string[]) => {
    try {
      setSaving(_zone);
      const items = orderedIds.map((orderId, i) => ({ orderId, priority: i + 1 }));
      await reorder(items);
    } finally {
      setSaving(null);
    }
  };

  const Section = ({ zone, items, title }: { zone: Zone; items: Step[]; title: string }) => (
    <section className="mb-8">
      <h3 className="font-title font-black text-xl mb-3">
        {title} {saving === zone && <span className="text-sm font-normal text-gray-500">(sauvegarde…)</span>}
      </h3>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500 border rounded-xl p-4">Aucune commande pour cette zone.</div>
      ) : (
        <ul className="grid gap-2">
          {items.map((s, idx) => (
            <li key={s.id} className="flex items-center gap-3 bg-white rounded-xl border p-3">
              <img src={s.image} alt="" className="size-10 rounded-md object-cover" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-gray-500">#{idx + 1}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => move(zone, s.id, "up")}
                  className="px-2 py-1 rounded-lg border hover:bg-gray-50 active:scale-[0.98]"
                  disabled={idx === 0 || saving === zone}
                  title="Monter"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(zone, s.id, "down")}
                  className="px-2 py-1 rounded-lg border hover:bg-gray-50 active:scale-[0.98]"
                  disabled={idx === items.length - 1 || saving === zone}
                  title="Descendre"
                >
                  ▼
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-title font-black text-2xl mb-4">Ordre des livraisons</h2>
      <Section zone="centre" items={centreList} title="Ordre des livraisons Centre" />
      <Section zone="sud" items={sudList} title="Ordre des livraisons Sud" />
    </div>
  );
}
