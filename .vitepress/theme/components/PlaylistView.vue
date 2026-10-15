<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vitepress';
import { usePlayerStore } from '../stores/player';
import { setProvider } from '../providers';
import { fmtTime } from '../utils/format';

const route = useRoute();
const player = usePlayerStore();

const playlist = ref(null);
const loading = ref(false);
const error = ref(null);
const providerName = ref('local');

async function load() {
  const id = route.data?.query?.id || '1';
  loading.value = true;
  error.value = null;
  try {
    setProvider(providerName.value);
    // 获取歌单信息
    playlist.value = await player.loadPlaylist(id);
    console.log('playlist.value ----', playlist.value);

    if (player.isPlaying) player.isPlaying = false;
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function changeProvider() {
  load();
}
// 判断当前播放的曲目是否属于当前歌单
const isThisPlaylistPlaying = computed(() => {
  if (!player.currentTrack || !playlist.value) return false;
  return playlist.value.tracks.some((t) => t.id === player.currentTrack.id);
});

// 按钮状态：是否处于"暂停按钮"形态
const isPlayingThisPlaylist = computed(() => isThisPlaylistPlaying.value && player.isPlaying);

function playFn(i) {
  const t = playlist.value?.tracks[i];
  const isCurrentPlaying = player.currentTrack?.id === t?.id;

  // 点的是当前正在播放的歌 → 暂停 / 恢复
  if (isCurrentPlaying) {
    player.togglePlay();
    return;
  }

  // 否则播放该曲目
  player.playTrackAt(i);
}

watch(() => route?.data?.query?.id, load);
onMounted(load);
</script>

<template>
  <div class="vp-pl">
    <div class="vp-pl__toolbar">
      <label>数据源：</label>
      <select v-model="providerName" @change="changeProvider">
        <option value="local">本地文件</option>
        <option value="api">API 接口</option>
      </select>
    </div>

    <div v-if="loading">加载中…</div>
    <div v-else-if="error" class="vp-pl__error">{{ error }}</div>

    <template v-else-if="playlist">
      <div class="vp-pl__header">
        <img v-if="playlist.cover" :src="playlist.cover" class="vp-pl__cover" />
        <div>
          <h1>{{ playlist.name }}</h1>
          <p v-if="playlist.creator">by {{ playlist.creator }}</p>
          <p v-if="playlist.description">{{ playlist.description }}</p>
          <button class="vp-pl__playall" @click="playFn(0)">
            {{ isPlayingThisPlaylist ? '⏸ 暂停' : '▶ 播放全部' }}
          </button>
        </div>
      </div>

      <ul class="vp-pl__tracks">
        <li
          v-for="(t, i) in playlist.tracks"
          :key="t.id"
          :class="{ active: player.currentTrack?.id === t.id }"
          @click="playFn(i)"
        >
          <span class="idx">{{ i + 1 }}</span>
          <span class="title">{{ t.title }}</span>
          <span class="artist">{{ t.artist }}</span>
          <span class="duration">{{ fmtTime(t.duration) }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
<style scoped>
.vp-pl {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

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
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
}

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

.vp-pl__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.vp-pl__header p {
  margin: 4px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.vp-pl__playall {
  margin-top: 16px;
  padding: 10px 24px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background 0.2s,
    transform 0.15s;
}
.vp-pl__playall:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}
.vp-pl__playall:active {
  transform: translateY(0);
}

.vp-pl__tracks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vp-pl__tracks li {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
}

.vp-pl__tracks li:hover {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
}

.vp-pl__tracks li.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border: 1px solid var(--vp-c-brand-1);
  font-weight: 500;
  position: relative;
}

/* 左侧主色竖条 */
.vp-pl__tracks li.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--vp-c-brand-1);
}

/* hover 时给个中间态，比普通 hover 亮但比 active 弱 */
.vp-pl__tracks li:hover:not(.active) {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
}

.vp-pl__tracks .idx {
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}
.vp-pl__tracks li.active .idx {
  color: var(--vp-c-brand-1);
  font-size: 0;
}
.vp-pl__tracks li.active .idx::before {
  font-size: 14px;
}

.vp-pl__tracks .title {
  font-weight: 500;
}

.vp-pl__tracks .artist {
  color: var(--vp-c-text-2);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-pl__tracks .duration {
  color: var(--vp-c-text-3);
  font-size: 13px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.vp-pl__error {
  color: var(--vp-c-danger-1, red);
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.05);
}

/* 移动端 */
@media (max-width: 640px) {
  .vp-pl__header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .vp-pl__cover {
    width: 140px;
    height: 140px;
  }
  .vp-pl__tracks li {
    grid-template-columns: 32px 1fr 50px;
  }
  .vp-pl__tracks .artist {
    display: none;
  }
}
</style>
