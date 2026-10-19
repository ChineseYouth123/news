<script setup>
import { computed } from 'vue';
import { withBase } from 'vitepress';

const props = defineProps({
  cover: { type: String, default: '' },
  spinning: { type: Boolean, default: false },
  size: { type: Number, default: 56 },
});

// 🔽 使用 computed 包裹，确保 cover 变化时自动更新，并加上 base 前缀
const imgUrl = computed(() => {
  return props.cover ? withBase(props.cover) : '';
});
</script>

<template>
  <div class="vp-disc" :class="{ spinning }" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="imgUrl" :src="imgUrl" class="vp-disc__cover" />
    <div v-else class="vp-disc__placeholder">♪</div>
    <div class="vp-disc__center" />
  </div>
</template>

<style scoped>
.vp-disc {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 1px,
    #222 2px,
    #222 3px
  );
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.25);
  animation: vp-disc-spin 20s linear infinite;
  animation-play-state: paused;
  transition: box-shadow 0.3s ease;
}

.vp-disc.spinning {
  animation-play-state: running;
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 0 0 4px rgba(62, 175, 124, 0.25);
}

.vp-disc__cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 62%;
  height: 62%;
  border-radius: 50%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.vp-disc__placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 62%;
  height: 62%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  background: #333;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.vp-disc__center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8%;
  height: 8%;
  background: #111;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
}

@keyframes vp-disc-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
