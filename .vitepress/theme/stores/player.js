import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProvider } from '../providers';

export const usePlayerStore = defineStore('player', () => {
  /* ============ state ============ */
  const queue = ref([]);
  const currentIndex = ref(-1);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const playMode = ref('order');
  const playlistInfo = ref(null);

  /* ============ getters ============ */
  /**
   * 当前播放曲目
   * queue 空 或 currentIndex = -1 时返回 null
   * → 悬浮播放器用它判断显隐
   */
  const currentTrack = computed(() => queue.value[currentIndex.value] ?? null);

  /* ============ actions ============ */

  /**
   * 加载歌单
   * 关键：不自动设置 currentIndex，等用户点击某首歌时才播
   */
  async function loadPlaylist(id) {
    const provider = getProvider();
    const playlist = await provider.getPlaylist(id);
    playlistInfo.value = playlist;
    queue.value = playlist.tracks;
    // 不自动播放：currentIndex 保持 -1，悬浮播放器不显示
    currentIndex.value = -1;
    return playlist;
  }

  /**
   * 播放指定下标的曲目
   * 这是让悬浮播放器"出现"的触发点
   */
  function playTrackAt(index) {
    if (index < 0 || index >= queue.value.length) return;
    currentIndex.value = index;
    isPlaying.value = true;
  }

  /** 播放 / 暂停切换 */
  function togglePlay() {
    if (!currentTrack.value) return;
    isPlaying.value = !isPlaying.value;
  }

  /** 下一首 */
  function next() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value + 1) % queue.value.length;
    }
    isPlaying.value = true;
  }

  /** 上一首 */
  function prev() {
    if (!queue.value.length) return;
    if (playMode.value === 'random') {
      currentIndex.value = Math.floor(Math.random() * queue.value.length);
    } else {
      currentIndex.value = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
    }
    isPlaying.value = true;
  }

  /**
   * 停止播放并清空"当前曲目"信息
   * 关键：保留 queue（歌单列表还在），只清掉 currentIndex
   * 这样再次点击同一首歌时，playTrackAt 还能正常工作
   */
  function stop() {
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    currentIndex.value = -1;
    // queue 和 playlistInfo 保留，用户再次点歌时需要
  }

  /**
   * 写回真实时长
   * audio engine 探测到实际 duration 后调用
   */
  function setTrackDuration(index, realDuration) {
    if (index < 0 || index >= queue.value.length) return;
    const t = queue.value[index];
    if (t && Number.isFinite(realDuration) && realDuration > 0) {
      t.duration = realDuration;
    }
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
    stop,
    setTrackDuration,
  };
});
