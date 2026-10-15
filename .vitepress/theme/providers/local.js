const index = {
  1: '/music/playlist-1.json',
};

export const localProvider = {
  name: 'local',
  async getPlaylist(id) {
    const url = index[id];
    if (!url) throw new Error(`本地歌单 ${id} 不存在`);
    const res = await fetch(url);
    if (!res.ok) throw new Error('本地歌单加载失败');
    return res.json();
  },
  async getTrackUrl(track) {
    return track.url;
  },
};
