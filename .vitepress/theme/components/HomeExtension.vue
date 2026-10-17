<!-- .vitepress/theme/components/HomeExtension.vue -->
<script setup>
const links = [
  {
    title: '博客文章',
    desc: '记录抖音分享、记录与日常思考。',
    icon: '📝',
    link: '/pages/blog/',
    color: 'var(--vp-c-brand-1)',
  },
  {
    title: '资料文件',
    desc: '支持 PDF、Word、Excel 和图片的在线预览。',
    icon: '📂',
    link: '/pages/materials/',
    color: '#e05252',
  },
  {
    title: '音乐播放器',
    desc: '沉浸式全屏播放，红色专属歌单。',
    icon: '🎵',
    link: '/pages/playlist',
    color: '#3182ce',
  },
  {
    title: '关于与感谢',
    desc: '了解这个站点背后的故事与技术支持。',
    icon: '💡',
    link: '/pages/thanks/',
    color: '#805ad5',
  },
];
</script>

<template>
  <div class="home-extension">
    <!-- 数据统计面板：移动端纵向堆叠，PC端横向排列 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-num">10+</span>
        <span class="stat-label">篇沉淀文章</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">24/7</span>
        <span class="stat-label">随时记录灵感</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">∞</span>
        <span class="stat-label">无限探索可能</span>
      </div>
    </div>

    <!-- 功能导航卡片：Grid 自适应 -->
    <div class="nav-grid">
      <a
        v-for="item in links"
        :key="item.title"
        :href="item.link"
        class="nav-card"
        :style="{ '--card-color': item.color }"
      >
        <div class="card-icon">{{ item.icon }}</div>
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <div class="card-arrow">→</div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.home-extension {
  /* max-width: 1152px; */
  margin: 0 auto;
  /* padding: 40px 24px 80px; */
}

/* ==========================================
 * 1. 统计面板
 * ========================================== */
.stats-panel {
  display: flex;
  justify-content: space-around;
  padding: 32px;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  margin-bottom: 48px;
  border: 1px solid var(--vp-c-divider);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.stat-num {
  font-size: 32px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.stat-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

/* ==========================================
 * 2. 导航网格（核心响应式逻辑）
 * ========================================== */
.nav-grid {
  display: grid;
  /* PC 端自动排布，移动端自动塌陷为 1 列 */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.nav-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  text-decoration: none !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

/* 卡片悬浮效果 */
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.1);
  border-color: var(--card-color);
}
.nav-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

.card-icon {
  font-size: 28px;
  line-height: 1;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.card-content p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.card-arrow {
  position: absolute;
  right: 24px;
  bottom: 24px;
  font-size: 20px;
  color: var(--card-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

/* ==========================================
 * 3. 移动端专项适配（<= 640px）
 * ========================================== */
@media (max-width: 640px) {
  .home-extension {
    /* padding: 24px 16px 60px; */
  }

  .stats-panel {
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 8px;
  }

  .nav-grid {
    grid-template-columns: 1fr; /* 强制单列 */
    gap: 16px;
  }

  .nav-card {
    padding: 20px;
  }

  /* 移动端隐藏悬浮箭头，节省空间 */
  .card-arrow {
    display: none;
  }
}
</style>
