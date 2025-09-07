"use client";

import { formatDateTime } from '@/lib/utils';

export default function FormatDate({ ts, prefix }: { ts?: number | null; prefix?: string }) {
  const txt = formatDateTime(ts ?? undefined);
  return <span title={String(ts ?? '')}>{prefix ? `${prefix} ${txt}` : txt}</span>;
}

