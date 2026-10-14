import { createContentLoader } from "vitepress";

// ============ 安全解析日期 ============
function toDate(v) {
  if (v instanceof Date) return v;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? new Date(0) : d;
}

// ============ 创建 Data Loader ============
export default createContentLoader("blog/posts/**/*.md", {
  excerpt: false,

  transform(raw) {
    if (!raw || raw.length === 0) {
      return { total: 0, posts: [], groups: [], tags: [] };
    }

    // ---------- 1. 归一化 ----------
    const posts = raw
      .map((p) => {
        const fm = p.frontmatter || {};
        const d = toDate(fm.date);
        return {
          url: p.url,
          title: String(fm.title ?? "未命名文章"),
          date: d.getTime(),
          dateStr: d.toISOString().slice(0, 10),
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          categories: Array.isArray(fm.categories) ? fm.categories : [],
          description: String(fm.description ?? ""),
          top: Boolean(fm.top),
          cover: String(fm.cover ?? ""),
        };
      })
      // ---------- 2. 排序：置顶优先，其次日期倒序 ----------
      .sort((a, b) => {
        if (a.top !== b.top) return a.top ? -1 : 1;
        return b.date - a.date;
      });

    // ---------- 3. 按年月分组 ----------
    const map = new Map();
    for (const p of posts) {
      const d = new Date(p.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${y} 年 ${m} 月`,
          items: [],
        });
      }
      map.get(key).items.push(p);
    }

    // ---------- 4. 所有标签去重并排序 ----------
    const tagSet = new Set();
    for (const p of posts) for (const t of p.tags) tagSet.add(t);

    return {
      total: posts.length,
      posts,
      groups: [...map.values()],
      tags: [...tagSet].sort(),
    };
  },
});
