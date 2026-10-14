// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import NewsList from './components/NewsList.vue';
import BackToList from './components/BackToList.vue';

// 顺序很重要：变量 → 基础 → 业务
import './styles/vars.css';
import './styles/base.css';
import './styles/news.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NewsList', NewsList);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 文章页正文上方
      'doc-before': () => h(BackToList),
    });
  },
};
