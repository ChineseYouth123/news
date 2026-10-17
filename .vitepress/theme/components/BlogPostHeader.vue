<script setup>
import { useData } from 'vitepress';
import { computed } from 'vue';

const { page, frontmatter } = useData();

const isBlogPost = computed(() => {
  return (
    page.value.relativePath.startsWith('blog/') && !page.value.relativePath.endsWith('index.md')
  );
});

// 格式化日期：2026-10-23
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString().split('T')[0];
};

const displayDate = computed(() => formatDate(frontmatter.value.date));
</script>

<template>
  <div v-if="isBlogPost" class="blog-post-header">
    <h1 class="blog-title">{{ frontmatter.title || page.title }}</h1>

    <div class="blog-meta">
      <time v-if="displayDate" class="meta-item">
        <Icon name="date" size="1rem" class="vp-fs__icon-sm" />
        {{ displayDate }}
      </time>

      <span v-if="frontmatter.tags" class="meta-item">
        <Icon name="tag" size="1rem" class="vp-fs__icon-sm" />
        {{ Array.isArray(frontmatter.tags) ? frontmatter.tags.join(' · ') : frontmatter.tags }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.blog-post-header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 1.5rem;
}

/* 调整标题字号和字重 */
.blog-title {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

/* 元数据横向排列 */
.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px; /* 上下间距 12px，左右间距 24px */
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px; /* 图标和文字间距 */
}

.meta-icon {
  opacity: 0.8;
}
</style>
