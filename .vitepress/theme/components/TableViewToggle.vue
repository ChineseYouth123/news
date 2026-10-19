<script setup>
import {
  onMounted,
  watch,
  nextTick,
  createApp,
  h,
  defineComponent,
  ref,
  onUnmounted,
  computed,
} from 'vue';
import { useRoute, useData } from 'vitepress';

const route = useRoute();
const { page } = useData();
let mountedApps = [];

// ==========================================
// 核心逻辑：判断是否是文档预览页（与回到顶部完全一致）
// ==========================================
const isDocPage = computed(() => {
  const path = page.value.relativePath;
  return path !== 'index.md' && !path.includes('404') && !path.endsWith('index.md');
});

// ==========================================
// 1. 全局状态：控制全站表格的视图模式
// ==========================================
const globalViewMode = ref(
  typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table'
);

const toggleGlobalView = () => {
  globalViewMode.value = globalViewMode.value === 'table' ? 'card' : 'table';
};

// ==========================================
// 2. 内部表格渲染组件 (纯渲染函数)
// ==========================================
const TableViewToggleInner = defineComponent({
  props: {
    headers: { type: Array, required: true },
    rows: { type: Array, required: true },
  },
  setup(props) {
    return () => {
      const isTable = globalViewMode.value === 'table';

      return h('div', { class: 'table-view-container' }, [
        // 表格视图
        h(
          'div',
          {
            class: 'table-wrapper',
            style: { display: isTable ? 'block' : 'none' },
          },
          [
            h('table', null, [
              h('thead', null, [
                h(
                  'tr',
                  null,
                  props.headers.map((head) => h('th', { innerHTML: head }))
                ),
              ]),
              h(
                'tbody',
                null,
                props.rows.map((row) =>
                  h(
                    'tr',
                    null,
                    row.map((cell) => h('td', { innerHTML: cell }))
                  )
                )
              ),
            ]),
          ]
        ),
        // 卡片视图
        h(
          'div',
          {
            class: 'card-list',
            style: { display: isTable ? 'none' : 'flex' },
          },
          props.rows.map((row) =>
            h(
              'div',
              { class: 'data-card' },
              row.map((cell, index) =>
                h('div', { class: 'card-item' }, [
                  props.headers[index]
                    ? h('div', { class: 'card-label', innerHTML: props.headers[index] })
                    : null,
                  h('div', { class: 'card-value', innerHTML: cell }),
                ])
              )
            )
          )
        ),
      ]);
    };
  },
});

// ==========================================
// 3. 核心逻辑：扫描并挂载
// ==========================================
const processTables = () => {
  // 如果不是文档页，直接跳过扫描，不劫持任何表格
  if (!isDocPage.value) return;

  requestAnimationFrame(() => {
    const tables = document.querySelectorAll('.vp-doc table:not([data-processed])');

    tables.forEach((table) => {
      table.setAttribute('data-processed', 'true');

      const cloneTable = table.cloneNode(true);
      const headers = Array.from(cloneTable.querySelectorAll('thead th')).map((th) =>
        th.innerHTML.trim()
      );
      const rows = [];
      cloneTable.querySelectorAll('tbody tr').forEach((tr) => {
        const rowCells = Array.from(tr.querySelectorAll('td')).map((td) => td.innerHTML.trim());
        rows.push(rowCells);
      });

      if (!headers.length && !rows.length) return;

      const container = document.createElement('div');
      table.parentNode.replaceChild(container, table);

      const app = createApp(TableViewToggleInner, { headers, rows });
      app.mount(container);
      mountedApps.push(app);
    });
  });
};

// ==========================================
// 4. 生命周期
// ==========================================
onMounted(() => {
  processTables();
});

watch(
  () => route.path,
  () => {
    mountedApps.forEach((app) => app.unmount());
    mountedApps = [];
    nextTick(() => {
      processTables();
    });
  }
);

onUnmounted(() => {
  mountedApps.forEach((app) => app.unmount());
  mountedApps = [];
});
</script>

<template>
  <!-- 👇 新增 v-show="isDocPage"，非文档页不显示悬浮按钮 -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-show="isDocPage"
        class="global-table-toggle-btn"
        @click="toggleGlobalView"
        :title="globalViewMode === 'table' ? '切换为卡片模式' : '切换为表格模式'"
      >
        <!-- 表格图标 -->
        <Icon v-if="globalViewMode === 'card'" name="biaoge" size="1.5rem" />
        <!-- 卡片图标 -->
        <Icon v-else name="kapian" size="1.5rem" />
      </div>
    </Transition>
  </Teleport>
</template>
<style>
/* ============================================================
 * 1. 表格视图 (Table) - 现代极简风
 * ============================================================ */
.table-view-container {
  margin: 1.5rem 0;
  position: relative;
}

.table-wrapper {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* 🔽 外层保留圆角和边框 */
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
}

.table-wrapper table {
  width: 100%;
  border-collapse: collapse;
  /* 保证小屏下内容不挤压，触发横向滚动 */
  white-space: nowrap;
}

/* 🔽 单元格基础样式：隐藏内边框，只用底边框分隔行 */
.table-wrapper th,
.table-wrapper td {
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

/* 🔽 标题列 (th) 样式 */
.table-wrapper th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
  color: var(--vp-c-text-2);
  /* 缩小标题列宽：根据内容自适应，不再平分 */
  width: 1%;
  white-space: nowrap;
}

/* 最后一行的底部边框去掉，避免和外层边框重叠 */
.table-wrapper tr:last-child td {
  border-bottom: none;
}

/* 行 Hover 效果 */
.table-wrapper tbody tr {
  transition: background-color 0.2s;
}
.table-wrapper tbody tr:hover {
  background-color: var(--vp-c-bg-soft);
}

/* ============================================================
 * 2. 卡片视图 (Card) - 现代圆润风
 * ============================================================ */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-card {
  /* 🔽 保留卡片外围边框和阴影 */
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card-item {
  display: flex;
  padding: 12px 16px;
  /* 内部用极浅的边框分割上下 */
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  align-items: flex-start;
}

.card-item:last-child {
  border-bottom: none;
}

/* 隔行变色已去除，改用更干净的背景色，如果需要可以保留下面这句 */
/* .card-item:nth-child(even) { background-color: var(--vp-c-bg-soft); } */

.card-label {
  /* 🔽 标题列宽调窄 */
  flex: 0 0 30%;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding-right: 12px;
}

.card-value {
  flex: 1;
  color: var(--vp-c-text-1);
  word-break: break-all;
  line-height: 1.6;
}

/* ============================================================
 * 3. 悬浮按钮样式 (保留原有逻辑)
 * ============================================================ */
.global-table-toggle-btn {
  position: fixed;
  bottom: 135px;
  right: 30px;
  width: 44px;
  height: 44px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.global-table-toggle-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
</style>
