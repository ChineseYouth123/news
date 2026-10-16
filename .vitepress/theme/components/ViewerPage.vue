<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter, defineClientComponent } from 'vitepress';

console.log('[viewer] ========== 组件 setup 开始 ==========');

/* ============================================================
 * 按需加载预览组件（只在客户端）
 * ============================================================ */
const VueOfficePdf = defineClientComponent(async () => {
  console.log('[viewer] 加载 @vue-office/pdf');
  const mod = await import('@vue-office/pdf');
  console.log('[viewer] @vue-office/pdf 就绪');
  return mod.default;
});

const VueOfficeDocx = defineClientComponent(async () => {
  console.log('[viewer] 加载 @vue-office/docx');
  const mod = await import('@vue-office/docx');
  await import('@vue-office/docx/lib/index.css').catch(() => {});
  console.log('[viewer] @vue-office/docx 就绪');
  return mod.default;
});

const VueOfficeExcel = defineClientComponent(async () => {
  console.log('[viewer] 加载 @vue-office/excel');
  const mod = await import('@vue-office/excel');
  await import('@vue-office/excel/lib/index.css').catch(() => {});
  console.log('[viewer] @vue-office/excel 就绪');
  return mod.default;
});

const VueOfficePptx = defineClientComponent(async () => {
  console.log('[viewer] 加载 @vue-office/pptx');
  const mod = await import('@vue-office/pptx');
  console.log('[viewer] @vue-office/pptx 就绪');
  return mod.default;
});

const route = useRoute();
const router = useRouter();

/* ============================================================
 * 从 URL 读取参数
 * 优先读 window.location.search，VitePress route 兜底
 * ============================================================ */
function getQueryParam(key) {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || '';
}

const fileSrc = computed(() => {
  let src = getQueryParam('src');
  if (!src) {
    src = route.query?.src || route.data?.query?.src || '';
  }
  console.log('[viewer] fileSrc =', src);
  return src;
});

const title = computed(() => {
  let t = getQueryParam('title');
  if (!t) {
    t = route.query?.title || route.data?.query?.title || '';
  }
  console.log('[viewer] title =', t);
  return t || '文件预览';
});

/* ============================================================
 * 扩展名识别
 * ============================================================ */
const ext = computed(() => {
  const m = (title.value || fileSrc.value).match(/\.([^.?#]+)$/);
  const e = m ? m[1].toLowerCase() : '';
  console.log('[viewer] ext =', e);
  return e;
});

/**
 * 类型枚举
 * pdf   → @vue-office/pdf
 * docx  → @vue-office/docx
 * excel → @vue-office/excel
 * pptx  → @vue-office/pptx
 * doc   → 老格式，不支持
 * ppt   → 老格式，不支持
 * unknown → 完全未知
 */
const kind = computed(() => {
  const e = ext.value;
  let k = 'unknown';
  if (e === 'pdf') k = 'pdf';
  else if (e === 'docx') k = 'docx';
  else if (e === 'doc') k = 'doc';
  else if (e === 'xls' || e === 'xlsx') k = 'excel';
  else if (e === 'pptx') k = 'pptx';
  else if (e === 'ppt') k = 'ppt';
  console.log('[viewer] kind =', k);
  return k;
});

/* ============================================================
 * 绝对 URL
 * ============================================================ */
const fileUrl = computed(() => {
  if (!fileSrc.value) return '';

  const encoded = fileSrc.value
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  if (typeof window === 'undefined') return encoded;

  const full = window.location.origin + encoded;
  console.log('[viewer] fileUrl =', full);
  return full;
});

/* ============================================================
 * 事件
 * ============================================================ */
function onRendered() {
  console.log('[viewer] ✅ 渲染完成');
}

function onError(err) {
  console.error('[viewer] ❌ 渲染失败:', err);
}

function goBack() {
  console.log('[viewer] goBack, history.length =', window.history.length);
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = '/materials/';
  }
}

/* ============================================================
 * 生命周期
 * ============================================================ */
onMounted(() => {
  console.log('[viewer] ========== onMounted ==========');
  console.log('[viewer] window.location.search =', window.location.search);
  console.log('[viewer] fileSrc =', fileSrc.value);
  console.log('[viewer] title =', title.value);
  console.log('[viewer] ext =', ext.value);
  console.log('[viewer] kind =', kind.value);
  console.log('[viewer] fileUrl =', fileUrl.value);

  if (fileUrl.value) {
    fetch(fileUrl.value, { method: 'HEAD' })
      .then((res) => {
        console.log(
          '[viewer] HEAD 请求结果:',
          res.status,
          res.statusText,
          '| Content-Type:',
          res.headers.get('content-type')
        );
      })
      .catch((e) => console.error('[viewer] HEAD 请求失败:', e));
  }
});

console.log('[viewer] ========== setup 结束 ==========');
</script>

<template>
  <div class="file-page">
    <!-- 顶部工具栏 -->
    <header class="file-page__head">
      <button class="file-page__back" @click="goBack" title="返回">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>返回</span>
      </button>
      <h1 class="file-page__title">{{ title }}</h1>
      <a
        v-if="fileUrl"
        class="file-page__download"
        :href="fileUrl"
        :download="title"
        title="下载文件"
        >下载</a
      >
    </header>

    <!-- 内容区 -->
    <div class="file-page__body">
      <ClientOnly>
        <template v-if="fileUrl">
          <!-- PDF -->
          <div v-if="kind === 'pdf'" class="file-page__viewer">
            <VueOfficePdf
              :src="fileUrl"
              style="height: 100%; width: 100%"
              @rendered="onRendered"
              @error="onError"
            />
          </div>

          <!-- Word (.docx) -->
          <div v-else-if="kind === 'docx'" class="file-page__viewer file-page__viewer--doc">
            <VueOfficeDocx
              :src="fileUrl"
              style="min-height: 100%; width: 100%"
              @rendered="onRendered"
              @error="onError"
            />
          </div>

          <!-- Excel -->
          <div v-else-if="kind === 'excel'" class="file-page__viewer">
            <VueOfficeExcel
              :src="fileUrl"
              :options="{ xls: true }"
              style="height: 100%; width: 100%"
              @rendered="onRendered"
              @error="onError"
            />
          </div>

          <!-- PPTX -->
          <div v-else-if="kind === 'pptx'" class="file-page__viewer">
            <VueOfficePptx
              :src="fileUrl"
              style="height: 100%; width: 100%"
              @rendered="onRendered"
              @error="onError"
            />
          </div>

          <!-- 老格式 / 未知格式 -->
          <div v-else class="file-page__empty">
            <p v-if="kind === 'doc'">.doc 老格式暂不支持在线预览</p>
            <p v-else-if="kind === 'ppt'">.ppt 老格式暂不支持在线预览</p>
            <p v-else>该格式暂不支持在线预览</p>

            <p class="file-page__hint">
              <template v-if="kind === 'doc'">请用 Word 另存为 .docx 后重试</template>
              <template v-else-if="kind === 'ppt'">请用 PowerPoint 另存为 .pptx 后重试</template>
              <template v-else>支持：PDF / Word (.docx) / Excel / PowerPoint (.pptx)</template>
            </p>

            <a :href="fileUrl" :download="title" class="file-page__download-btn"> 下载文件 </a>
          </div>
        </template>

        <div v-else class="file-page__empty">未指定文件</div>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.file-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--vp-c-bg);
}

.file-page__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  z-index: 10;
}

.file-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-size: 13px;
  transition: all 0.15s;
}
.file-page__back:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.file-page__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-page__download {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.15s;
}
.file-page__download:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.file-page__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.file-page__viewer {
  width: 100%;
  height: 100%;
}

/* Word 内容高度自适应，允许父容器滚动 */
.file-page__viewer--doc {
  height: auto;
  min-height: 100%;
}

.file-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vp-c-text-2);
  font-size: 14px;
  gap: 12px;
}
.file-page__hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.file-page__download-btn {
  padding: 8px 20px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.15s;
}
.file-page__download-btn:hover {
  background: var(--vp-c-brand-2);
}
</style>
