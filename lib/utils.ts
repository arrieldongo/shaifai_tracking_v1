// lib/utils.ts
export function formatXOF(n?: number) {
  if (typeof n !== 'number') return '—';
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} FCFA`;
  }
}

export function formatDateTime(ts?: number | null) {
  if (!ts || !Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  const pad = (v: number) => String(v).padStart(2, '0');
  const JJ = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YYYY = d.getFullYear();
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${JJ}/${MM}/${YYYY} ${HH}:${mm}`;
}

export async function copyOrShare(url: string): Promise<'shared' | 'copied' | 'shown' | 'failed'> {
  if ((navigator as any).share) {
    try {
      await (navigator as any).share({ title: 'Suivi commande', url });
      return 'shared';
    } catch { /* continue */ }
  }
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return 'copied';
    }
  } catch { /* continue */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.readOnly = true;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok ? 'copied' : 'failed';
  } catch {
    try {
      window.prompt('Copiez le lien :', url);
      return 'shown';
    } catch {
      return 'failed';
    }
  }
}
