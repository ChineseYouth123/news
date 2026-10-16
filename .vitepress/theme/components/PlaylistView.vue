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

/* ============ 加载歌单 ============ */
async function load() {
  const id = route.data?.query?.id || '1';
  loading.value = true;
  error.value = null;
  try {
    setProvider(providerName.value);
    const data = await player.loadPlaylist(id);
    playlist.value = data;

    // 切歌单时，如果正在播放，先停掉
    if (player.isPlaying) player.isPlaying = false;
    // 清掉当前的 currentTrack，悬浮球自动消失
    player.stop();
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function changeProvider() {
  if (player.isPlaying) player.isPlaying = false;
  player.stop();
  load();
}

/* ============ 计算属性 ============ */
const isThisPlaylistPlaying = computed(() => {
  if (!player.currentTrack || !playlist.value) return false;
  return playlist.value.tracks.some((t) => t.id === player.currentTrack.id);
});

const isPlayingThisPlaylist = computed(() => isThisPlaylistPlaying.value && player.isPlaying);

const currentTrackId = computed(() => player.currentTrack?.id ?? null);

/* ============ 播放控制 ============ */
function playFn(i) {
  const t = playlist.value?.tracks[i];
  if (!t) return;

  const isCurrent = currentTrackId.value === t.id;
  if (isCurrent) {
    player.togglePlay();
    return;
  }

  player.playTrackAt(i);
}

function onPlayAll() {
  if (isPlayingThisPlaylist.value || isThisPlaylistPlaying.value) {
    player.togglePlay();
    return;
  }
  player.playTrackAt(0);
}

/* ============ 生命周期 ============ */
watch(() => route?.data?.query?.id, load);
onMounted(load);
</script>

<template>
  <div class="vp-pl">
    <div class="vp-pl__toolbar">
      <label>数据源：本地文件</label>
      <!-- <select v-model="providerName" @change="changeProvider"> -->
      <!-- <option value="local">本地文件</option> -->
      <!-- <option value="api">API 接口</option> -->
      <!-- </select> -->
    </div>

    <div v-if="loading" class="vp-pl__loading">加载中…</div>
    <div v-else-if="error" class="vp-pl__error">{{ error }}</div>

    <template v-else-if="playlist">
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

      <ul class="vp-pl__tracks">
        <li
          v-for="(t, i) in playlist.tracks"
          :key="t.id"
          :class="{ active: currentTrackId === t.id }"
          @click="playFn(i)"
        >
          <span class="idx">
            <template v-if="currentTrackId === t.id && player.isPlaying">
              <Icon name="music" size="1rem" />
            </template>
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
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.vp-pl__toolbar select:hover {
  border-color: var(--vp-c-brand-1);
}

.vp-pl__loading {
  padding: 40px 0;
  text-align: center;
  color: var(--vp-c-text-2);
}
.vp-pl__error {
  color: var(--vp-c-danger-1, red);
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.05);
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
.vp-pl__header-info {
  flex: 1;
  min-width: 0;
}
.vp-pl__header-info h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
}
.vp-pl__header-info p {
  margin: 4px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

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
    transform 0.15s;
}
.vp-pl__playall:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}
.vp-pl__playall.is-playing {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.vp-pl__tracks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vp-pl__tracks li {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.vp-pl__tracks li:hover:not(.active) {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}
.vp-pl__tracks li.active {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, rgba(62, 175, 124, 0.12));
  font-weight: 500;
}

.vp-pl__tracks .idx {
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}
.vp-pl__tracks li.active .idx {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.vp-pl__tracks .title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (max-width: 640px) {
  .vp-pl {
    padding: 16px;
  }
  .vp-pl__header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
  .vp-pl__cover {
    width: 140px;
    height: 140px;
  }
  .vp-pl__header-info h1 {
    font-size: 22px;
  }
  .vp-pl__tracks li {
    grid-template-columns: 32px 1fr 50px;
  }
  .vp-pl__tracks .artist {
    display: none;
  }
}
</style>
