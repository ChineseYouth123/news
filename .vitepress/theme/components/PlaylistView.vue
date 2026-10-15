<script setup>
import { ref, onMounted, watch } from 'vue';
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

function playFn(i) {
  console.log('[PlaylistView] play 被点击, index =', i);
  console.log('[PlaylistView] 当前 playlist.tracks =', playlist.value?.tracks);
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
          <button class="vp-pl__playall" @click="playFn(0)">▶ 播放全部</button>
        </div>
      </div>

      <ul class="vp-pl__tracks">
        <li
          v-for="(t, i) in playlist.tracks"
          :key="t.id"
          :class="{ active: player.currentTrack?.id === t.id }"
          @click="play(i)"
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
}
.vp-pl__toolbar {
  margin-bottom: 16px;
}
.vp-pl__header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.vp-pl__cover {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
}
.vp-pl__playall {
  margin-top: 12px;
  padding: 8px 20px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
}
.vp-pl__tracks {
  list-style: none;
  padding: 0;
}
.vp-pl__tracks li {
  display: grid;
  grid-template-columns: 40px 1fr 200px 60px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.vp-pl__tracks li:hover {
  background: var(--vp-c-bg-soft);
}
.vp-pl__tracks li.active {
  color: var(--vp-c-brand-1);
}
.vp-pl__error {
  color: var(--vp-c-danger-1, red);
}
</style>
