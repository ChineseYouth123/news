const index = {
  1: '/music/playlist-1.json',
};

/**
 * 探测音频真实时长
 * @param {string} url 音频地址
 * @param {number} timeout 超时毫秒
 * @returns {Promise<number>} 时长（秒）
 */
function probeAudioDuration(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;

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

    const res = await fetch(url);
    if (!res.ok) throw new Error('本地歌单加载失败');
    const playlist = await res.json();

    // 并发探测每条 track 的真实时长
    await Promise.all(
      playlist.tracks.map(async (track) => {
        try {
          const duration = await probeAudioDuration(track.url);
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
    return track.url;
  },
};
