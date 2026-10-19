<template>
  <div class="pdf-iframe-wrapper" style="width: 100%; height: 100%">
    <iframe :src="viewerUrl" style="width: 100%; height: 100%; border: 0" title="PDF 预览" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { withBase } from 'vitepress';

const props = defineProps({
  src: { type: String, required: true },
});

const viewerUrl = computed(() => {
  // 指向你 public 下的 viewer.html
  const base = withBase('/pdfjs/web/viewer.html');

  // file 参数必须用 encodeURIComponent 编码
  const file = encodeURIComponent(props.src);

  // 可选：直接定位到目录侧边栏（pagemode=bookmarks）
  const path = `${base}?file=${file}#pagemode=bookmarks`;
  return path;
});
</script>
