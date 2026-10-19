import { defineConfig } from 'vitepress';
import path from 'path';
import fs from 'fs';
import { withPwa } from '@vite-pwa/vitepress';
import { RssPlugin } from 'vitepress-plugin-rss';
import { siteMeta, rssOptions } from '../siteConfig.js';
import { chineseSearchOptimize, pagefindPlugin } from 'vitepress-plugin-pagefind';

export default withPwa(
  defineConfig({
    // 从基础配置引用
    base: siteMeta.base,
    lang: siteMeta.lang,
    title: siteMeta.title,
    description: siteMeta.description,
    logo: siteMeta.logo,
    cleanUrls: true, // 开启干净 URL（去掉 .html 后缀）
    head: [
      [
        'link',
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          href: `${siteMeta.base}feed.rss`,
          title: 'RSS Feed',
        },
        'meta',
        {
          name: 'viewport',
          // 解决pdfjs 在 Safari 可能会用页面级缩放覆盖掉 Viewer 内部的双指缩放，导致体验变差。
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
    markdown: {
      toc: { level: [1, 2, 3, 4, 5, 6] }, // 必须包含 2 和 3
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
    ignoreDeadLinks: [
      // 忽略以 /blog/资料/ 开头的链接
      /^\/blog\/资料\//,
      // 如果你有外部链接或者动态 HTML 链接，也可以放正则
      /\.html$/,
    ],
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
        // 复制资料文件夹的数据到dist
        copyMaterialsPlugin(),
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
    transformPageData(pageData) {
      // 判断如果是首页
      if (pageData.relativePath === 'index.md') {
        // 把 siteMeta 的数据强行注入到 frontmatter 的 hero 里
        pageData.frontmatter.hero = {
          name: siteMeta.title,
          text: siteMeta.description,
          tagline: siteMeta.tagline,
          image: {
            src: siteMeta.logo,
            alt: 'Logo',
          },
          actions: [
            { theme: 'brand', text: '开始阅读', link: '/pages/blog/' },
            { theme: 'alt', text: '资料库', link: '/pages/materials/' },
            { theme: 'alt', text: 'GitHub', link: 'https://github.com/vuejs/vitepress' },
          ],
        };
      }
    },
  })
);

// 复制资料文件夹的数据到dist
// 自定义复制插件：在构建结束后，把 src/blog/资料 复制到 dist/blog/资料，跳过 .md
function copyMaterialsPlugin() {
  // 获取项目根目录的绝对路径
  // 项目根目录 = .vitepress 的上一级
  const projectRoot = path.resolve(__dirname, '..');
  const sourceDir = path.resolve(projectRoot, 'src/blog/资料').replace(/\\/g, '/');
  return {
    name: 'copy-materials',
    apply: 'build', // 只在 build 时启用，dev 下完全跳过
    buildEnd() {
      const src = sourceDir;
      const dest = path.resolve(projectRoot, '.vitepress/dist/blog/资料');

      if (!fs.existsSync(src)) {
        console.warn('[copy-materials] 源目录不存在:', src);
        return;
      }

      // 递归复制，跳过 .md 文件
      function copyRecursive(srcDir, destDir) {
        fs.mkdirSync(destDir, { recursive: true });
        for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
          const srcPath = path.join(srcDir, entry.name);
          const destPath = path.join(destDir, entry.name);

          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else if (!entry.name.endsWith('.md')) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      copyRecursive(src, dest);
      console.log('[copy-materials] 资料复制完成，已跳过 .md');
    },
  };
}
