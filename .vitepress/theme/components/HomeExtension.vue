<!-- .vitepress/theme/components/HomeExtension.vue -->
<script setup>
import { withBase } from 'vitepress';
import { ref } from 'vue';
import HomeEffect from './HomeEffect.vue';
import { siteMeta } from '../../../siteConfig.js';

const currentEffect = ref('red-ray');

const links = [
  {
    title: '博客文章',
    desc: '记录技术沉淀、日常分享与深度思考。',
    icon: '📝',
    link: withBase('/pages/blog/'),
    color: 'var(--news-brand)',
  },
  {
    title: '资料文件',
    desc: '支持 PDF、Word、Excel 和图片的在线预览。',
    icon: '📂',
    link: withBase('/pages/materials/'),
    color: 'var(--tag-eco-fg)',
  },
  {
    title: '音乐播放器',
    desc: '沉浸式全屏播放，专属歌单随时听。',
    icon: '🎵',
    link: withBase('/pages/playlist'),
    color: 'var(--tag-deep-fg)',
  },
  {
    title: '关于与感谢',
    desc: '了解站点背后的故事与开源支持。',
    icon: '💡',
    link: withBase('/pages/thanks/'),
    color: 'var(--tag-sec-fg)',
  },
];
</script>

<template>
  <div class="home-wrapper">
    <div class="home-content">
      <!-- ==================== A. 首屏 Hero 区 ==================== -->
      <header class="hero-section">
        <div class="hero-logo-container">
          <HomeEffect :type="currentEffect">
            <img :src="withBase(siteMeta.logo)" alt="Logo" class="hero-logo" />
          </HomeEffect>
        </div>

        <div class="hero-text-group">
          <h1 class="hero-title">{{ siteMeta.title }}</h1>
          <p class="hero-tagline">{{ siteMeta.tagline }}</p>
          <p class="hero-desc">{{ siteMeta.description }}</p>
        </div>

        <div class="hero-actions">
          <a :href="withBase('/pages/blog/')" class="btn btn-primary">
            开始阅读 <span class="arrow">→</span>
          </a>
          <a :href="withBase('/pages/materials/')" class="btn btn-secondary">资料库</a>
          <a
            href="https://github.com/vuejs/vitepress"
            target="_blank"
            rel="noopener"
            class="btn btn-secondary"
            >GitHub</a
          >
        </div>
      </header>

      <!-- ==================== B. 数据统计面板 ==================== -->
      <section class="stats-panel">
        <div class="stat-item">
          <span class="stat-num">10+</span>
          <span class="stat-label">篇沉淀文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">24/7</span>
          <span class="stat-label">随时记录灵感</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">∞</span>
          <span class="stat-label">无限探索可能</span>
        </div>
      </section>

      <!-- ==================== C. 导航卡片网格 ==================== -->
      <section class="nav-grid">
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
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
 * 0. 基础容器
 * ============================================================ */
.home-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-color: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
}

.home-content {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 24px 100px;
  width: 100%;
  box-sizing: border-box;
}

/* ============================================================
 * A. Hero 区域排版
 * ============================================================ */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 72px;
}

.hero-logo-container {
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
}

.hero-logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
  animation: float 6s ease-in-out infinite;
  filter: drop-shadow(0 0 24px var(--news-brand-soft));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-text-group {
  max-width: 680px;
  margin-bottom: 40px;
}

/* 🔽 标题：使用主题变量 */
.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px;
  letter-spacing: -0.02em;

  /* 使用中国红到暗红的渐变 */
  background: linear-gradient(135deg, var(--news-brand), var(--news-brand-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-tagline {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
}

.hero-desc {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 99px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 🔽 按钮：使用 VitePress 主题变量 */
.btn-primary {
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text) !important;
  box-shadow: 0 4px 16px var(--news-brand-soft);
}
.btn-primary:hover {
  background-color: var(--vp-button-brand-hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--news-brand-soft);
}
.btn-primary .arrow {
  transition: transform 0.25s;
}
.btn-primary:hover .arrow {
  transform: translateX(4px);
}

.btn-secondary {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1) !important;
  border: 1px solid var(--vp-c-divider);
}
.btn-secondary:hover {
  border-color: var(--news-brand);
  color: var(--news-brand) !important;
  transform: translateY(-2px);
}

/* ============================================================
 * B. 统计面板
 * ============================================================ */
.stats-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 32px 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  margin-bottom: 56px;
  border: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 🔽 数据数字：统一使用主题红 */
.stat-num {
  font-size: 32px;
  font-weight: 800;
  color: var(--news-brand);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--vp-c-divider);
  opacity: 0.6;
}

/* ============================================================
 * C. 导航卡片
 * ============================================================ */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
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

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08);
  border-color: var(--card-color);
}

.card-icon {
  font-size: 24px;
  line-height: 1;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s;
}

.nav-card:hover .card-icon {
  transform: scale(1.1) rotate(-5deg);
}

.card-content h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.card-content p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.card-arrow {
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 18px;
  color: var(--card-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.nav-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ============================================================
 * D. 移动端适配
 * ============================================================ */
@media (max-width: 768px) {
  .home-content {
    padding: 48px 20px 80px;
  }
  .hero-logo {
    width: 110px;
    height: 110px;
  }
  .hero-title {
    font-size: 2.2rem;
  }
  .hero-tagline {
    font-size: 1.1rem;
  }
  .hero-desc {
    font-size: 0.95rem;
  }
  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  .btn {
    justify-content: center;
    width: 100%;
  }
  .stats-panel {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    margin-bottom: 40px;
  }
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding: 0 12px;
  }
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .nav-card {
    padding: 20px;
  }
  .card-arrow {
    display: none;
  }
}
</style>
