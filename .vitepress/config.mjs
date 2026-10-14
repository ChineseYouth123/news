import { defineConfig } from 'vitepress';
import path from 'path';

// -------------------------------------- VitePress 配置 ----------------------------
// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点级选项
  // 链接
  base: '/',
  lang: 'zh-CN', //语言，可选 en-US
  // 站点标题
  title: '笔记',
  logo: '/logo.png',
  // 标题的后缀。
  titleTemplate: 'Vite & Vue powered static site generator',
  // 站点描述
  description: '发现和创造的文档。',
  // 站点根目录其实文件夹位置
  srcDir: 'src/',
  //开启纯净链接
  cleanUrls: true,

  // 以下 layout 仅在 frontmatter 选项仅在使用默认主题时适用。
  // 指定页面的布局。
  layout: 'page',
  // 是否显示导航栏。
  navbar: false,
  // 是否显示 侧边栏。
  sidebar: true,
  // 定义侧边栏组件在 doc 布局中的位置。
  aside: false,
  // 监控
  watch: ['path/to/files/**/*'],
  // 主题相关配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 侧边栏-菜单设置
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      {
        text: 'About',
        activeMatch: `^/about/`,
        items: [
          { text: 'FAQ', link: '/about/faq' },
          { text: 'Team', link: '/about/team' },
          { text: 'Releases', link: '/about/releases' },
        ],
      },
    ],
    outline: {
      // 显示层级：数字(如 2 只显示 h2)、数组(如 [2, 4] 显示 h2 到 h4)、'deep'(等于 [2, 6])
      level: 'deep', // 推荐 'deep'，显示所有 h2 到 h6 标题

      // 自定义目录标题（默认是英文的 "On this page"）
      label: '页面导航', // 设置为中文标题
    },
    // 侧边栏-菜单-子页面
    sidebar: [],
    // 搜索
    search: {
      provider: 'local', // 本地搜索
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
    footer: {
      copyright: `本中文文档采用 知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议 (CC BY-NC-SA 4.0) 进行许可。`,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '/src'), // 指向你的源目录
        // 或者其他你需要的别名
      },
    },
  },
  transformHead({ assets }) {
    // 相应地调整正则表达式以匹配字体
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
});
