// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import NewsList from './components/NewsList.vue';
import BackToList from './components/BackToList.vue';
import ThankList from './components/ThankList.vue';
import MaterialList from './components/MaterialList.vue';
import NotFound from './components/NotFound.vue'; // 你自定义的 404 组件

// 顺序很重要：变量 → 基础 → 业务
import './styles/vars.css';
import './styles/base.css';
import './styles/news.css';
import './styles/material.css';
import './styles/thanks.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NewsList', NewsList);
    app.component('MaterialList', MaterialList);
    app.component('ThankList', ThankList);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 文章页正文上方
      'doc-before': () => h(BackToList),
      'not-found': () => h(NotFound),
    });
  },
};
