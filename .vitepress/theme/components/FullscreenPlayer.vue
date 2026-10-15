<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { seek } from '../audio/engine';
import { fmtTime } from '../utils/format';
import VinylDisc from './VinylDisc.vue';

const player = usePlayerStore();
const ui = useUiStore();
const track = computed(() => player.currentTrack);

const progress = computed(() =>
  player.duration ? (player.currentTime / player.duration) * 100 : 0
);

function onSeek(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (player.duration) seek(ratio * player.duration);
}

function onKey(e) {
  if (!ui.fullscreen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    ui.closeFullscreen();
  }
  if (e.key === ' ') {
    e.preventDefault();
    player.togglePlay();
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="vp-fs">
      <div v-if="ui.fullscreen" class="vp-fs">
        <div
          class="vp-fs__bg"
          :style="track?.cover ? { backgroundImage: `url(${track.cover})` } : {}"
        />
        <div class="vp-fs__mask" />
        <button class="vp-fs__close" @click="ui.closeFullscreen()">✕</button>

        <div class="vp-fs__content">
          <VinylDisc :cover="track?.cover" :spinning="player.isPlaying" :size="320" />

          <div class="vp-fs__meta">
            <h1>{{ track?.title ?? '未播放' }}</h1>
            <p>{{ track?.artist ?? '—' }}</p>
          </div>

          <div class="vp-fs__bar" @click="onSeek">
            <div class="vp-fs__bar-fill" :style="{ width: progress + '%' }" />
          </div>
          <div class="vp-fs__time">
            <span>{{ fmtTime(player.currentTime) }}</span>
            <span>{{ fmtTime(player.duration) }}</span>
          </div>

          <div class="vp-fs__ctrl">
            <button @click="player.prev()">⏮</button>
            <button class="primary" @click="player.togglePlay()">
              {{ player.isPlaying ? '⏸' : '▶' }}
            </button>
            <button @click="player.next()">⏭</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vp-fs {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #fff;
}
.vp-fs__bg {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.5);
  transform: scale(1.2);
}
.vp-fs__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}
.vp-fs__close {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 2;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.vp-fs__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  color: #fff;
  width: min(560px, 90vw);
}
.vp-fs__meta {
  text-align: center;
}
.vp-fs__meta h1 {
  font-size: 28px;
  margin: 0;
}
.vp-fs__meta p {
  opacity: 0.7;
  margin: 4px 0 0;
}
.vp-fs__bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
}
.vp-fs__bar-fill {
  height: 100%;
  background: #fff;
  transition: width 0.1s linear;
}
.vp-fs__time {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.7;
}
.vp-fs__ctrl {
  display: flex;
  gap: 32px;
  align-items: center;
}
.vp-fs__ctrl button {
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
}
.vp-fs__ctrl button.primary {
  font-size: 48px;
}

.vp-fs-enter-active,
.vp-fs-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.vp-fs-enter-from,
.vp-fs-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
