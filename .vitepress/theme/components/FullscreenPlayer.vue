<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useRoute, withBase } from 'vitepress';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { seek } from '../audio/engine';
import { fmtTime } from '../utils/format';
import { parseLRC } from '../utils/lrc';

const player = usePlayerStore();
const ui = useUiStore();
const track = computed(() => player.currentTrack);

/* ============ 视图状态 ============ */
const view = ref('cover');
const toggleView = () => {
  view.value = view.value === 'cover' ? 'lyric' : 'cover';
};

/* ============ 主色提取 ============ */
const accentColor = ref('#3eaf7c');

watch(
  () => track.value?.cover,
  async (cover) => {
    if (!cover || typeof window === 'undefined') return;
    try {
      const { default: ColorThief } = await import('colorthief');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = withBase(cover);
      img.onload = () => {
        try {
          const thief = new ColorThief();
          const [r, g, b] = thief.getColor(img);
          accentColor.value = `rgb(${r}, ${g}, ${b})`;
        } catch (e) {
          console.warn('[color] 提取失败', e);
        }
      };
    } catch (e) {
      console.warn('[color] colorthief 不可用，使用兜底色', e);
    }
  },
  { immediate: true }
);

/* ============ 背景样式 ============ */
const bgStyle = computed(() => ({
  backgroundImage: withBase(track.value?.cover) ? `url(${withBase(track.value.cover)})` : 'none',
}));

/* ============ 歌词 ============ */
const lyricLines = ref([]);
const lyricsEl = ref(null);

watch(
  () => track.value?.id,
  async () => {
    const t = track.value;
    if (!t) {
      lyricLines.value = [];
      return;
    }
    try {
      if (t.lyric) {
        lyricLines.value = parseLRC(t.lyric);
      } else if (t.lrcUrl) {
        const path = withBase(t.lrcUrl);
        const res = await fetch(path);
        if (res.ok) {
          const text = await res.text();
          lyricLines.value = parseLRC(text);
        } else {
          lyricLines.value = [];
        }
      } else {
        lyricLines.value = [];
      }
    } catch (e) {
      console.warn('[lyric] 加载失败', e);
      lyricLines.value = [];
    }
  },
  { immediate: true }
);

const currentLyricIndex = computed(() => {
  const t = player.currentTime;
  const lines = lyricLines.value;
  if (!lines.length) return -1;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].time) idx = i;
    else break;
  }
  return idx;
});

/* ============ 歌词拖拽状态 ============ */
const isDragging = ref(false);
let dragStartY = 0;
let dragStartScroll = 0;

function onLyricsMouseDown(e) {
  // 只响应鼠标左键
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStartY = e.clientY;
  dragStartScroll = lyricsEl.value?.scrollTop ?? 0;
  document.body.style.userSelect = 'none';
  e.preventDefault();
}

function onLyricsMouseMove(e) {
  if (!isDragging.value || !lyricsEl.value) return;
  const delta = e.clientY - dragStartY;
  lyricsEl.value.scrollTop = dragStartScroll - delta;
}

function onLyricsMouseUp() {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.body.style.userSelect = '';
}

onMounted(() => {
  window.addEventListener('mousemove', onLyricsMouseMove);
  window.addEventListener('mouseup', onLyricsMouseUp);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onLyricsMouseMove);
  window.removeEventListener('mouseup', onLyricsMouseUp);
  document.body.style.userSelect = '';
});

/* ============ 自动滚动（拖拽时暂停） ============ */
watch(currentLyricIndex, async (i) => {
  if (i < 0 || !lyricsEl.value || isDragging.value) return;
  await nextTick();
  const items = lyricsEl.value.querySelectorAll('li');
  const el = items[i];
  if (!el) return;

  const container = lyricsEl.value;
  const targetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;

  container.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  });
});

/* ============ 进度条：鼠标 + 触摸 ============ */
const progress = computed(() =>
  player.duration ? (player.currentTime / player.duration) * 100 : 0
);

function seekByClientX(clientX, el) {
  const rect = el.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  if (player.duration) seek(ratio * player.duration);
}

function onSeekDown(e) {
  const el = e.currentTarget;
  el.setPointerCapture?.(e.pointerId);
  seekByClientX(e.clientX, el);

  const onMove = (ev) => seekByClientX(ev.clientX, el);
  const onUp = () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}

/* ============ 原生全屏 ============ */
function toggleNativeFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

/* ============ 键盘 ============ */
function onKey(e) {
  if (!ui.fullscreen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    if (view.value === 'lyric') {
      view.value = 'cover';
    } else {
      ui.closeFullscreen();
    }
  }
  if (e.key === ' ') {
    e.preventDefault();
    player.togglePlay();
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

/* ============ 关闭时重置视图 ============ */
watch(
  () => ui.fullscreen,
  (open) => {
    if (!open) view.value = 'cover';
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="vp-fs">
      <div v-if="ui.fullscreen" class="vp-fs" :style="{ '--player-accent': accentColor }">
        <div class="vp-fs__bg" :style="bgStyle" />
        <div class="vp-fs__mask" />

        <header class="vp-fs__top">
          <div class="vp-fs__mode" @click="toggleView">
            {{ view === 'lyric' ? '封' : '词' }}
          </div>
          <div class="vp-fs__top-right">
            <div
              class="vp-fs__icon vp-fs__icon--fullscreen vp-fs__mode"
              title="全屏"
              @click="toggleNativeFullscreen"
            >
              <Icon name="quanping" size="2rem" />
            </div>
            <div class="vp-fs__icon vp-fs__mode" title="收起" @click="ui.closeFullscreen()">
              <Icon name="shouqi" size="2rem" />
            </div>
          </div>
        </header>

        <main class="vp-fs__main" :class="{ 'is-lyric': view === 'lyric' }">
          <section class="vp-fs__left">
            <div
              class="vp-fs__cover-wrap"
              :class="{ clickable: view === 'cover' }"
              @click="view === 'cover' && toggleView()"
            >
              <img
                v-if="track?.cover"
                :src="withBase(track.cover)"
                class="vp-fs__cover"
                alt="cover"
              />
              <div v-else class="vp-fs__cover vp-fs__cover--placeholder">♪</div>
            </div>

            <div class="vp-fs__info">
              <h1 class="vp-fs__title">{{ track?.title ?? '未播放' }}</h1>
              <p class="vp-fs__artist">
                <Icon name="user" size="1rem" class="vp-fs__icon-sm" />
                {{ track?.artist ?? '—' }}
              </p>
              <p v-if="track?.album" class="vp-fs__album">
                <Icon name="cd" size="1rem" class="vp-fs__icon-sm" />
                {{ track.album }}
              </p>
            </div>
          </section>

          <section class="vp-fs__right">
            <ul
              v-if="lyricLines.length"
              ref="lyricsEl"
              class="vp-fs__lyrics"
              :class="{ 'is-dragging': isDragging }"
              @mousedown="onLyricsMouseDown"
            >
              <li
                v-for="(line, i) in lyricLines"
                :key="i"
                :class="{ active: i === currentLyricIndex }"
              >
                {{ line.text }}
              </li>
            </ul>
            <div v-else class="vp-fs__lyrics-empty">暂无歌词</div>
          </section>
        </main>

        <footer class="vp-fs__bottom">
          <div class="vp-fs__ctrl">
            <div @click="player.prev()" title="上一首">
              <Icon name="shangyiqu" size="2rem" />
            </div>
            <div class="primary" @click="player.togglePlay()">
              <!-- 播放按钮 -->
              <Icon v-if="!player.isPlaying" name="play" size="2rem" />
              <!-- 暂停按钮 -->
              <Icon v-else name="zanting" size="2rem" />
            </div>

            <div @click="player.next()" title="下一首">
              <Icon name="xiayiqu" size="2rem" />
            </div>
          </div>
          <div class="vp-fs__progress">
            <span class="vp-fs__time">{{ fmtTime(player.currentTime) }}</span>
            <div class="vp-fs__bar" @pointerdown="onSeekDown">
              <div class="vp-fs__bar-fill" :style="{ width: progress + '%' }" />
              <div class="vp-fs__bar-thumb" :style="{ left: progress + '%' }" />
            </div>
            <span class="vp-fs__time">{{ fmtTime(player.duration) }}</span>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============ 容器 ============ */
.vp-fs {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #fff;
  overflow: hidden;
  --player-accent: #3eaf7c;
}

/* ============ 背景 ============ */
.vp-fs__bg {
  position: absolute;
  inset: -80px;
  background-size: cover;
  background-position: center;
  filter: blur(100px) brightness(1.05) saturate(1.7);
  transform: scale(1.25);
  opacity: 1;
  transition: background-image 0.6s ease;
}
.vp-fs__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.vp-fs__mask {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 40% 45%,
      color-mix(in srgb, var(--player-accent) 20%, transparent) 0%,
      transparent 55%
    ),
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 20%,
      transparent 82%,
      rgba(0, 0, 0, 0.3) 100%
    );
  pointer-events: none;
}

/* ============ 顶部栏 ============ */
.vp-fs__top {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  flex-shrink: 0;
}

.vp-fs__mode {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 50px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 26px;
  font-weight: 600;
  cursor: pointer;
  /* padding: 6px 14px; */
  border-radius: 8px;
  transition: all 0.2s;
}
.vp-fs__mode:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.vp-fs__top-right {
  display: flex;
  gap: 10px;
}

/* ============ 主体 ============ */
.vp-fs__main {
  position: relative;
  z-index: 2;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 460px) 1fr;
  gap: 80px;
  align-items: center;
  padding: 0 80px;
  padding-top: 30px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  min-height: 0;
}

/* ============ 左栏 ============ */
.vp-fs__left {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 0;
}

.vp-fs__cover-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  flex-shrink: 0;
}

.vp-fs__cover-wrap.clickable {
  cursor: pointer;
}
.vp-fs__cover-wrap.clickable:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
}

.vp-fs__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vp-fs__cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
}

.vp-fs__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vp-fs__title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.vp-fs__artist,
.vp-fs__album {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vp-fs__icon-sm {
  opacity: 0.6;
  font-size: 13px;
}

/* ============ 右栏：歌词 ============ */
.vp-fs__right {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  min-height: 0;
  overflow: hidden;
}

.vp-fs__lyrics {
  list-style: none;
  padding: 8px 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  scrollbar-width: none;
  position: relative;
  flex: 1;
  min-height: 0;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  /* 拖拽时通过 JS 加 userSelect: none 到 body，双保险 */
  mask-image: linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 15%,
    #000 85%,
    transparent 100%
  );
}
.vp-fs__lyrics::-webkit-scrollbar {
  display: none;
}

.vp-fs__lyrics.is-dragging {
  cursor: grabbing;
}

.vp-fs__lyrics li {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.35);
  transition:
    color 0.35s ease,
    font-size 0.35s ease;
  line-height: 1.5;
  font-weight: 500;
  pointer-events: none; /* 关键：避免选中文字 */
}

.vp-fs__lyrics li.active {
  color: #fff;
  font-size: 24px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.vp-fs__lyrics-empty {
  color: rgba(255, 255, 255, 0.4);
  font-size: 15px;
  text-align: center;
  padding: 40px 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ============ 歌词视图（点击封面后） ============ */
.vp-fs__main.is-lyric {
  grid-template-columns: 1fr;
  padding: 0 120px;
}

.vp-fs__main.is-lyric .vp-fs__left {
  display: none;
}

.vp-fs__main.is-lyric .vp-fs__right {
  max-height: 100%;
  height: 100%;
  min-height: 0;
}

.vp-fs__main.is-lyric .vp-fs__lyrics li {
  font-size: 20px;
  text-align: center;
}

.vp-fs__main.is-lyric .vp-fs__lyrics li.active {
  font-size: 25px;
}

/* ============ 底部控制 ============ */
.vp-fs__bottom {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 80px 36px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  flex-shrink: 0;
}

.vp-fs__ctrl {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  height: 50px;
}

.vp-fs__ctrl button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26px;
  cursor: pointer;
  transition:
    color 0.2s,
    transform 0.15s;
  padding: 0;
  line-height: 1;
}
.vp-fs__ctrl button:hover {
  color: #fff;
  transform: scale(1.1);
}
.vp-fs__ctrl button:active {
  transform: scale(0.95);
}
.vp-fs__ctrl button.primary {
  font-size: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s ease,
    color 0.2s ease;
}
.vp-fs__ctrl button.primary:hover {
  color: #fff;
  transform: scale(1.12);
}
.vp-fs__ctrl button.primary:active {
  transform: scale(0.95);
}

.vp-fs__progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vp-fs__time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}
.vp-fs__time:last-child {
  text-align: right;
}

/* ============ 进度条 ============ */
.vp-fs__bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s;
  touch-action: none;
  user-select: none;
}
.vp-fs__bar:hover {
  height: 6px;
}
.vp-fs__bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  transition: width 0.1s linear;
  pointer-events: none;
}
.vp-fs__bar-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
  transition:
    width 0.15s,
    height 0.15s,
    left 0.1s linear;
  pointer-events: none;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.35);
}
.vp-fs__bar:hover .vp-fs__bar-thumb {
  width: 16px;
  height: 16px;
}

/* ============ 移动端 ============ */
@media (max-width: 900px) {
  .vp-fs__icon--fullscreen {
    display: none;
  }

  .vp-fs__top {
    padding: 12px 16px;
  }

  .vp-fs__main {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 20px;
    padding-top: 30px;
    align-items: start;
    overflow: visible;
  }

  .vp-fs__right {
    display: none;
  }

  .vp-fs__main.is-lyric {
    padding: 0 24px;
    overflow: hidden;
    align-items: stretch;
  }

  .vp-fs__main.is-lyric .vp-fs__right {
    display: flex;
    height: 100%;
  }

  /* 移动端不拖拽，恢复文字可选（虽然也没啥用） */
  .vp-fs__lyrics {
    cursor: default;
    user-select: auto;
    -webkit-user-select: auto;
  }
  .vp-fs__lyrics li {
    pointer-events: auto;
  }

  .vp-fs__bottom {
    padding: 16px 20px 24px;
    gap: 12px;
  }

  .vp-fs__left {
    gap: 20px;
  }

  .vp-fs__cover-wrap {
    max-width: 280px;
    margin: 0 auto;
  }

  .vp-fs__title {
    font-size: 20px;
    text-align: center;
  }

  .vp-fs__info {
    align-items: center;
  }

  .vp-fs__artist,
  .vp-fs__album {
    justify-content: center;
  }

  .vp-fs__lyrics li {
    font-size: 17px;
  }

  .vp-fs__main.is-lyric .vp-fs__lyrics li {
    font-size: 16px;
    text-align: center;
  }

  .vp-fs__main.is-lyric .vp-fs__lyrics li.active {
    font-size: 20px;
  }

  .vp-fs__ctrl {
    gap: 32px;
  }

  .vp-fs__ctrl button.primary {
    font-size: 34px;
  }

  .vp-fs__bar-thumb {
    width: 14px;
    height: 14px;
  }
  .vp-fs__bar:hover .vp-fs__bar-thumb {
    width: 14px;
    height: 14px;
  }
}

/* ============ 过渡 ============ */
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
