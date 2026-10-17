<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vitepress';
import { data as materialsData } from '../utils/materials.data';
import { api as viewerApi } from 'v-viewer';

const { tree, totalFiles } = materialsData;
const router = useRouter();

/* ============================================================
 * 当前路径
 * ============================================================ */
const stack = ref([]);

const currentList = computed(() => {
  if (stack.value.length === 0) return tree;
  const last = stack.value[stack.value.length - 1];
  return last.node.children ?? [];
});

const breadcrumbs = computed(() => [
  { name: '全部资料', path: '' },
  ...stack.value.map((s) => ({ name: s.name, path: s.path })),
]);

/* ============================================================
 * 交互
 * ============================================================ */
function enterDir(node) {
  stack.value.push({ name: node.name, path: node.path, node });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function jumpTo(index) {
  if (index < 0) stack.value = [];
  else stack.value = stack.value.slice(0, index + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
 * 格式判断与点击逻辑
 * ============================================================ */
const DOC_PAGE_EXTS = ['pdf', 'docx', 'xlsx', 'xls', 'pptx'];
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

const unsupportedDialog = ref({ visible: false, file: null });

function openFile(node) {
  // 1. 图片 → v-viewer 预览
  if (IMAGE_EXTS.includes(node.ext)) {
    const imageUrls = currentList.value
      .filter((n) => n.type === 'file' && IMAGE_EXTS.includes(n.ext))
      .map((n) => n.url);
    const currentIndex = imageUrls.indexOf(node.url);

    viewerApi({
      options: {
        // 使用显式的 size 配置，保留点击事件
        toolbar: {
          zoomIn: { show: true, size: 'large' },
          zoomOut: { show: true, size: 'large' },
          reset: { show: true, size: 'large' },
          prev: { show: true, size: 'large' },
          next: { show: true, size: 'large' },
          rotateLeft: { show: true, size: 'large' },
          rotateRight: { show: true, size: 'large' },
          oneToOne: false,
          play: false,
          flipHorizontal: false,
          flipVertical: false,
        },
        navbar: true, // 导航图片栏
        title: false,
        tooltip: true,
        movable: true,
        transition: true,
        fullscreen: false,
        keyboard: true,
      },
      images: imageUrls,
    }).view(currentIndex >= 0 ? currentIndex : 0);
    return;
  }

  // 2. 文档 → 预览页
  if (DOC_PAGE_EXTS.includes(node.ext)) {
    const src = encodeURIComponent(node.url);
    const title = encodeURIComponent(node.name);
    const url = `/pages/materials/viewer?src=${src}&title=${title}`;
    router.go(url);
    return;
  }

  // 3. MD → 站内路由
  if (node.ext === 'md') {
    router.go(node.url.replace(/\.md$/, ''));
    return;
  }

  // 4. 其他格式
  unsupportedDialog.value = { visible: true, file: node };
}

function confirmDownload() {
  const file = unsupportedDialog.value.file;
  if (file) {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  closeDialog();
}

function closeDialog() {
  unsupportedDialog.value = { visible: false, file: null };
}

/* ============================================================
 * 展示辅助
 * ============================================================ */
const TYPE_LABEL = { pdf: 'PDF', epub: 'EPUB', md: 'MD', zip: 'ZIP', txt: 'TXT' };

function typeLabel(ext) {
  return TYPE_LABEL[ext] ?? ext.toUpperCase();
}

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
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

    <nav class="mb-breadcrumb" aria-label="目录导航">
      <template v-for="(c, i) in breadcrumbs" :key="c.path">
        <span v-if="i > 0" class="mb-sep">/</span>
        <button
          class="mb-crumb"
          :class="{ active: i === breadcrumbs.length - 1 }"
          @click="jumpTo(i - 1)"
        >
          {{ c.name }}
        </button>
      </template>
    </nav>

    <ul v-if="currentList.length" class="mb-list">
      <li v-for="node in currentList" :key="node.path">
        <!-- 目录 -->
        <div v-if="node.type === 'dir'" class="mb-item mb-item--dir" @click="enterDir(node)">
          <span class="mb-icon mb-icon--dir">📁</span>
          <span class="mb-name">{{ node.name }}</span>
          <span class="mb-count">{{ node.count }} 项</span>
          <span class="mb-arrow">›</span>
        </div>

        <!-- 文件 -->
        <div v-else class="mb-item mb-item--file" @click="openFile(node)">
          <!-- 缩略图：放大到 48x48 的圆角矩形 -->
          <img v-if="IMAGE_EXTS.includes(node.ext)" :src="node.url" class="mb-thumb" alt="" />
          <span v-else class="material-type-badge" :data-type="node.ext">
            {{ typeLabel(node.ext) }}
          </span>

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

  <!-- 不支持格式的弹窗 -->
  <Teleport to="body">
    <Transition name="mb-dialog-fade">
      <div v-if="unsupportedDialog.visible" class="mb-dialog__mask" @click.self="closeDialog">
        <div class="mb-dialog">
          <h3 class="mb-dialog__title">格式不支持预览</h3>
          <p class="mb-dialog__desc">该文件格式暂不支持在线预览，是否下载到本地查看？</p>
          <p class="mb-dialog__file">
            <span class="mb-dialog__file-name">{{ unsupportedDialog.file?.name }}</span>
          </p>
          <div class="mb-dialog__actions">
            <button class="mb-dialog__btn mb-dialog__btn--cancel" @click="closeDialog">取消</button>
            <button class="mb-dialog__btn mb-dialog__btn--primary" @click="confirmDownload">
              下载
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.material-browser {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.news-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
  font-weight: 600;
}
.news-header .count {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 0 0 24px;
}
.news-header .count .num {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 面包屑 */
.mb-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 20px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  font-size: 13px;
}
.mb-sep {
  color: var(--vp-c-text-3);
}
.mb-crumb {
  background: none;
  border: none;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 13px;
  transition: all 0.15s;
}
.mb-crumb:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
.mb-crumb.active {
  color: var(--vp-c-text-1);
  font-weight: 500;
  cursor: default;
}

/* 列表 */
.mb-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px; /* 稍微拉开一点间距 */
}

.mb-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 14px;
}
.mb-item:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

/* 目录 */
.mb-icon--dir {
  font-size: 20px;
  flex-shrink: 0;
}
.mb-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  flex-shrink: 0;
}

/* 文件类型标签 */
.material-type-badge {
  flex-shrink: 0;
  width: 48px; /* 与缩略图保持宽度一致 */
  height: 48px; /* 与缩略图保持高度一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
  background: var(--vp-c-brand-soft, rgba(62, 175, 124, 0.12));
  color: var(--vp-c-brand-1);
}
.material-type-badge[data-type='pdf'] {
  background: rgba(224, 82, 82, 0.12);
  color: #e05252;
}

/* ============================================================
 * 列表情况：头部缩略图大小与质感优化
 * ============================================================ */
.mb-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover; /* 保持图片比例，不拉伸 */
  border-radius: 8px; /* 圆角更现代 */
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-mute);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); /* 增加一点细微阴影 */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.mb-item:hover .mb-thumb {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mb-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.mb-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.mb-arrow {
  color: var(--vp-c-text-3);
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.mb-item:hover .mb-arrow {
  color: var(--vp-c-brand-1);
  transform: translateX(2px);
}
.mb-arrow--ext {
  font-size: 14px;
}

.news-empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--vp-c-text-2);
}

/* ============================================================
 * 不支持格式弹窗
 * ============================================================ */
.mb-dialog__mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 24px;
}

.mb-dialog {
  width: min(420px, 100%);
  background: var(--vp-c-bg);
  border-radius: 16px;
  padding: 28px 24px 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--vp-c-divider);
}

.mb-dialog__title {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.mb-dialog__desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.mb-dialog__file {
  margin: 0 0 20px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  word-break: break-all;
}

.mb-dialog__file-name {
  font-weight: 500;
}

.mb-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mb-dialog__btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  font-weight: 500;
}

.mb-dialog__btn--cancel {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}
.mb-dialog__btn--cancel:hover {
  background: var(--vp-c-bg-soft);
}

.mb-dialog__btn--primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.mb-dialog__btn--primary:hover {
  background: var(--vp-c-brand-2);
}

/* 弹窗过渡 */
.mb-dialog-fade-enter-active,
.mb-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.mb-dialog-fade-enter-active .mb-dialog,
.mb-dialog-fade-leave-active .mb-dialog {
  transition: transform 0.2s ease;
}
.mb-dialog-fade-enter-from,
.mb-dialog-fade-leave-to {
  opacity: 0;
}
.mb-dialog-fade-enter-from .mb-dialog,
.mb-dialog-fade-leave-to .mb-dialog {
  transform: scale(0.95);
}

/* 美化底部缩略图导航栏 */
.viewer-navbar {
  background: rgba(20, 20, 22, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* 调整缩略图列表的间距和内边距 */
.viewer-list > li {
  padding: 2px !important;
  border-radius: 4px !important;
  transition: opacity 0.2s ease !important;
}

/* 当前选中的缩略图高亮 */
.viewer-list > li.viewer-active {
  opacity: 1 !important;
  box-shadow: 0 0 0 2px var(--vp-c-brand-1) !important;
}
</style>
