<script setup>
defineProps({
  cover: { type: String, default: '' },
  spinning: { type: Boolean, default: false },
  size: { type: Number, default: 56 },
});
</script>

<template>
  <div class="vp-disc" :class="{ spinning }" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="cover" :src="cover" class="vp-disc__cover" />
    <div v-else class="vp-disc__placeholder">♪</div>
    <div class="vp-disc__center" />
  </div>
</template>

<style scoped>
.vp-disc {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: vp-disc-spin 20s linear infinite;
  animation-play-state: paused;
}
.vp-disc.spinning {
  animation-play-state: running;
}
.vp-disc__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vp-disc__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  font-size: 24px;
}
.vp-disc__center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16%;
  height: 16%;
  background: #111;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}
@keyframes vp-disc-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
