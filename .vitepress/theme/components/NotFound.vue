<script setup>
import { withBase } from 'vitepress';
import { ref, onMounted } from 'vue';

const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = withBase('/');
  }
}
</script>

<template>
  <div class="not-found" :class="{ 'is-mounted': mounted }">
    <div class="not-found__inner">
      <!-- 大号 404 -->
      <div class="code-wrap">
        <span class="code" data-text="404">404</span>
      </div>

      <h1 class="title">页面走丢了</h1>
      <p class="desc">
        你访问的页面可能已被移动、删除，或者从未存在过。<br />
        检查一下地址，或者回到首页看看。
      </p>

      <!-- 操作按钮 -->
      <div class="actions">
        <a class="btn btn--primary" :href="withBase('/')">返回首页</a>
        <button class="btn btn--ghost" type="button" @click="goBack">返回上一页</button>
      </div>

      <p class="footnote">错误代码：<code>404 Not Found</code></p>
    </div>
  </div>
</template>

<style scoped>
/* =========================================================
   404 页面
   ========================================================= */

.not-found {
  min-height: calc(100vh - var(--vp-nav-height, 64px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 80px;
}

.not-found__inner {
  width: 100%;
  max-width: 560px;
  text-align: center;

  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.not-found.is-mounted .not-found__inner {
  opacity: 1;
  transform: translateY(0);
}

/* ---------- 大号 404 ---------- */
.code-wrap {
  display: inline-block;
  margin-bottom: 16px;
  line-height: 1;
}
.code {
  display: inline-block;
  font-size: clamp(88px, 18vw, 160px);
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--news-brand, #c8102e);
  line-height: 1;
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes pop {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ---------- 标题与描述 ---------- */
.title {
  font-size: var(--news-fs-heading, 20px);
  font-weight: 600;
  margin: 0 0 10px;
  color: var(--news-text, #0f172a);
  line-height: 1.3;
}
.desc {
  font-size: var(--news-fs-body, 14px);
  line-height: 1.7;
  color: var(--news-muted, #64748b);
  margin: 0 0 32px;
}

/* ---------- 按钮 ---------- */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  border-radius: var(--news-radius, 8px);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none !important;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  font-family: inherit;
}
.btn--primary {
  background: var(--news-brand, #c8102e);
  color: #fff !important;
}
.btn--primary:hover {
  background: var(--news-brand, #c8102e);
  filter: brightness(1.08);
  box-shadow: 0 6px 16px -8px rgba(200, 16, 46, 0.5);
}
.btn--ghost {
  background: transparent;
  color: var(--news-text, #0f172a);
  border-color: var(--news-divider, #e2e8f0);
}
.btn--ghost:hover {
  border-color: var(--news-brand, #c8102e);
  color: var(--news-brand, #c8102e);
  background: var(--news-bg-soft, #f8fafc);
}

/* ---------- 脚注 ---------- */
.footnote {
  font-size: 12px;
  color: var(--news-muted, #94a3b8);
  margin: 0;
}
.footnote code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--news-bg-soft, #f1f5f9);
  font-size: 11.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* =========================================================
   响应式
   ========================================================= */
@media (max-width: 480px) {
  .not-found {
    padding: 40px 16px 60px;
  }
  .actions {
    gap: 10px;
  }
  .btn {
    padding: 9px 18px;
    font-size: 13px;
  }
}

/* =========================================================
   暗色模式
   ========================================================= */
.dark .btn--ghost {
  color: var(--vp-c-text-1, #f1f5f9);
  border-color: var(--vp-c-divider, #2e2e32);
}
.dark .btn--ghost:hover {
  background: var(--vp-c-bg-soft, #1e1e20);
}
.dark .footnote code {
  background: var(--vp-c-bg-soft, #1e1e20);
}

/* ---------- 减少动画偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .code {
    animation: none !important;
  }
  .not-found__inner {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
