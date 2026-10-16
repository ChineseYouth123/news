<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** 图标名，对应 assets/icons 下的文件名（不带 .svg） */
  name: { type: String, required: true },
  /** 尺寸，数字走 px，字符串走原样 */
  size: { type: [Number, String], default: 16 },
  /** 颜色，跟随文字色用 currentColor */
  color: { type: String, default: 'currentColor' },
});

/* ------------------------------------------------------------
 * 1. Vite 的 ?raw 导入
 *    把所有 svg 读成字符串，eager 让它同步可用
 * ------------------------------------------------------------ */
const svgs = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/* ------------------------------------------------------------
 * 2. 清洗 SVG：
 *    - 去掉硬编码的 fill / stroke 颜色，改为 currentColor
 *    - 保留 fill="none"
 * ------------------------------------------------------------ */
function cleanSvg(raw) {
  if (!raw) return '';
  return raw
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
}

/* ------------------------------------------------------------
 * 3. 根据 name 找对应的 svg
 * ------------------------------------------------------------ */
const svgContent = computed(() => {
  const key = `../assets/icons/${props.name}.svg`;
  const raw = svgs[key];
  if (!raw) {
    console.warn(`[Icon] 找不到图标: ${props.name}，可用图标:`, Object.keys(svgs));
    return '';
  }
  return cleanSvg(raw);
});

/* ------------------------------------------------------------
 * 4. 样式
 * ------------------------------------------------------------ */
const style = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
  flexShrink: 0,
  verticalAlign: 'middle',
  lineHeight: 1,
}));
</script>

<template>
  <span class="app-icon" :style="style" v-html="svgContent" />
</template>

<style scoped>
.app-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
  /* 有些 svg 用 stroke 描边，这里统一让 stroke 也跟随颜色 */
  stroke: currentColor;
}
</style>
