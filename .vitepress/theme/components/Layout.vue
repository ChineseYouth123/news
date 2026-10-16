<script setup>
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import FloatingPlayer from './FloatingPlayer.vue';
import FullscreenPlayer from './FullscreenPlayer.vue';
import { initAudioEngine, disposeAudioEngine } from '../audio/engine';

onMounted(() => {
  initAudioEngine();
});

onUnmounted(() => {
  disposeAudioEngine();
});
</script>

<template>
  <DefaultTheme.Layout>
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
