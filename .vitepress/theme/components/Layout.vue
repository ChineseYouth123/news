<script setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import BackToList from './BackToList.vue';
import NotFound from './NotFound.vue';
import FloatingPlayer from './FloatingPlayer.vue';
import FullscreenPlayer from './FullscreenPlayer.vue';
import BlogPostHeader from './BlogPostHeader.vue';
import BackToTop from './BackToTop.vue'; // 记得引入回到顶部
import TableViewToggle from './TableViewToggle.vue'; // 记得引入表格组件

import { initAudioEngine, disposeAudioEngine } from '../audio/engine';

onMounted(() => {
  initAudioEngine();

  // 当点击首页左上角的标题 返回首页链接
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === '/') {
      e.preventDefault();
      window.location.href = '/';
    }
  });
});

onUnmounted(() => {
  disposeAudioEngine();
});
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 文章页正文上方 -->
    <template #doc-before>
      <BackToList />
      <BlogPostHeader />
    </template>

    <!-- 自定义 404 -->
    <template #not-found>
      <NotFound />
    </template>

    <!-- 正文下方：挂载表格切换组件 -->
    <template #doc-after>
      <ClientOnly>
        <TableViewToggle />
      </ClientOnly>
    </template>

    <!-- 全局底部：播放器和回到顶部 -->
    <template #layout-bottom>
      <ClientOnly>
        <FloatingPlayer />
      </ClientOnly>
      <ClientOnly>
        <FullscreenPlayer />
      </ClientOnly>
      <ClientOnly>
        <BackToTop />
      </ClientOnly>
    </template>
  </DefaultTheme.Layout>
</template>
