<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { useRouter } from "vitepress"
import { data as postsData } from "../utils/posts.data.js";

const { total, groups, tags } = postsData;
const router = useRouter()
const PAGE_SIZE = 10;

const activeTag = ref(null);
const currentPage = ref(1);

/* ---------- 过滤 ---------- */
const filteredGroups = computed(() => {
  if (!activeTag.value) return groups;
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((p) => p.tags.includes(activeTag.value)),
    }))
    .filter((g) => g.items.length > 0);
});

const filteredTotal = computed(() =>
  filteredGroups.value.reduce((sum, g) => sum + g.items.length, 0)
);

/* ---------- 拍平（保留月份信息） ---------- */
const flatItems = computed(() =>
  filteredGroups.value.flatMap((g) =>
    g.items.map((item) => ({
      ...item,
      groupKey: g.key,
      groupLabel: g.label,
    }))
  )
);

/* ---------- 分页 ---------- */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(flatItems.value.length / PAGE_SIZE))
);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return flatItems.value.slice(start, start + PAGE_SIZE);
});

/* 当前页回填月份分组，保持原视觉 */
const pagedGroups = computed(() => {
  const map = new Map();
  for (const item of pagedItems.value) {
    if (!map.has(item.groupKey)) {
      map.set(item.groupKey, {
        key: item.groupKey,
        label: item.groupLabel,
        items: [],
      });
    }
    map.get(item.groupKey).items.push(item);
  }
  return [...map.values()];
});

/* ---------- 页码列表（带省略号） ---------- */
const pageNumbers = computed(() => {
  const tp = totalPages.value;
  const cp = currentPage.value;
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

  const out = [1];
  if (cp > 3) out.push("...");
  const start = Math.max(2, cp - 1);
  const end = Math.min(tp - 1, cp + 1);
  for (let i = start; i <= end; i++) out.push(i);
  if (cp < tp - 2) out.push("...");
  out.push(tp);
  return out;
});

/* ---------- 交互 ---------- */
function toggleTag(t) {
  activeTag.value = activeTag.value === t ? null : t;
}

function goToPage(p) {
  if (typeof p !== "number") return;
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
  nextTick(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function goHref(url) {
  console.log('url-------->', url);
  // :href="item.url"
  router.go(url)
}



// 切标签 → 回到第 1 页
watch(activeTag, () => {
  currentPage.value = 1;
});

// 过滤后页码越界，自动回到最后一页
watch(totalPages, (tp) => {
  if (currentPage.value > tp) currentPage.value = tp;
});
</script>

<template>
  <div class="news-page">
    <header class="news-header">
      <h1>新闻动态</h1>
      <!-- <p class="subtitle">追踪 Vue 生态与 Vite 的最新发布、更新和活动</p> -->
      <p class="count">
        全部文章（<span class="num">{{ activeTag ? filteredTotal : total }}</span> 篇）
      </p>
    </header>

    <div class="news-tag-filter">
      <button class="news-filter-btn" :class="{ active: activeTag === null }" @click="activeTag = null">全部</button>
      <button v-for="t in tags" :key="t" class="news-filter-btn" :class="{ active: activeTag === t }"
        @click="toggleTag(t)">{{ t }}</button>
    </div>

    <section v-for="group in pagedGroups" :key="group.key" class="news-month-group">
      <h3 class="news-month-label">{{ group.label }}</h3>
      <ul class="news-list">
        <li v-for="item in group.items" :key="item.url">
          <div @click="goHref(item.url)" class="news-link">
            <div class="news-title">
              <span>{{ item.title }}</span>
            </div>
            <div class="news-top-badge-div">
              <!-- 顶置 -->
              <div class="news-tags">
                <span v-if="item.top" class="news-top-badge">置顶</span>
              </div>
              <!-- 标签 -->
              <div class="news-tags">
                <span v-for="tag in item.tags" :key="tag" class="news-tag" :data-tag="tag">{{ tag }}</span>
              </div>
            </div>

          </div>
        </li>
      </ul>
    </section>

    <p v-if="filteredGroups.length === 0" class="news-empty">
      没有匹配「{{ activeTag }}」的文章
    </p>

    <footer v-if="totalPages > 1" class="news-pagination">
      <button class="news-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">上一页</button>

      <button v-for="(p, i) in pageNumbers" :key="i" class="news-page-btn"
        :class="{ active: p === currentPage, dots: p === '...' }" :disabled="p === '...'" @click="goToPage(p)">{{ p
        }}</button>

      <button class="news-page-btn" :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)">下一页</button>

      <span class="news-page-info">
        第 {{ currentPage }} / {{ totalPages }} 页
      </span>
    </footer>
  </div>
</template>
