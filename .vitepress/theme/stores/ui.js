import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const fullscreen = ref(false);
  const openFullscreen = () => (fullscreen.value = true);
  const closeFullscreen = () => (fullscreen.value = false);
  const toggleFullscreen = () => (fullscreen.value = !fullscreen.value);
  return { fullscreen, openFullscreen, closeFullscreen, toggleFullscreen };
});
