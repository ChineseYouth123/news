<!-- .vitepress/theme/components/HomeEffect.vue -->
<script setup>
defineProps({
  type: { type: String, default: 'red-ray' },
});
</script>

<template>
  <div class="effect-wrapper">
    <div v-if="type === 'red-ray'" class="ray-container">
      <div class="ray item-1"></div>
      <div class="ray item-2"></div>
      <div class="ray item-3"></div>
    </div>
    <div class="effect-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.effect-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 160px;
  z-index: 1;
}

.effect-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ray-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 1;
}

.ray {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;

  /* 🔽 使用你定义的主题色变量 */
  background: radial-gradient(
    circle,
    transparent 40%,
    var(--news-brand-soft) 60%,
    var(--news-brand) 90%,
    var(--news-brand) 100%
  );
  border: 2px solid var(--news-brand);

  box-shadow:
    0 0 20px var(--news-brand-soft),
    inset 0 0 20px var(--news-brand-soft);

  opacity: 0;
  animation: red-ray-pulse 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}

.item-1 {
  animation-delay: 0s;
}
.item-2 {
  animation-delay: 1s;
}
.item-3 {
  animation-delay: 2s;
}

@keyframes red-ray-pulse {
  0% {
    width: 120px;
    height: 120px;
    opacity: 0;
    border-width: 4px;
  }
  10% {
    opacity: 0.8;
  }
  100% {
    width: 800px;
    height: 800px;
    opacity: 0;
    border-width: 1px;
  }
}
</style>
