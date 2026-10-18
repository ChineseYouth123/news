<!-- .vitepress/theme/components/FontSizeControl.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useData } from 'vitepress';

const { page, frontmatter } = useData();
const sizes = [
  { label: '小', value: '14px', class: 'size-small' },
  { label: '中', value: '16px', class: 'size-medium' },
  { label: '大', value: '18px', class: 'size-large' },
];
const isBlogPost = computed(() => {
  return (
    page.value.relativePath.startsWith('blog/') && !page.value.relativePath.endsWith('index.md')
  );
});

const currentSize = ref('size-medium');

onMounted(() => {
  const saved = localStorage.getItem('vp-blog-font-size');
  if (saved && sizes.some((s) => s.class === saved)) {
    currentSize.value = saved;
  }
  applyFontSize();
});

function setSize(sizeClass) {
  currentSize.value = sizeClass;
  localStorage.setItem('vp-blog-font-size', sizeClass);
  applyFontSize();
}

function applyFontSize() {
  const sizeObj = sizes.find((s) => s.class === currentSize.value);
  if (sizeObj) {
    document.documentElement.style.setProperty('--vp-font-size-base', sizeObj.value);
    document.documentElement.style.fontSize = sizeObj.value;
  }
}
</script>

<template>
  <div class="font-size-control" v-if="isBlogPost">
    <Icon name="zitidaxiao" size="1.1rem" class="fs-icon" />
    <div class="fs-buttons">
      <button
        v-for="size in sizes"
        :key="size.class"
        :class="['fs-btn', { active: currentSize === size.class }]"
        @click="setSize(size.class)"
        :title="`切换到${size.label}字体`"
      >
        {{ size.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 关键：使用 inline-flex 让它和文字同行 */
.font-size-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  vertical-align: middle;
}

.fs-icon {
  color: var(--vp-c-text-2);
  /* 让图标对齐文字基线 */
  transform: translateY(1px);
}

.fs-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 去掉原来的背景框，变成纯文字按钮 */
.fs-btn {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: color 0.2s;
}

.fs-btn:hover {
  color: var(--vp-c-text-1);
}

/* 选中的状态：变主题色，加粗 */
.fs-btn.active {
  color: var(--vp-c-brand-1);
  font-weight: bold;
}
</style>
