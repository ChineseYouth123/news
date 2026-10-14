<script setup>
import { useRouter } from 'vitepress';
const router=useRouter()

// 返回上一页
const callBackFn=()=>{
 if (window.history.length > 1) {
    window.history.back()
  } else {
    router.go('/')
  }
}
</script>

<template>
  <div @click="callBackFn" class="back-to-list">
    <span>返回</span>
  </div>
</template>

<style scoped>
.back-to-list {
  width: 60px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-border);
  margin-bottom: 20px;
  cursor: pointer;
}
.back-to-list:hover {
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.back-to-list a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 14px;
}
.back-to-list a:hover {
  text-decoration: underline;
}
</style>
