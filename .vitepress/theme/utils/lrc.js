// docs/.vitepress/theme/utils/lrc.js

/**
 * 解析 LRC 文本为 [{ time, text }]
 * 支持：
 *   [mm:ss.xx] 歌词
 *   [mm:ss.xxx] 歌词
 *   [mm:ss] 歌词
 * 忽略元信息标签（[ti:] [ar:] [al:] 等）
 */
export function parseLRC(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const out = [];
  const timeReg = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

  for (const raw of lines) {
    const matches = [...raw.matchAll(timeReg)];
    if (!matches.length) continue;
    const content = raw.replace(timeReg, '').trim();
    if (!content) continue;

    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
      const time = min * 60 + sec + ms / 1000;
      out.push({ time, text: content });
    }
  }

  return out.sort((a, b) => a.time - b.time);
}
