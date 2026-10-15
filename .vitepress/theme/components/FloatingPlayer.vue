<script setup>
console.log('=== [FloatingPlayer] 文件被加载 ===');

import { computed, onMounted, ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { initAudioEngine, seek } from '../audio/engine';
import { fmtTime } from '../utils/format';
import VinylDisc from './VinylDisc.vue';

console.log('=== [FloatingPlayer] 所有 import 成功 ===');

const player = usePlayerStore();
const ui = useUiStore();
const hovered = ref(false);
const pinned = ref(false);

onMounted(() => {
  console.log('[FloatingPlayer] onMounted 触发，准备调用 initAudioEngine');
  initAudioEngine();
});

const track = computed(() => player.currentTrack);
const progress = computed(() =>
  player.duration ? (player.currentTime / player.duration) * 100 : 0
);
const expanded = computed(() => hovered.value || pinned.value);

function onSeek(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (player.duration) seek(ratio * player.duration);
}

function togglePin() {
  pinned.value = !pinned.value;
}
</script>

<template>
  <div
    class="vp-fp"
    :class="{ expanded }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <button class="vp-fp__disc" @click="ui.openFullscreen()" title="全屏播放">
      <VinylDisc :cover="track?.cover" :spinning="player.isPlaying" :size="56" />
    </button>

    <div v-if="expanded" class="vp-fp__body">
      <div class="vp-fp__head">
        <div class="vp-fp__meta">
          <div class="vp-fp__title">{{ track?.title ?? '未播放' }}</div>
          <div class="vp-fp__artist">{{ track?.artist ?? '—' }}</div>
        </div>
        <button class="vp-fp__pin" @click="togglePin" :title="pinned ? '取消固定' : '固定'">
          {{ pinned ? '📌' : '📍' }}
        </button>
      </div>

      <div class="vp-fp__bar" @click="onSeek">
        <div class="vp-fp__bar-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="vp-fp__time">
        <span>{{ fmtTime(player.currentTime) }}</span>
        <span>{{ fmtTime(player.duration) }}</span>
      </div>

      <div class="vp-fp__ctrl">
        <button @click="player.prev()">⏮</button>
        <button @click="player.togglePlay()">
          {{ player.isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="player.next()">⏭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vp-fp {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.vp-fp.expanded {
  border-radius: 16px;
  padding: 12px;
  align-items: flex-start;
}
.vp-fp__disc {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.vp-fp__body {
  width: 240px;
}
.vp-fp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.vp-fp__meta {
  min-width: 0;
  flex: 1;
}
.vp-fp__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vp-fp__artist {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}
.vp-fp__pin {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.vp-fp__bar {
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
}
.vp-fp__bar-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.1s linear;
}
.vp-fp__time {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.vp-fp__ctrl {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}
.vp-fp__ctrl button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}
</style>
