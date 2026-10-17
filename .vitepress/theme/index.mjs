// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { createPinia } from 'pinia';
import VueViewer from 'v-viewer'; // 引入 v-viewer
import 'viewerjs/dist/viewer.css'; // 必须引入样式
import '../theme/styles/custom.css';

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
  Layout: MyLayout,
  enhanceApp({ app }) {
    app.use(createPinia());
    app.component('NewsList', NewsList);
    app.component('MaterialList', MaterialList);
    app.component('ThankList', ThankList);
    app.component('Icon', Icon);
    app.use(VueViewer); // 注册 v-viewer（全局指令、组件、API 都可用）
    app.component('NewsList', NewsList);
  },
};
