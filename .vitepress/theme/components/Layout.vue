<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { onUnmounted } from 'vue';
import FloatingPlayer from '../components/FloatingPlayer.vue';
import FullscreenPlayer from '../components/FullscreenPlayer.vue';
import { disposeAudioEngine } from '../audio/engine';

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
