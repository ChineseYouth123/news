<script setup>
import { computed, onMounted, ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { initAudioEngine, seek } from '../audio/engine';
import { fmtTime } from '../utils/format';
import VinylDisc from './VinylDisc.vue';

/* ============================================================
 * 状态
 * ============================================================ */

const player = usePlayerStore();
const ui = useUiStore();

/**
 * 面板展开状态
 * false = 只显示转盘（收起）
 * true  = 转盘 + 面板（展开）
 */
const opened = ref(false);

/* ============================================================
 * 生命周期
 * ============================================================ */

onMounted(() => {
  // 初始化音频引擎（只执行一次，重复调用会被内部守卫拦截）
  initAudioEngine();
});

/* ============================================================
 * 计算属性
 * ============================================================ */

/** 当前播放的曲目对象，为 null 表示还没选过任何歌 */
const track = computed(() => player.currentTrack);

/** 播放进度百分比（0 ~ 100） */
const progress = computed(() =>
  player.duration ? (player.currentTime / player.duration) * 100 : 0
);

/**
 * 是否显示悬浮播放器
 * 只有「有当前曲目」时才显示，避免用户没播放前就看到一个空的悬浮球
 */
const visible = computed(() => !!player.currentTrack);

/* ============================================================
 * 交互方法
 * ============================================================ */

/** 切换面板展开 / 收起 */
function togglePanel() {
  opened.value = !opened.value;
}

/** 关闭面板（回到只有转盘的状态） */
function closePanel() {
  opened.value = false;
}

/** 打开全屏播放器（由 ui store 控制显隐） */
function openFullscreen() {
  ui.openFullscreen();
}

/**
 * 点击进度条跳转
 * 计算点击位置相对进度条宽度的比例，转换为音频时间
 */
function onSeek(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (player.duration) seek(ratio * player.duration);
}
</script>

<template>
  <!-- 根容器：只有有曲目时才渲染 -->
  <div v-if="visible" class="vp-fp" :class="{ expanded: opened }">
    <!-- 转盘：点击展开 / 收起面板 -->
    <button
      class="vp-fp__disc"
      @click="togglePanel"
      :title="opened ? '收起' : '展开'"
      aria-label="展开播放器"
    >
      <VinylDisc :cover="track?.cover" :spinning="player.isPlaying" :size="56" />
    </button>

    <!-- 展开面板：收起时不渲染，节省 DOM 与事件 -->
    <div v-if="opened" class="vp-fp__body">
      <!-- 头部：歌曲信息 + 全屏 / 关闭按钮 -->
      <div class="vp-fp__head">
        <div class="vp-fp__meta">
          <div class="vp-fp__title">{{ track?.title ?? '未播放' }}</div>
          <div class="vp-fp__artist">{{ track?.artist ?? '—' }}</div>
        </div>
        <div class="vp-fp__head-actions">
          <button class="vp-fp__icon" @click="openFullscreen" title="全屏播放">⛶</button>
          <button class="vp-fp__icon" @click="closePanel" title="关闭">✕</button>
        </div>
      </div>

      <!-- 进度条：点击跳转 -->
      <div class="vp-fp__bar" @click="onSeek">
        <div class="vp-fp__bar-fill" :style="{ width: progress + '%' }" />
      </div>

      <!-- 时间：当前 / 总时长 -->
      <div class="vp-fp__time">
        <span>{{ fmtTime(player.currentTime) }}</span>
        <span>{{ fmtTime(player.duration) }}</span>
      </div>

      <!-- 控制按钮：上一首 / 播放暂停 / 下一首 -->
      <div class="vp-fp__ctrl">
        <button @click="player.prev()" title="上一首">⏮</button>
        <button @click="player.togglePlay()" :title="player.isPlaying ? '暂停' : '播放'">
          {{ player.isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="player.next()" title="下一首">⏭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
 * 容器
 * ============================================================ */

/* 默认桌面端：左下角 */
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

/* 展开时：变成卡片（圆角变小、内边距变大、顶部微抬） */
.vp-fp.expanded {
  border-radius: 16px;
  padding: 14px;
  align-items: flex-start;
  transform: translateY(-2px);
}

/* ============================================================
 * 转盘
 * ============================================================ */

.vp-fp__disc {
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
}
/* hover 时轻微放大 */
.vp-fp__disc:hover {
  transform: scale(1.05);
}
/* 按下时轻微缩小，反馈感 */
.vp-fp__disc:active {
  transform: scale(0.96);
}

/* ============================================================
 * 展开面板
 * ============================================================ */

/* 固定宽度，动画上从左侧滑入 */
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

/* 头部布局：左侧歌曲信息 + 右侧按钮组 */
.vp-fp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

/* 歌曲信息区域，min-width: 0 让内部的 ellipsis 生效 */
.vp-fp__meta {
  min-width: 0;
  flex: 1;
}

/* 歌名：单行省略 */
.vp-fp__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 歌手名：更小、更淡 */
.vp-fp__artist {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右上角图标按钮组 */
.vp-fp__head-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 图标按钮：24×24 命中区，圆角悬停背景 */
.vp-fp__icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 14px;
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
  touch-action: none; /* 阻止移动端默认滑动 */
}
/* hover 时加粗，方便点击 */
.vp-fp__bar:hover {
  height: 6px;
}

/* 已播放部分 */
.vp-fp__bar-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 2px;
  transition: width 0.1s linear;
  pointer-events: none; /* 让点击落到父级 .vp-fp__bar */
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
  font-variant-numeric: tabular-nums; /* 数字等宽，避免跳动 */
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
 * 移动端（< 640px）
 * ============================================================ */

@media (max-width: 640px) {
  .vp-fp {
    /* 关键：清掉 right + 保留 left，避免 fixed 下 left+right 被拉伸 */
    left: 12px;
    right: auto;
    bottom: 12px;
    padding: 6px;
    gap: 10px;
    /* 限制最大宽度，防止展开面板溢出屏幕 */
    max-width: calc(100vw - 24px);
  }

  /* 展开时紧凑一些 */
  .vp-fp.expanded {
    padding: 12px;
    border-radius: 14px;
    align-items: center;
  }

  /* 面板宽度自适应，跟随屏幕 */
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

  /* 移动端图标按钮加大点击区域 */
  .vp-fp__icon {
    width: 28px;
    height: 28px;
    font-size: 15px;
  }

  /* 进度条更细，视觉轻一点 */
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
 * 超小屏（< 400px）
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
