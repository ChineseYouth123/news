<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showBackToTop = ref(false);

// 监听滚动事件
const handleScroll = () => {
  // 当滚动超过 300px 时显示按钮
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
  <Transition name="fade">
    <div v-show="showBackToTop" class="back-to-top" @click="scrollToTop" title="回到顶部">
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
.back-to-top {
  position: fixed;
  bottom: 80px; /* 距离底部的高度，看你播放器会不会挡住，可以自己调 */
  right: 30px; /* 距离右侧的宽度 */
  width: 44px;
  height: 44px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%; /* 变成圆形 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50; /* 确保在最上层 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.back-to-top:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
  transform: translateY(-4px); /* 悬停时稍微向上浮动 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Vue 的淡入淡出过渡动画 */
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
