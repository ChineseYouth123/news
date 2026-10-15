export function fmtTime(t) {
  if (!t || !isFinite(t)) return '0:00';
  const total = Math.round(t);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
