// components/courier/TimelineZone.tsx
"use client";
import type { Step, Zone } from "@/lib/types";
import TimelineItem from "./TimelineItem";

type Props = {
  zone: Zone;
  fixedSteps: Step[];
  orderSteps: Step[];
  currentStepId?: string | null;
  onToggleHere: (id: string) => void;
  onTogglePending: (id: string) => void;
  readonly?: boolean;
  highlightStepId?: string;
  highlightLabel?: string; // ex: "Vous"
};

function computeStatus(all: Step[], currentId?: string | null): Step[] {
  if (!currentId) {
    return all.map((s, i) => ({ ...s, status: i === 0 ? "in_progress" : "upcoming" }));
  }
  const idx = all.findIndex(s => s.id === currentId);
  return all.map((s, i) => ({
    ...s,
    status: idx === -1 ? (i === 0 ? "in_progress" : "upcoming") : i < idx ? "reached" : i === idx ? "in_progress" : "upcoming",
  }));
}

export default function TimelineZone({
  zone, fixedSteps, orderSteps, currentStepId, onToggleHere, onTogglePending, readonly, highlightStepId, highlightLabel,
}: Props) {
  const seq = [...fixedSteps, ...orderSteps];
  const all = computeStatus(seq, currentStepId);

  return (
    <section className="max-w-3xl mx-auto">
      <h2 className="font-title font-black text-2xl mb-4">Itinéraire {zone.toUpperCase()}</h2>
      <div className="grid gap-2">
        {all.map((s) => (
          <TimelineItem
            key={s.id}
            step={s}
            isCurrent={currentStepId === s.id}
            onToggleHere={onToggleHere}
            onTogglePending={onTogglePending}
            readonly={readonly}
            badge={highlightStepId && s.id === highlightStepId ? (highlightLabel || 'Vous') : undefined}
          />
        ))}
      </div>
    </section>
  );
}
