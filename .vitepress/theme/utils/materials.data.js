// .vitepress/data/materials.data.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .vitepress/data/ → ../../src/materials
const SRC_DIR = path.resolve(__dirname, '../../../src/materials');
const URL_PREFIX = '/materials';

/** 文件扩展名 → 类型 */
function fileType(name) {
  const ext = path.extname(name).toLowerCase().slice(1);
  // const known = ['pdf', 'epub', 'md', 'zip', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  return ext;
}

/** 递归扫描目录，返回树节点数组 */
function scan(dir, urlPrefix) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const full = path.join(dir, entry.name);
    const rel = path.relative(SRC_DIR, full).split(path.sep).join('/');

    // 如果是空文件夹
    if (entry.isDirectory()) {
      const children = scan(full, urlPrefix);
      nodes.push({
        type: 'dir',
        name: entry.name,
        path: rel,
        children,
        count: children.reduce((s, c) => s + (c.type === 'dir' ? c.count : 1), 0),
      });
    } else {
      const stat = fs.statSync(full);

      nodes.push({
        type: 'file',
        name: entry.name,
        path: rel,
        ext: fileType(entry.name),
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        url: `${urlPrefix}/${rel}`,
      });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  return nodes;
}

/** 递归统计文件数 */
function countFiles(nodes) {
  return nodes.reduce((s, n) => s + (n.type === 'dir' ? countFiles(n.children) : 1), 0);
}

export default {
  /**
   * VitePress 会在构建/开发时调用 load()
   * 返回的对象会通过 `import { data }` 暴露给组件
   */
  load() {
    // 获取树
    const tree = scan(SRC_DIR, URL_PREFIX);
    // 统计数据
    const countFiles1 = countFiles(tree);
    return {
      tree,
      totalFiles: countFiles1,
      urlPrefix: URL_PREFIX,
    };
  },
};
