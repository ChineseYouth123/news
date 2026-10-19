// .vitepress/siteConfig.ts

/** 站点基础信息 —— 统一管理 */
export const siteMeta = {
  title: '红色博客',
  description: '全心全意为人民服务',
  tagline: '致力于红色文化的传承与交流，推动无产阶级事业不断前进',
  lang: 'zh-CN',
  base: '/news/',
  logo: '/images/dongfanghong-red.png',
  copyright: 'Copyright (c) 2026',
  github: 'https://github.com/ChineseYouth123/news/',
};

/** RSS 配置-站点域名：开发用本地，构建用正式 */
// 网址是本地部署地址，后续可以换为线上地址
export const siteUrl = 'https://chineseyouth123.github.io/news/';

/** RSS 配置（复用上面的基础信息） */
export const rssOptions = {
  title: siteMeta.title,
  baseUrl: siteUrl,
  copyright: siteMeta.copyright,
  filter: (post) => post.url.startsWith('/blog/'),
};
