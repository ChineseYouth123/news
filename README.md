# 📝 Notes - 红色博客

这是一个基于 **VitePress** 构建的现代化、全栈式个人数字花园。它不仅支持标准的 Markdown 文档写作，还内置了丰富的富文本预览、沉浸式音乐播放、PWA 离线缓存等高级特性。

## 导航

- **网站预览地址**：[https://chineseyouth123.github.io/news/](https://chineseyouth123.github.io/news/)

- **文档资料仓库**：[https://github.com/ChineseYouth123/blog/](https://github.com/ChineseYouth123/blog/)

## ✨ 核心特性

- **🎵 沉浸式音乐播放**：
  - 左下角悬浮转盘播放器，支持歌单切换、进度控制。
  - 点击转盘展开全屏沉浸式播放页，自带毛玻璃特效与动态歌词（支持 LRC 解析）。
  - 基于主色调（ColorThief）自动提取封面氛围色。
- **📰 博客与动态列表**：
  - 集成自动按日期/标签排序的文章列表系统。
  - 支持自定义首页布局（Hero、数据面板、响应式卡片导航）。
  - 字号“小/中/大”一键调节，记忆用户阅读偏好。
- **📚 多格式资料库**：
  - 基于 PDF.js 自研的 PDF 阅读器（支持大纲、缩放、下载）。
  - 基于 `vue-office` 在线预览 Word、Excel、PPT。
  - 图片画廊支持多图切换、缩放、旋转。
- **📱 PWA 与离线支持**：
  - 配置了 `@vite-pwa/vitepress`，可安装到桌面，支持离线访问静态内容。
- **🔍 全文搜索**：
  - 集成 `vitepress-plugin-pagefind`，支持中文分词优化与高亮。

## 📂 目录结构

```text
notes/
├─ .vitepress/
│  ├─ config.mts          # VitePress 核心配置
│  └─ theme/              # 自定义主题
│     ├─ index.mts        # 主题入口
│     ├─ components/      # 自定义 Vue 组件
│     ├─ stores/          # Pinia 状态
│     ├─ styles/          # 局部样式
│     └─ utils/           # 工具函数 (Data Loader)
├─ src/
│  ├─ blog/               # 博客文章与资料库
│  ├─ pages/              # 独立页面 (首页、关于、资料列表)
│  └─ public/             # 静态资源 (图片、音乐、PDF.js 等)
├─ siteConfig.js          # 🌟 全局站点配置文件
├─ package.json
└─ README.md
```

## 🚀 本地开发

**环境要求**: Node.js 18+ (推荐 Node 20+)

1. **安装依赖**：

   ```bash
   npm install
   # 如果遇到 peer dependency 冲突，使用：
   # npm install --legacy-peer-deps
   ```

2. **启动开发服务器**：

   ```bash
   npm run dev
   ```

   访问 `http://localhost:5173` 查看效果。注意：PWA 与部分搜索索引功能仅在构建后生效。

3. **构建与预览**：

   ```bash
   npm run build
   npm run preview
   ```

   构建产物将输出到 `.vitepress/dist`。

---

## 📄 站点配置与内容编写指南

### 1. 修改全局信息 (`siteConfig.js`)

站点的标题、描述、Logo、作者信息、GitHub 链接等，**统一在根目录的 `siteConfig.js` 中维护**。修改后，首页 Hero、SEO 信息、页脚等会自动同步。

```javascript
// siteConfig.js 示例
export const siteMeta = {
  title: '笔记',
  description: '探索、创造与沉淀',
  logo: '/images/logo.png',
  github: 'https://github.com/aaa/doc', // 你的仓库地址
  // ...
};
```

### 2. 博客文章

- **存放路径**：`src/blog/博客/`。
- **文件命名**：建议使用 `YYYY-MM-DD.md`（如 `2026-10-18.md`）。
- **Frontmatter 规范**：
  ```yaml
  ---
  title: 文章标题
  date: 2026-10-18
  tags: [Vue, 前端]
  description: 这是文章的简介。
  ---
  ```

### 3. 资料文件与预览

- **存放路径**：`src/blog/资料/` 目录下的分类文件夹中。
- **自动扫描**：系统配置了 `materials.data.js` Data Loader，会在构建时自动扫描该目录下的 PDF、Word、Excel、图片等文件，并生成文件树列表。
- **HTML/MD 文件**：建议存放在 `src/public/` 下（避免被 VitePress 当作页面编译），在资料列表中点击时会通过新标签页打开。

### 4. 音乐歌单

- **存放路径**：`src/public/music/`。
- 在 `playlist-1.json` 中配置歌曲信息、封面和 `.mp3` 路径。
- 歌词文件（`.lrc`）放置在对应歌曲同级目录即可自动解析。

### 5. 独立页面

- **存放路径**：`src/pages/`。
- 比如资料列表页 `src/pages/materials/index.md`，首页 `src/pages/index.md`，在 `.vitepress/config.mts` 的 `nav` 中配置路由即可。

---

## 📝 许可协议

- **代码**：本仓库中的代码采用 [MIT License](LICENSE) 许可。
- **文章内容**：采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 国际许可协议进行许可。

---
