"use client";

import React from 'react';

type Props = React.PropsWithChildren<{
  targetId: string;
  className?: string;
}>;

export default function SmoothScrollLink({ targetId, className, children }: Props) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Remove any existing hash without reloading
      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }
  };

  return (
    <a href={`#${targetId}`} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

