// .vitepress/data/materials.data.js
//
// 数据加载器（VitePress Data Loader）
// 构建时扫描「资料」目录，生成文件树，供 MaterialList.vue 使用
// 通过 `import { data } from './materials.data'` 在组件中读取
//
// 目录结构（示例）：
//   src/blog/资料/
//   ├─ pdf/
//   │  └─ manual.pdf
//   ├─ word/
//   │  └─ report.docx
//   └─ 测试.xlsx
//
// 输出结构：
//   {
//     tree: [
//       { type: 'dir', name: 'pdf', path: 'pdf', count: 1, children: [...] },
//       { type: 'file', name: '测试.xlsx', path: '测试.xlsx', ext: 'xlsx', url: '/资料/测试.xlsx', ... }
//     ],
//     totalFiles: 2,
//     urlPrefix: '/资料',
//   }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ============================================================
 * 当前文件所在目录的绝对路径
 * ESM 里没有 __dirname，用 fileURLToPath 从 import.meta.url 推导
 * 结果形如：/home/abc/test/notes/.vitepress/data
 * ============================================================ */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ============================================================
 * 要扫描的素材根目录
 *
 * 路径推导：
 *   __dirname        = /home/abc/test/notes/.vitepress/data
 *   ../../           = /home/abc/test/notes
 *   @/blog/资料      ← 这里有问题，见下方说明
 *
 * 正确写法应该是 path.resolve(__dirname, '../../src/blog/资料')
 * 或根据实际 srcDir 调整
 * ============================================================ */
const SRC_DIR = path.resolve(__dirname, '../../../src/blog/资料');

/* ============================================================
 * 生成 URL 时使用的前缀
 * 文件 /资料/manual.pdf 对应 URL 前缀 /资料
 * VitePress 会把它映射到 public/资料/ 或扫描目录对应的静态路径
 * ============================================================ */
const URL_PREFIX = '/blog/资料';

/* ============================================================
 * 根据文件名推断扩展名（类型）
 *
 * 输入：'manual.pdf'  → 'pdf'
 *       '测试.xlsx'   → 'xlsx'
 *       'file.unknow' → 'unknow'（原样返回扩展名，不认识的也返回）
 *
 * 注意：这里故意不做白名单过滤，把所有扩展名都返回，
 * 前端再根据 VIEW_PAGE_EXTS 决定是否走预览
 * ============================================================ */
function fileType(name) {
  const ext = path.extname(name).toLowerCase().slice(1);
  // 如需限制类型，取消注释并修改：
  // const known = ['pdf', 'epub', 'md', 'zip', 'txt', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  // return known.includes(ext) ? ext : 'file';
  return ext;
}

/* ============================================================
 * 递归扫描目录，返回树节点数组
 *
 * @param {string} dir        要扫描的绝对路径
 * @param {string} urlPrefix  生成 URL 时使用的前缀
 * @returns {Array}           节点数组（目录 + 文件混合）
 *
 * 目录节点结构：
 *   {
 *     type: 'dir',
 *     name: 'pdf',           // 目录名
 *     path: 'pdf',           // 相对 SRC_DIR 的路径
 *     children: [...],       // 子节点
 *     count: 3,              // 递归统计的文件数
 *   }
 *
 * 文件节点结构：
 *   {
 *     type: 'file',
 *     name: 'manual.pdf',
 *     path: 'pdf/manual.pdf',
 *     ext: 'pdf',
 *     size: 102400,
 *     mtime: '2026-10-16T...',
 *     url: '/资料/pdf/manual.pdf',
 *   }
 * ============================================================ */
function scan(dir, urlPrefix) {
  // 目录不存在时返回空数组，避免 ENOENT 报错
  if (!fs.existsSync(dir)) return [];

  // 读取目录内容（withFileTypes 能直接拿到 isDirectory/isFile）
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    // 跳过隐藏文件/目录（.git、.DS_Store 等）
    if (entry.name.startsWith('.')) continue;

    const full = path.join(dir, entry.name);

    // 相对 SRC_DIR 的路径，统一用 / 分隔（Windows 下 path.sep 是 \）
    const rel = path.relative(SRC_DIR, full).split(path.sep).join('/');

    if (entry.isDirectory()) {
      /* ---------- 目录节点：递归扫描子项 ---------- */
      const children = scan(full, urlPrefix);
      nodes.push({
        type: 'dir',
        name: entry.name,
        path: rel,
        children,
        // 递归统计文件数：子目录的 count 累加，文件计 1
        count: children.reduce((s, c) => s + (c.type === 'dir' ? c.count : 1), 0),
      });
    } else {
      /* ---------- 文件节点：读取 stat 拿大小和修改时间 ---------- */
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

  /* ---------- 排序 ----------
   * 规则：
   *   1. 目录在前，文件在后
   *   2. 同类型按名称拼音排序（zh-Hans-CN）
   */
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  return nodes;
}

/* ============================================================
 * 递归统计文件总数
 * 输入：scan 返回的节点数组
 * 输出：数字（不含目录）
 * ============================================================ */
function countFiles(nodes) {
  return nodes.reduce((s, n) => s + (n.type === 'dir' ? countFiles(n.children) : 1), 0);
}

/* ============================================================
 * 导出 Data Loader
 *
 * VitePress 在构建/开发时会调用 load()
 * 返回的对象会通过 `import { data } from './materials.data'` 暴露给组件
 * ============================================================ */
export default {
  load() {
    // 扫描目录，得到文件树
    const tree = scan(SRC_DIR, URL_PREFIX);

    // 调试用：打印树结构，排查扫描问题时打开
    console.log('[materials.data] tree =', tree);

    // 递归统计文件总数
    const totalFiles = countFiles(tree);

    // 返回给组件的对象
    return {
      tree,
      totalFiles,
      urlPrefix: URL_PREFIX,
    };
  },
};
