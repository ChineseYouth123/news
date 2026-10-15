const BASE = import.meta.env.VITE_MUSIC_API || '';

export const apiProvider = {
  name: 'api',
  async getPlaylist(id) {
    const res = await fetch(`${BASE}/playlist/${id}`);
    if (!res.ok) throw new Error('API 歌单加载失败');
    return res.json();
  },
  async getTrackUrl(track) {
    return track.url.startsWith('http') ? track.url : `${BASE}${track.url}`;
  },
  async getLyrics(track) {
    const res = await fetch(`${BASE}/lyric/${track.id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.lyric ?? null;
  },
};
