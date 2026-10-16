import { watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { getProvider } from '../providers';

let audio = null;
let initialized = false;
let watchers = [];
let loadToken = 0;

export function initAudioEngine() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const store = usePlayerStore();
  audio = new Audio();
  audio.preload = 'metadata';

  /* ============ audio 事件 ============ */
  audio.addEventListener('loadedmetadata', () => {
    const realDuration = audio.duration || 0;
    store.duration = realDuration;
    if (Number.isFinite(realDuration) && realDuration > 0) {
      store.setTrackDuration(store.currentIndex, realDuration);
    }
  });

  audio.addEventListener('timeupdate', () => {
    store.currentTime = audio.currentTime;
  });

  audio.addEventListener('ended', () => {
    store.next();
  });

  audio.addEventListener('error', () => {
    console.error('[audio] 播放错误:', audio?.error?.code, audio?.src);
    store.isPlaying = false;
  });

  /* ============ watch：当前曲目变化 ============ */
  watchers.push(
    watch(
      () => store.currentTrack,
      async (track) => {
        // ---- 曲目被清空（stop 调用后）----
        if (!track) {
          if (audio) {
            audio.pause();
            audio.src = '';
          }
          store.currentTime = 0;
          store.duration = 0;
          return;
        }

        if (!audio) return;

        // ---- 加载新音源 ----
        const myToken = ++loadToken;
        try {
          const url = await getProvider().getTrackUrl(track);
          if (myToken !== loadToken || !audio) return;

          audio.src = url;
          audio.load();
          store.currentTime = 0;
          store.duration = track.duration || 0;

          if (store.isPlaying) {
            audio.play().catch((err) => {
              console.warn('[audio] play() 被阻止:', err.name);
              store.isPlaying = false;
            });
          }
        } catch (err) {
          console.error('[audio] 获取音源失败:', err);
          store.isPlaying = false;
        }
      }
    )
  );

  /* ============ watch：播放 / 暂停 ============ */
  watchers.push(
    watch(
      () => store.isPlaying,
      (playing) => {
        if (!audio) return;
        if (playing) {
          if (!audio.src) return; // 没音源，等 currentTrack watch 加载
          audio.play().catch((err) => {
            console.warn('[audio] play() 被阻止:', err.name);
            store.isPlaying = false;
          });
        } else {
          audio.pause();
        }
      }
    )
  );

  /* ============ watch：音量 ============ */
  watchers.push(
    watch(
      () => store.volume,
      (v) => {
        if (audio) audio.volume = v;
      },
      { immediate: true }
    )
  );
}

export function seek(time) {
  if (audio) audio.currentTime = time;
}

export function disposeAudioEngine() {
  watchers.forEach((w) => w());
  watchers = [];
  if (audio) {
    audio.pause();
    audio.src = '';
    audio = null;
  }
  initialized = false;
  loadToken = 0;
}
