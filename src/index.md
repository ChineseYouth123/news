---
# https://vitepress.dev/reference/default-theme-home-page
# 网站首页配置
layout: home

# Hero 部分位于主页顶部。
hero:
  name: '笔记'
  text: '敢于创新和发扬传承的网站。'
  tagline: My great project tagline
  # 首页图片
  image:
    src: images/logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: 访问博客
      link: /pages/blog/
    - theme: brand
      text: 查看播放列表
      link: /pages/playlist
    - theme: github
      text: View on GitHub
      link: https://github.com/vuejs/vitepress
#
features:
  - icon: 📅
    title: 每日自动排序
    details: 最新发布的博客文档自动排在页面最顶部，无需手动调整顺序
  - icon: ⚡
    title: 极速加载体验
    details: 依托Vite能力，站点构建时完成全量文件扫描排序，打开页面即显示排序后的完整列表
  - icon: 📝
    title: 极简创作模式
    details: 仅需编写带date字段的Markdown文档，新增内容自动加入列表
---
