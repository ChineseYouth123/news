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

  const currentTrack = computed(() => queue.value[currentIndex.value] ?? null);

  async function loadPlaylist(id) {
    const provider = getProvider();
    const playlist = await provider.getPlaylist(id);
    playlistInfo.value = playlist;
    queue.value = playlist.tracks;
    currentIndex.value = playlist.tracks.length ? 0 : -1;
    return playlist;
  }

  function playTrackAt(index) {
    if (index < 0 || index >= queue.value.length) return;
    currentIndex.value = index;
    isPlaying.value = true;
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value;
  }

  function next() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value + 1) % queue.value.length;
    }
    isPlaying.value = true;
  }

  function prev() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
    }
    isPlaying.value = true;
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
