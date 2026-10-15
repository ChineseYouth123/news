<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vitepress';
import { usePlayerStore } from '../stores/player';
import { setProvider } from '../providers';
import { fmtTime } from '../utils/format';

/* ============================================================
 * 状态
 * ============================================================ */

const route = useRoute();
const player = usePlayerStore();

/** 当前歌单数据 */
const playlist = ref(null);
/** 加载中标记 */
const loading = ref(false);
/** 错误信息 */
const error = ref(null);
/** 数据源：local | api */
const providerName = ref('local');

/* ============================================================
 * 计算属性
 * ============================================================ */

/**
 * 当前播放的曲目是否属于本歌单
 * 用于判断"播放全部"按钮的状态
 */
const isThisPlaylistPlaying = computed(() => {
  if (!player.currentTrack || !playlist.value) return false;
  return playlist.value.tracks.some((t) => t.id === player.currentTrack.id);
});

/**
 * 本歌单是否正在播放（含"处于播放状态"）
 * 用于按钮文案和样式切换
 */
const isPlayingThisPlaylist = computed(() => isThisPlaylistPlaying.value && player.isPlaying);

/**
 * 本歌单当前是否激活（不管有没有在播放）
 * 用于列表的选中样式判断
 */
const currentTrackId = computed(() => player.currentTrack?.id ?? null);

/* ============================================================
 * 加载歌单
 * ============================================================ */

async function load() {
  const id = route.data?.query?.id || '1';
  loading.value = true;
  error.value = null;

  try {
    setProvider(providerName.value);
    const data = await player.loadPlaylist(id);
    playlist.value = data;

    // 切换歌单后停止播放，避免"播着上一首但显示新歌单"的怪异状态
    if (player.isPlaying) player.isPlaying = false;
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

/** 切换数据源 */
function changeProvider() {
  // 切源前先暂停，避免旧音源还在响
  if (player.isPlaying) player.isPlaying = false;
  load();
}

/* ============================================================
 * 播放控制
 * ============================================================ */

/**
 * 点击某一行的处理：
 * - 点当前正在播放的歌 → 暂停
 * - 点当前暂停中的歌 → 继续播放
 * - 点其他歌 → 切到该曲并播放
 */
function playFn(i) {
  const t = playlist.value?.tracks[i];
  if (!t) return;

  const isCurrent = currentTrackId.value === t.id;

  if (isCurrent) {
    // 就是当前曲目 → 切换播放/暂停
    player.togglePlay();
    return;
  }

  // 其他曲目 → 切歌
  player.playTrackAt(i);
}

/**
 * "播放全部"按钮：
 * - 本歌单正在播放 → 暂停
 * - 本歌单暂停中 / 未播放 → 从第 0 首开始
 */
function onPlayAll() {
  if (isPlayingThisPlaylist.value) {
    player.togglePlay();
    return;
  }

  // 如果当前暂停的是本歌单的某首歌，继续播放而不是从第一首开始
  if (isThisPlaylistPlaying.value) {
    player.togglePlay();
    return;
  }

  // 否则从头开始
  player.playTrackAt(0);
}

/* ============================================================
 * 生命周期
 * ============================================================ */

watch(() => route?.data?.query?.id, load);
onMounted(load);
</script>

<template>
  <div class="vp-pl">
    <!-- ============ 工具栏 ============ -->
    <!-- <div class="vp-pl__toolbar">
      <label>数据源：</label>
      <select v-model="providerName" @change="changeProvider">
        <option value="local">本地文件</option>
        <option value="api">API 接口</option>
      </select>
    </div> -->

    <!-- ============ 状态提示 ============ -->
    <div v-if="loading" class="vp-pl__loading">加载中…</div>
    <div v-else-if="error" class="vp-pl__error">{{ error }}</div>

    <!-- ============ 歌单内容 ============ -->
    <template v-else-if="playlist">
      <!-- 歌单头部 -->
      <div class="vp-pl__header">
        <img v-if="playlist.cover" :src="playlist.cover" class="vp-pl__cover" />
        <div class="vp-pl__header-info">
          <h1>{{ playlist.name }}</h1>
          <p v-if="playlist.creator">by {{ playlist.creator }}</p>
          <p v-if="playlist.description">{{ playlist.description }}</p>
          <button
            class="vp-pl__playall"
            :class="{ 'is-playing': isPlayingThisPlaylist }"
            @click="onPlayAll"
          >
            <span class="vp-pl__playall-icon">
              {{ isPlayingThisPlaylist ? '⏸' : '▶' }}
            </span>
            <span>{{ isPlayingThisPlaylist ? '暂停' : '播放全部' }}</span>
          </button>
        </div>
      </div>

      <!-- 曲目列表 -->
      <ul class="vp-pl__tracks">
        <li
          v-for="(t, i) in playlist.tracks"
          :key="t.id"
          :class="{ active: currentTrackId === t.id }"
          @click="playFn(i)"
        >
          <span class="idx">
            <!-- 当前曲目且正在播放时显示 ♪，否则显示序号 -->
            <template v-if="currentTrackId === t.id && player.isPlaying">♪</template>
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="title">{{ t.title }}</span>
          <span class="artist">{{ t.artist }}</span>
          <span class="duration">{{ fmtTime(t.duration) }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================
 * 容器
 * ============================================================ */
.vp-pl {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ============================================================
 * 工具栏
 * ============================================================ */
.vp-pl__toolbar {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vp-pl__toolbar label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.vp-pl__toolbar select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.vp-pl__toolbar select:hover {
  border-color: var(--vp-c-brand-1);
}
.vp-pl__toolbar select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft, rgba(62, 175, 124, 0.15));
}

/* ============================================================
 * 加载 / 错误
 * ============================================================ */
.vp-pl__loading {
  padding: 40px 0;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.vp-pl__error {
  color: var(--vp-c-danger-1, red);
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.05);
  font-size: 14px;
}

/* ============================================================
 * 歌单头部
 * ============================================================ */
.vp-pl__header {
  display: flex;
  gap: 28px;
  margin-bottom: 36px;
  align-items: flex-start;
}

.vp-pl__cover {
  width: 180px;
  height: 180px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.vp-pl__header-info {
  flex: 1;
  min-width: 0;
}

.vp-pl__header-info h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.vp-pl__header-info p {
  margin: 4px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

/* ============================================================
 * 播放全部按钮
 * ============================================================ */
.vp-pl__playall {
  margin-top: 16px;
  padding: 10px 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
}
.vp-pl__playall:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--vp-c-brand-soft, rgba(62, 175, 124, 0.3));
}
.vp-pl__playall:active {
  transform: translateY(0);
}

/* 正在播放时的按钮形态：描边风格，视觉弱化 */
.vp-pl__playall.is-playing {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.vp-pl__playall.is-playing:hover {
  background: var(--vp-c-brand-soft, rgba(62, 175, 124, 0.1));
  box-shadow: none;
}

.vp-pl__playall-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}

/* ============================================================
 * 曲目列表
 * ============================================================ */
.vp-pl__tracks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px; /* 列表项之间留一点空隙，方便看出 hover */
}

.vp-pl__tracks li {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;
  position: relative;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

/* hover（非 active） */
.vp-pl__tracks li:hover:not(.active) {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

/* 当前曲目（不管播放还是暂停） */
.vp-pl__tracks li.active {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, rgba(62, 175, 124, 0.12));
  font-weight: 500;
}

/* ============ 序号 ============ */
.vp-pl__tracks .idx {
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  transition: color 0.15s;
}
.vp-pl__tracks li.active .idx {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* ============ 标题 ============ */
.vp-pl__tracks .title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============ 歌手 ============ */
.vp-pl__tracks .artist {
  color: var(--vp-c-text-2);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vp-pl__tracks li.active .artist {
  color: var(--vp-c-brand-1);
  opacity: 0.8;
}

/* ============ 时长 ============ */
.vp-pl__tracks .duration {
  color: var(--vp-c-text-3);
  font-size: 13px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ============================================================
 * 移动端
 * ============================================================ */
@media (max-width: 640px) {
  .vp-pl {
    padding: 16px;
  }

  .vp-pl__header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
    margin-bottom: 24px;
  }

  .vp-pl__cover {
    width: 140px;
    height: 140px;
  }

  .vp-pl__header-info h1 {
    font-size: 22px;
  }

  .vp-pl__playall {
    margin-top: 12px;
  }

  .vp-pl__tracks li {
    grid-template-columns: 32px 1fr 50px;
    padding: 10px 12px;
  }

  /* 移动端隐藏歌手列 */
  .vp-pl__tracks .artist {
    display: none;
  }

  .vp-pl__tracks li.active::before {
    top: 8px;
    bottom: 8px;
  }
}
</style>
