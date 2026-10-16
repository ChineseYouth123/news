<script setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import BackToList from './BackToList.vue';
import NotFound from './NotFound.vue';
import FloatingPlayer from './FloatingPlayer.vue';
import FullscreenPlayer from './FullscreenPlayer.vue';
import { initAudioEngine, disposeAudioEngine } from '../audio/engine';

onMounted(() => {
  initAudioEngine();

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === '/') {
      e.preventDefault();
      window.location.href = '/pages/';
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
    </template>

    <!-- 自定义 404 -->
    <template #not-found>
      <NotFound />
    </template>

    <!-- 悬浮播放器 + 全屏播放器 -->
    <template #layout-bottom>
      <ClientOnly>
        <FloatingPlayer />
      </ClientOnly>
      <ClientOnly>
        <FullscreenPlayer />
      </ClientOnly>
    </template>
  </DefaultTheme.Layout>
</template>
