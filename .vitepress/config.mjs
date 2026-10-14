import { defineConfig } from 'vitepress'
import path from 'path'

// -------------------------------------- VitePress 配置 ----------------------------
// https://vitepress.dev/reference/site-config
export default defineConfig({
   // 站点级选项
  // 链接
  base:"/aaa/",
  // 站点标题
  title: "笔记",
  // 标题的后缀。
  titleTemplate: "Vite & Vue powered static site generator",
  // 站点描述
  description: "发现和创造的文档。",
  // 站点根目录其实文件夹位置
  srcDir: 'src/',

  // 以下 layout 仅在 frontmatter 选项仅在使用默认主题时适用。
  // 指定页面的布局。
  layout: "page",
  // 是否显示导航栏。
  navbar: false,
  // 是否显示 侧边栏。
  sidebar:true,
  // 定义侧边栏组件在 doc 布局中的位置。
  aside:false,
  // 监控
  watch: ['path/to/files/**/*'],
  // 主题相关配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 侧边栏-菜单设置
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' }, 
      { text: '例子', link: '/markdown-examples' },
      { text: '文档', link: '/docs' },
      {
    text: 'About',
    activeMatch: `^/about/`,
    items: [
      { text: 'FAQ', link: '/about/faq' },
      { text: 'Team', link: '/about/team' },
      { text: 'Releases', link: '/about/releases' },
    ]
  },
    ],
    // 侧边栏-菜单-子页面
    sidebar: [
      {
        text: '例子', // 例子页面
        // 子页面
        items: [
          { text: 'Markdown 例子', link: '/markdown-examples' },
          { text: '测试 API 例子', link: '/api-examples' }
        ]
      },
      // {
      //   text: '文档', // 例子页面
      //   // 子页面
      //   items: [
      //     { text: '文档1', link: '/docs' },
      //   ]
      // }
    ],
    // 搜索
    search: {
      provider: 'local'  // 本地搜索 
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '/src'), // 指向你的源目录
        // 或者其他你需要的别名
      }
    }
  },
  transformHead({ assets }) {
    // 相应地调整正则表达式以匹配字体
    const myFontFile = assets.find(file => /font-name\.[\w-]+\.woff2/.test(file))
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/woff2',
            crossorigin: ''
          }
        ]
      ]
    }
  }

})


