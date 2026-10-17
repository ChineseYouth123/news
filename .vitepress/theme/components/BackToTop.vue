<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useData } from 'vitepress';

const { page } = useData();
const showBackToTop = ref(false);

// 👇 核心判断逻辑：只在文档预览页面显示
const isDocPage = computed(() => {
  const path = page.value.relativePath;
  // 排除首页、404、和纯文件夹目录（比如 blog/index.md）
  return path !== 'index.md' && !path.includes('404') && !path.endsWith('index.md');
});

// 监听滚动事件
const handleScroll = () => {
  // 当滚动超过 300px 且当前是文档页时才显示
  showBackToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // 平滑滚动
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // 初始化时检查一次，防止刷新页面时已经在中间位置
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <!-- 👇 这里的 v-show 必须包含 isDocPage，确保非文档页永远不显示 -->
  <Transition name="fade">
    <div
      v-show="showBackToTop && isDocPage"
      class="back-to-top"
      @click="scrollToTop"
      title="回到顶部"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  </Transition>
</template>

<style scoped>
/* 保持不变 */
.back-to-top {
  position: fixed;
  bottom: 80px;
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

.back-to-top:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

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
