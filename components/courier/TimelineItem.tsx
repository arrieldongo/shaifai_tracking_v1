// components/courier/TimelineItem.tsx
"use client";
import type { Step } from "@/lib/types";
import Badge from "@/components/Badge";

type Props = {
  step: Step;
  isCurrent: boolean;
  onToggleHere: (id: string) => void;
  onTogglePending: (id: string) => void;
  readonly?: boolean;
  badge?: string; // ex: "Vous" pour marquer la commande du client
};

export default function TimelineItem({ step, isCurrent, onToggleHere, onTogglePending, readonly, badge }: Props) {
  const { image, label, status, color } = step;

  const lineBase = "w-[3px] mx-auto h-16";
  const lineColor = status === "reached" || status === "in_progress" ? color : "#D1D5DB";
  const line =
    status === "in_progress" ? (
      <div className={`${lineBase} border-l-2`} style={{ borderColor: lineColor }} />
    ) : (
      <div className={lineBase} style={{ backgroundColor: lineColor }} />
    );

  const grayscale = status === "upcoming" ? "grayscale" : status === "in_progress" ? "grayscale-[55%]" : "";

  return (
    <div className="grid grid-cols-[56px_1fr] gap-4">
      <div className="flex flex-col items-center">
        <div className="size-14 rounded-full overflow-hidden ring-2 ring-white shadow">
          <img src={image} alt={label} className={`size-full object-cover ${grayscale}`} />
        </div>
        {line}
      </div>

      <div className="pb-6">
        <div className={`flex items-center gap-2 text-base font-semibold ${status === "upcoming" ? "text-gray-400" : "text-gray-700"}`}>
          <span>{label}</span>
          {badge && (
            <span className="inline-flex items-center">
              <Badge variant="blue">{badge}</Badge>
            </span>
          )}
        </div>

        <div className="mt-1">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full ${
              status === "reached"
                ? "bg-gray-100 text-gray-700"
                : status === "in_progress"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {status === "reached" ? "Passé" : status === "in_progress" ? "En cours" : "À venir"}
          </span>
        </div>

        {!readonly && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onToggleHere(step.id)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition active:scale-[0.98] ${
                isCurrent ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title="Marquer ICI (toggle unique)"
            >
              {isCurrent ? "Ici ON" : "Ici OFF"}
            </button>

            {/* NB: pour les steps 'order', on branchera sur /api/orders/setPending */}
            <button
              onClick={() => onTogglePending(step.id)}
              className="px-3 py-1.5 rounded-lg text-xs border bg-white text-gray-700 hover:bg-gray-50 transition active:scale-[0.98]"
              title="Basculer Pending"
              disabled={step.kind !== "order"}   // ⬅️ pas de pending sur les étapes fixes
            >
              Pending
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
