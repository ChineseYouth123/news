import { watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import { getProvider } from '../providers';

let audio = null;
let initialized = false;
let watchers = [];
let loadToken = 0;

export function initAudioEngine() {
  console.log('[audio] initAudioEngine 被调用, initialized =', initialized);
  if (initialized || typeof window === 'undefined') {
    console.log('[audio] 跳过初始化（已初始化或非浏览器环境）');
    return;
  }
  initialized = true;

  const store = usePlayerStore();
  audio = new Audio();
  audio.preload = 'metadata';
  console.log('[audio] Audio 实例已创建');

  audio.addEventListener('loadstart', () => {
    console.log('[audio] 事件 loadstart, src =', audio.src);
  });

  audio.addEventListener('loadedmetadata', () => {
    console.log('[audio] 事件 loadedmetadata, duration =', audio.duration);
    store.duration = audio.duration || store.duration;
  });

  audio.addEventListener('canplay', () => {
    console.log('[audio] 事件 canplay, 可以播放了');
  });

  audio.addEventListener('play', () => {
    console.log('[audio] 事件 play');
  });

  audio.addEventListener('playing', () => {
    console.log('[audio] 事件 playing, currentTime =', audio.currentTime);
  });

  audio.addEventListener('pause', () => {
    console.log('[audio] 事件 pause');
  });

  audio.addEventListener('timeupdate', () => {
    // 日志太密，注释掉；需要时打开
    // console.log('[audio] timeupdate', audio.currentTime)
    store.currentTime = audio.currentTime;
  });

  audio.addEventListener('ended', () => {
    console.log('[audio] 事件 ended, 自动下一首');
    store.next();
  });

  audio.addEventListener('error', () => {
    console.error('[audio] 事件 error, code =', audio?.error?.code, '| src =', audio?.src);
    store.isPlaying = false;
  });

  // —— 当前曲目变化 → 换源 ——
  watchers.push(
    watch(
      () => store.currentTrack,
      async (track) => {
        console.log('[audio] watch currentTrack 触发:', track?.title);
        if (!track || !audio) {
          console.log('[audio] track 或 audio 为空, 跳过');
          return;
        }
        const myToken = ++loadToken;
        try {
          const url = await getProvider().getTrackUrl(track);
          console.log(
            '[audio] 拿到音源 URL =',
            url,
            '| token =',
            myToken,
            '| 当前 token =',
            loadToken
          );
          if (myToken !== loadToken || !audio) {
            console.log('[audio] token 已过期, 放弃本次加载');
            return;
          }
          console.log('[audio] 设置 audio.src 并 load()');
          audio.src = url;
          audio.load();
          store.currentTime = 0;
          store.duration = track.duration || 0;

          console.log('[audio] 检查 isPlaying =', store.isPlaying);
          if (store.isPlaying) {
            console.log('[audio] 尝试 play()');
            audio
              .play()
              .then(() => console.log('[audio] play() 成功'))
              .catch((err) => {
                console.warn('[audio] play() 被阻止:', err.name, err.message);
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

  // —— 播放/暂停 ——
  watchers.push(
    watch(
      () => store.isPlaying,
      (playing) => {
        console.log('[audio] watch isPlaying 触发:', playing);
        if (!audio) {
          console.log('[audio] audio 为空, 跳过');
          return;
        }
        if (playing) {
          console.log('[audio] 尝试 play()');
          audio
            .play()
            .then(() => console.log('[audio] play() 成功'))
            .catch((err) => {
              console.warn('[audio] play() 被阻止:', err.name, err.message);
              store.isPlaying = false;
            });
        } else {
          console.log('[audio] 尝试 pause()');
          audio.pause();
        }
      }
    )
  );

  // —— 音量 ——
  watchers.push(
    watch(
      () => store.volume,
      (v) => {
        console.log('[audio] watch volume 触发:', v);
        if (audio) audio.volume = v;
      },
      { immediate: true }
    )
  );

  console.log('[audio] initAudioEngine 完成');
}

export function seek(time) {
  console.log('[audio] seek 到', time);
  if (audio) audio.currentTime = time;
}

export function disposeAudioEngine() {
  console.log('[audio] disposeAudioEngine');
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
