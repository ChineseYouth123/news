<script setup>
import { computed, ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { seek } from '../audio/engine';
import { fmtTime } from '../utils/format';
import VinylDisc from './VinylDisc.vue';

/* ============================================================
 * 状态
 * ============================================================ */

const player = usePlayerStore();
const ui = useUiStore();

/** 面板展开状态 */
const opened = ref(false);

/* ============================================================
 * 计算属性
 * ============================================================ */

const track = computed(() => player.currentTrack);

const progress = computed(() =>
  player.duration ? (player.currentTime / player.duration) * 100 : 0
);

/** 有曲目才显示悬浮球 */
const visible = computed(() => !!player.currentTrack);

/* ============================================================
 * 交互方法
 * ============================================================ */

/** 切换面板展开 / 收起 */
function togglePanel() {
  opened.value = !opened.value;
}

/** 最小化：收起面板 */
function minimize() {
  opened.value = false;
}

/** 全屏：先收起面板，再打开全屏 */
function openFullscreen() {
  opened.value = false;
  ui.openFullscreen();
}

/** 关闭：停止播放 + 清空队列 → 悬浮球自动消失 */
function close() {
  player.stop();
  opened.value = false;
}

/** 进度条点击跳转 */
function onSeek(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (player.duration) seek(ratio * player.duration);
}
</script>

<template>
  <div v-if="visible" class="vp-fp" :class="{ expanded: opened }">
    <!-- 转盘：点击展开 / 收起 -->
    <button
      class="vp-fp__disc"
      @click="togglePanel"
      :title="opened ? '收起' : '展开'"
      aria-label="展开播放器"
    >
      <VinylDisc :cover="track?.cover" :spinning="player.isPlaying" :size="56" />
    </button>

    <!-- 面板 -->
    <div v-if="opened" class="vp-fp__body">
      <!-- 头部 -->
      <div class="vp-fp__head">
        <div class="vp-fp__meta">
          <div class="vp-fp__title">{{ track?.title ?? '未播放' }}</div>
          <div class="vp-fp__artist">{{ track?.artist ?? '—' }}</div>
        </div>

        <!-- 三个操作按钮：最小化 / 全屏 / 关闭 -->
        <div class="vp-fp__head-actions">
          <button class="vp-fp__icon" @click="minimize" title="最小化">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button class="vp-fp__icon" @click="openFullscreen" title="全屏">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              />
            </svg>
          </button>

          <button class="vp-fp__icon" @click="close" title="关闭播放器">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="vp-fp__bar" @click="onSeek">
        <div class="vp-fp__bar-fill" :style="{ width: progress + '%' }" />
      </div>

      <!-- 时间 -->
      <div class="vp-fp__time">
        <span>{{ fmtTime(player.currentTime) }}</span>
        <span>{{ fmtTime(player.duration) }}</span>
      </div>

      <!-- 播放控制 -->
      <div class="vp-fp__ctrl">
        <button @click="player.prev()" title="上一首">
          <Icon name="shangyiqu" size="1rem" class="vp-fs__icon-sm" />
        </button>
        <button @click="player.togglePlay()" :title="player.isPlaying ? '暂停' : '播放'">
          <Icon v-if="player.isPlaying" name="zanting" size="1rem" class="vp-fs__icon-sm" />
          <Icon v-else name="play" size="1rem" class="vp-fs__icon-sm" />
        </button>
        <button @click="player.next()" title="下一首">
          <Icon name="xiayiqu" size="1rem" class="vp-fs__icon-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
 * 容器
 * ============================================================ */
.vp-fp {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
  transition:
    padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s ease;
}

.vp-fp.expanded {
  border-radius: 16px;
  padding: 14px;
  align-items: flex-start;
  transform: translateY(-2px);
}

/* ============================================================
 * 转盘
 * ============================================================ */
/* .vp-fp__disc {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
} */
.vp-fp__disc:hover {
  transform: scale(1.05);
}
.vp-fp__disc:active {
  transform: scale(0.96);
}
.vp-fp {
  transform-origin: left center;
}

.vp-fp__body {
  transform-origin: 0% 50%; /* 转盘那一侧的中心 */
  animation: vp-fp-pop 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@keyframes vp-fp-pop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================================
 * 面板
 * ============================================================ */
.vp-fp__body {
  width: 240px;
  animation: vp-fp-fade-in 0.25s ease;
}

@keyframes vp-fp-fade-in {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.vp-fp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
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
  line-height: 1.4;
}

.vp-fp__artist {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 三个按钮的容器 */
.vp-fp__head-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* 图标按钮：内联 SVG 用 currentColor 跟随文字色 */
.vp-fp__icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.15s,
    background 0.15s;
  padding: 0;
  line-height: 1;
}
.vp-fp__icon:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}
/* 关闭按钮：hover 时变红，警示性 */
.vp-fp__icon:last-child:hover {
  color: #e05252;
  background: rgba(224, 82, 82, 0.1);
}

/* ============================================================
 * 进度条
 * ============================================================ */
.vp-fp__bar {
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  transition: height 0.15s;
  touch-action: none;
}
.vp-fp__bar:hover {
  height: 6px;
}
.vp-fp__bar-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 2px;
  transition: width 0.1s linear;
  pointer-events: none;
}

/* ============================================================
 * 时间
 * ============================================================ */
.vp-fp__time {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
 * 控制按钮
 * ============================================================ */
.vp-fp__ctrl {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.vp-fp__ctrl button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  padding: 4px;
  border-radius: 50%;
  line-height: 1;
  transition:
    color 0.2s,
    background 0.2s,
    transform 0.15s;
}
.vp-fp__ctrl button:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
}
.vp-fp__ctrl button:active {
  transform: scale(0.9);
}

/* ============================================================
 * 移动端
 * ============================================================ */
@media (max-width: 640px) {
  .vp-fp {
    left: 12px;
    right: auto;
    bottom: 50px;
    padding: 6px;
    gap: 10px;
    max-width: calc(100vw - 24px);
  }

  .vp-fp.expanded {
    padding: 12px;
    border-radius: 14px;
    align-items: center;
  }

  .vp-fp__body {
    width: auto;
    flex: 1;
    min-width: 0;
    max-width: calc(100vw - 100px);
  }

  .vp-fp__title {
    font-size: 13px;
  }

  .vp-fp__artist {
    font-size: 11px;
    margin-top: 1px;
  }

  .vp-fp__icon {
    width: 28px;
    height: 28px;
  }

  .vp-fp__bar {
    height: 3px;
  }

  .vp-fp__time {
    font-size: 10px;
    margin-top: 3px;
  }

  .vp-fp__ctrl {
    gap: 24px;
    margin-top: 8px;
  }

  .vp-fp__ctrl button {
    font-size: 20px;
    padding: 6px 8px;
  }
}

/* ============================================================
 * 超小屏
 * ============================================================ */
@media (max-width: 400px) {
  .vp-fp {
    left: 8px;
    bottom: 8px;
  }

  .vp-fp.expanded {
    padding: 10px;
  }

  .vp-fp__body {
    max-width: calc(100vw - 90px);
  }

  .vp-fp__ctrl {
    gap: 18px;
  }

  .vp-fp__ctrl button {
    font-size: 18px;
  }
}
</style>
