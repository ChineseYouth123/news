---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: '笔记'
  text: '探索、创造与沉淀'
  tagline: 发现 Vue 生态中最棒的工具，记录每一行思考。
  image:
    src: images/huanqigongnong.jpg
    alt: Logo
  actions:
    - theme: brand
      text: 开始阅读
      link: /pages/blog/
      # 可以加个图标
    - theme: alt
      text: 资料库
      link: /pages/materials/
    - theme: alt
      text: GitHub
      link: https://github.com/vuejs/vitepress
---

<script setup>
  import HomeExtension from '@theme/components/HomeExtension.vue';
</script>
<!-- 引入自定义的首页扩展组件 -->
<HomeExtension />
