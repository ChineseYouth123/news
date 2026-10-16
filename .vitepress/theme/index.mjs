// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import { createPinia } from 'pinia';

import NewsList from './components/NewsList.vue';
import ThankList from './components/ThankList.vue';
import MaterialList from './components/MaterialList.vue';
import MyLayout from './components/Layout.vue';
import Icon from './components/Icon.vue';

import './styles/vars.css';
import './styles/base.css';
import './styles/news.css';
import './styles/material.css';
import './styles/thanks.css';

export default {
  extends: DefaultTheme,
  Layout: MyLayout, // ← 用你的自定义 Layout
  enhanceApp({ app }) {
    app.use(createPinia());
    app.component('NewsList', NewsList);
    app.component('MaterialList', MaterialList);
    app.component('ThankList', ThankList);
    app.component('Icon', Icon);
  },
};
