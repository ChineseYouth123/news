<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vitepress";
import { data as materialsData } from "../utils/materials.data"

const { tree, totalFiles } = materialsData;
const router = useRouter();

/* ---------- 当前路径：数组形式的节点链 ---------- */
const stack = ref([]);   // [{ name, path, node }]

/* 当前节点下的 children（root 时取 tree） */
const currentList = computed(() => {
  if (stack.value.length === 0) return tree;
  const last = stack.value[stack.value.length - 1];
  return last.node.children ?? [];
});

/* 面包屑：始终以「全部」开头 */
const breadcrumbs = computed(() => [
  { name: '全部资料', path: '' },
  ...stack.value.map((s) => ({ name: s.name, path: s.path }))
]);

/* ---------- 交互 ---------- */
function enterDir(node) {
  stack.value.push({ name: node.name, path: node.path, node });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function jumpTo(index) {
  // index = -1 表示「全部」
  if (index < 0) stack.value = [];
  else stack.value = stack.value.slice(0, index + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openFile(node) {
  if (node.ext === 'md') {
    // 站内 md 直接通过 VitePress 路由读取
    // md 文件我们放在 src/materials，需要先在 docs 里建立对应软链/副本
    // 简化方案：md 也用 /resources/ 前缀直接跳转
    const openMdUrl=node.url.slice(0, -3)
    router.go(openMdUrl);
  } else {
    window.open(node.url, '_blank', 'noopener');
  }
}

/* ---------- 展示辅助 ---------- */
const TYPE_LABEL = { pdf: 'PDF', epub: 'EPUB', md: 'MD', zip: 'ZIP', txt: 'TXT' };
function typeLabel(ext) { return TYPE_LABEL[ext] ?? ext.toUpperCase(); }

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
</script>

<template>
  <div class="news-page material-browser">
    <header class="news-header">
      <h1>资料文件</h1>
      <p class="count">
        共 <span class="num">{{ totalFiles }}</span> 份文件
      </p>
    </header>

    <!-- 面包屑 -->
    <nav class="mb-breadcrumb" aria-label="目录导航">
      <template v-for="(c, i) in breadcrumbs" :key="c.path">
        <span v-if="i > 0" class="mb-sep">/</span>
        <button
          class="mb-crumb"
          :class="{ active: i === breadcrumbs.length - 1 }"
          @click="jumpTo(i - 1)"
        >{{ c.name }}</button>
      </template>
    </nav>

    <!-- 列表 -->
    <ul v-if="currentList.length" class="mb-list">
      <li v-for="node in currentList" :key="node.path">
        <!-- 目录 -->
        <div
          v-if="node.type === 'dir'"
          class="mb-item mb-item--dir"
          @click="enterDir(node)"
        >
          <span class="mb-icon mb-icon--dir">📁</span>
          <span class="mb-name">{{ node.name }}</span>
          <span class="mb-count">{{ node.count }} 项</span>
          <span class="mb-arrow">›</span>
        </div>

        <!-- 文件 -->
        <div
          v-else
          class="mb-item mb-item--file"
          @click="openFile(node)"
        >
          <span
            class="material-type-badge"
            :data-type="node.ext"
          >{{ typeLabel(node.ext) }}</span>
          <span class="mb-name">{{ node.name }}</span>
          <span class="mb-meta">
            <span v-if="node.size">{{ formatSize(node.size) }}</span>
          </span>
          <span class="mb-arrow mb-arrow--ext">↗</span>
        </div>
      </li>
    </ul>

    <p v-else class="news-empty">此目录为空</p>
  </div>
</template>
