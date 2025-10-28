---
layout: home

hero:
  name: "@ldesign/formatter"
  text: "统一的代码格式化工具"
  tagline: 集成 Prettier、ESLint、Stylelint，让你的代码始终保持优雅
  image:
    src: /logo.svg
    alt: LDesign Formatter
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/ldesign/formatter

features:
  - icon: 🎨
    title: 统一配置管理
    details: 集中管理 Prettier、ESLint、Stylelint 配置，一键应用团队代码规范

  - icon: 📦
    title: 丰富的预设配置
    details: 内置 Vue、React、Angular、Svelte、Next.js、Nuxt 等多种框架预设

  - icon: 👁️
    title: Watch 模式
    details: 实时监听文件变化，自动格式化，提升开发体验

  - icon: ⚡
    title: 智能缓存
    details: 基于文件哈希的智能缓存，避免重复格式化，大幅提升性能

  - icon: ⚠️
    title: 冲突检测
    details: 自动检测工具间规则冲突，提供修复建议，避免配置问题

  - icon: 🛠️
    title: 项目自动检测
    details: 智能识别项目类型，自动推荐最合适的配置

  - icon: 📊
    title: 统计分析
    details: 显示文件类型分布、格式化历史，深入了解项目状态

  - icon: 🪝
    title: Git Hooks 集成
    details: 自动配置 pre-commit/pre-push hooks，保证代码质量

  - icon: 🔄
    title: 增量格式化
    details: 只格式化变更的文件，大幅提升大型项目格式化效率
---

## 快速安装

::: code-group

```bash [npm]
npm install @ldesign/formatter --save-dev
```

```bash [yarn]
yarn add @ldesign/formatter -D
```

```bash [pnpm]
pnpm add @ldesign/formatter -D
```

:::

## 立即体验

```bash
# 初始化配置（自动检测项目类型）
npx ldesign-formatter init

# 格式化所有文件
npx ldesign-formatter format

# 启动 Watch 模式
npx ldesign-formatter watch src/
```

## 为什么选择 @ldesign/formatter？

### 🎯 一站式解决方案

不再需要单独配置 Prettier、ESLint、Stylelint，一个工具搞定所有格式化需求。

### 🚀 开箱即用

内置多种主流框架预设，选择你的技术栈，立即开始使用。

### 💡 智能化

自动检测项目类型、冲突规则，提供最佳实践建议。

### ⚡ 高性能

智能缓存、增量格式化，即使在大型项目中也能快速完成。

## 支持的框架

<div class="framework-grid">
  <div class="framework-item">Vue.js</div>
  <div class="framework-item">React</div>
  <div class="framework-item">Angular</div>
  <div class="framework-item">Svelte</div>
  <div class="framework-item">Next.js</div>
  <div class="framework-item">Nuxt</div>
  <div class="framework-item">Node.js</div>
  <div class="framework-item">TypeScript</div>
</div>

<style>
.framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.framework-item {
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>
