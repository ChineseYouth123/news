// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { createPinia } from 'pinia';
import { initComponent } from 'vitepress-plugin-legend/component';
import 'vitepress-plugin-legend/dist/index.css';
import '../theme/styles/custom.css';

import NewsList from './components/NewsList.vue';
import ThankList from './components/ThankList.vue';
import MaterialList from './components/MaterialList.vue';
import MyLayout from './components/Layout.vue';
import Icon from './components/Icon.vue';

import './styles/vars.css';
import './styles/base.css';

export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  async enhanceApp({ app }) {
    // 1. 正常注册 Pinia 和全局组件
    app.use(createPinia());
    app.component('NewsList', NewsList);
    app.component('MaterialList', MaterialList);
    app.component('ThankList', ThankList);
    app.component('Icon', Icon);

    // 2. 初始化 legend 插件（Markmap/Mermaid 等）
    initComponent(app);

    // 3. 只在浏览器端动态加载并注册 v-viewer
    if (!import.meta.env.SSR) {
      const VueViewer = (await import('v-viewer')).default;
      app.use(VueViewer);
    }
  },
};
