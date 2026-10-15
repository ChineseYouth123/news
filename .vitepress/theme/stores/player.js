import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProvider } from '../providers';

export const usePlayerStore = defineStore('player', () => {
  const queue = ref([]);
  const currentIndex = ref(-1);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const playMode = ref('order');
  const playlistInfo = ref(null);

  const currentTrack = computed(() => {
    const t = queue.value[currentIndex.value] ?? null;
    console.log('[player] currentTrack 计算:', t?.title, '| index =', currentIndex.value);
    return t;
  });

  async function loadPlaylist(id) {
    console.log('[player] loadPlaylist 开始, id =', id);
    const provider = getProvider();
    const playlist = await provider.getPlaylist(id);
    console.log('[player] 歌单加载成功:', playlist.name, '| tracks =', playlist.tracks.length);
    playlistInfo.value = playlist;
    queue.value = playlist.tracks;
    currentIndex.value = playlist.tracks.length ? 0 : -1;
    console.log('[player] queue 已填充, currentIndex =', currentIndex.value);
    return playlist;
  }

  function playTrackAt(index) {
    console.log('[player] playTrackAt 被调用, index =', index);
    if (index < 0 || index >= queue.value.length) {
      console.warn('[player] index 越界, 忽略');
      return;
    }
    currentIndex.value = index;
    isPlaying.value = true;
    console.log(
      '[player] 状态已更新: currentIndex =',
      currentIndex.value,
      '| isPlaying =',
      isPlaying.value,
      '| track =',
      queue.value[index]?.title
    );
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value;
    console.log('[player] togglePlay → isPlaying =', isPlaying.value);
  }

  function next() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value + 1) % queue.value.length;
    }
    isPlaying.value = true;
    console.log('[player] next → index =', currentIndex.value);
  }

  function prev() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
    }
    isPlaying.value = true;
    console.log('[player] prev → index =', currentIndex.value);
  }

  return {
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    playlistInfo,
    currentTrack,
    loadPlaylist,
    playTrackAt,
    togglePlay,
    next,
    prev,
  };
});
