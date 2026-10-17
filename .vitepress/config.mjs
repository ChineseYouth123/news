import { defineConfig } from 'vitepress';
import path from 'path';
import { withPwa } from '@vite-pwa/vitepress';
import { fileURLToPath } from 'node:url';
import { RssPlugin } from 'vitepress-plugin-rss';
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind';
import { siteMeta, rssOptions } from '../siteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default withPwa(
  defineConfig({
    // 从基础配置引用
    base: siteMeta.base,
    lang: siteMeta.lang,
    title: siteMeta.title,
    description: siteMeta.description,
    logo: siteMeta.logo,

    head: [
      [
        'link',
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          href: `${siteMeta.base}feed.rss`,
          title: 'RSS Feed',
        },
      ],
    ],

    titleTemplate: 'Vite & Vue powered static site generator',
    srcDir: 'src/',
    layout: 'page',
    navbar: false,
    sidebar: true,
    aside: false,
    watch: ['path/to/files/**/*'],

    themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: '博客', link: '/pages/blog/' },
        { text: '资料', link: '/pages/materials/' },
        {
          text: '更多',
          items: [{ text: '音乐', link: '/pages/playlist' }],
        },
        {
          text: '关于',
          activeMatch: `^/about/`,
          items: [
            { text: '反馈与建议', link: '/pages/about/faq' },
            { text: '感谢', link: '/pages/thanks/' },
          ],
        },
      ],
      outline: { level: 'deep', label: '目录' },
      sidebar: [],
      search: { provider: 'local' },
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
      langMenuLabel: '切换语言',
      externalLinkIcon: true,
      socialLinks: [{ icon: 'github', link: siteMeta.github }],
      footer: {
        copyright: `本中文文档采用 知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议 (CC BY-NC-SA 4.0) 进行许可。`,
      },
    },

    pwa: {
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/assets/chunks/**', '**/materials/**'],
      },
      manifest: {
        name: '我的笔记',
        short_name: '笔记',
        description: siteMeta.description,
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: '桌面端预览',
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: '移动端预览',
          },
        ],
      },
    },

    vite: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '/src'),
        },
      },
      plugins: [
        pagefindPlugin({
          customSearchQuery: chineseSearchOptimize,
          btnPlaceholder: '搜索',
          placeholder: '搜索文档',
          emptyText: '空空如也',
          heading: '共: {{searchResult}} 条结果',
          excludeSelector: ['img', 'a.header-anchor'],
          filter(searchItem) {
            return !searchItem.route.includes('404');
          },
        }),
        RssPlugin(rssOptions),
      ],
      optimizeDeps: {
        include: ['clipboard', '@vue-office/pdf', 'vue-demi'],
        exclude: ['vitepress-plugin-awesome-musicplayer'],
      },
    },

    transformHead({ assets }) {
      const myFontFile = assets.find((file) => /font-name\.[\w-]+\.woff2/.test(file));
      if (myFontFile) {
        return [
          [
            'link',
            {
              rel: 'preload',
              href: myFontFile,
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
            },
          ],
        ];
      }
    },
  })
);
