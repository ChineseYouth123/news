// .vitepress/siteConfig.ts

/** 站点基础信息 —— 统一管理 */
export const siteMeta = {
  title: '笔记',
  description: '发现和创造的文档11。',
  lang: 'zh-CN',
  base: '/',
  logo: '/images/logo.png',
  copyright: 'Copyright (c) 2026',
  github: 'https://github.com/vuejs/vitepress',
};

/** RSS 配置-站点域名：开发用本地，构建用正式 */
// 网址是本地部署地址，后续可以换为线上地址
export const siteUrl = 'http://localhost:4173';

/** RSS 配置（复用上面的基础信息） */
export const rssOptions = {
  title: siteMeta.title,
  baseUrl: siteUrl,
  copyright: siteMeta.copyright,
  filter: (post) => post.url.startsWith('/blog/'),
};
