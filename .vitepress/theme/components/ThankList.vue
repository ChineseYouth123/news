<script setup>
import { withBase } from 'vitepress';
import { ref } from 'vue';

const failed = ref({}); // 用 name 或 index 标记加载失败

const groups = [
  {
    group: '网站建设',
    desc: '参与项目开发与维护~',
    members: [
      // {
      //   name: '匿名',
      //   desc: '协调设计',
      //   avatar: '/thanks/user.png',
      //   link: 'https://github.com/',
      // },
      {
        name: 'deepseek',
        desc: '功能页与疑难项',
        avatar: '/thanks/deepseek.png',
        link: 'https://github.com/deepseek-ai',
      },
      {
        name: 'QWen',
        desc: '底座搭建',
        avatar: '/thanks/QWen.png',
        link: 'https://github.com/QwenLM/Qwen',
      },
    ],
  },
  // {
  //   group: '赞助者',
  //   desc: '感谢你们的慷慨支持',
  //   members: [
  //     { name: '某公司', desc: '年度金牌赞助', avatar: '/thanks/company.png' },
  //     { name: '某某', desc: '月度赞助', avatar: '/thanks/user1.png' },
  //     { name: '某某某', desc: '一次性赞助', avatar: '/thanks/user2.png' },
  //   ],
  // },
  {
    group: '特别感谢',
    desc: '感谢给予帮助的朋友们~',
    members: [
      {
        name: '开源主题',
        desc: '网站v1.0版本使用过开源库',
        avatar: '/thanks/42232682.jpeg',
        link: 'https://github.com/imsyy/vitepress-theme-curve/',
      },
    ],
  },
];

/** 无头像时生成首字母 */
function initial(name) {
  return name ? name.trim().charAt(0).toUpperCase() : '?';
}
</script>

<template>
  <div class="thanks-page">
    <header class="thanks-header">
      <h1>致谢</h1>
      <p class="subtitle">感谢每位让这个项目变得更好的人</p>
    </header>

    <section v-for="g in groups" :key="g.group" class="thanks-group">
      <div class="thanks-group__head">
        <h2 class="thanks-group__title">{{ g.group }}</h2>
        <p v-if="g.desc" class="thanks-group__desc">{{ g.desc }}</p>
      </div>

      <ul class="thanks-grid">
        <li v-for="m in g.members" :key="m.name" class="thanks-card">
          <component
            :is="m.link ? 'a' : 'div'"
            :href="m.link ? withBase(m.link) : undefined"
            :target="m.link ? '_blank' : undefined"
            :rel="m.link ? 'noopener' : undefined"
            class="thanks-card__inner"
          >
            <!-- 圆形头像 -->
            <div class="thanks-avatar">
              <img
                v-if="m.avatar && !failed[m.name]"
                :src="withBase(m.avatar)"
                :alt="m.name"
                loading="lazy"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <span class="thanks-avatar__initial" v-else>{{ initial(m.name) }}</span>
            </div>

            <!-- 文字 -->
            <h3 class="thanks-name">{{ m.name }}</h3>
            <p v-if="m.desc" class="thanks-desc">{{ m.desc }}</p>
          </component>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
@import '../styles/thanks.css';
</style>
