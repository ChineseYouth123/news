/**
 * 秒数 → mm:ss
 * @param {number} t 秒数
 * @returns {string} 形如 "3:45"
 */
export function fmtTime(t) {
  if (!t || !isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
