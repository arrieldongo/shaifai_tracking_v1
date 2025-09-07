// components/Badge.tsx
'use client';

import React from 'react';

type Variant = 'green' | 'yellow' | 'gray' | 'red' | 'blue';

const styles: Record<Variant, string> = {
  green: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  gray: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  red: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  blue: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
};

export default function Badge({
  children,
  variant = 'gray',
  className = '',
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[variant]} ${className}`}>{children}</span>
  );
}
