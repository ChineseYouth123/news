import { withBase } from 'vitepress';

const index = {
  1: '/music/playlist-1.json',
};

/**
 * 探测音频真实时长
 * @param {string} url 音频地址（不需要在这里处理 withBase，调用时传处理后的完整路径）
 * @param {number} timeout 超时毫秒
 * @returns {Promise<number>} 时长（秒）
 */
function probeAudioDuration(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url; // 直接使用传入的完整路径

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      audio.src = '';
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.removeEventListener('error', onError);
      clearTimeout(timer);
    };

    const onLoad = () => {
      const d = audio.duration;
      cleanup();
      if (Number.isFinite(d) && d > 0) resolve(d);
      else reject(new Error('invalid duration'));
    };

    const onError = () => {
      cleanup();
      reject(new Error('load failed'));
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, timeout);

    audio.addEventListener('loadedmetadata', onLoad);
    audio.addEventListener('error', onError);
  });
}

export const localProvider = {
  name: 'local',

  async getPlaylist(id) {
    const url = index[id];
    if (!url) throw new Error(`本地歌单 ${id} 不存在`);

    // 🔽 修复 1：请求 JSON 文件需要加 base 前缀
    const fullUrl = withBase(url);
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error('本地歌单加载失败');
    const playlist = await res.json();

    // 并发探测每条 track 的真实时长
    await Promise.all(
      playlist.tracks.map(async (track) => {
        try {
          // 🔽 修复 2：探测音频时长时，也要传入加过前缀的路径
          const audioUrl = withBase(track.url);
          const duration = await probeAudioDuration(audioUrl);
          track.duration = duration;
        } catch (e) {
          console.warn(`[local] 探测时长失败: ${track.url}`, e.message);
          // 保留 JSON 里的原值
        }
      })
    );

    return playlist;
  },

  async getTrackUrl(track) {
    // 🔽 修复 3：返回给播放器引擎的最终地址也要加前缀
    return withBase(track.url);
  },
};
