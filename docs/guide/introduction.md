# 介绍

@ldesign/formatter 是一个统一的代码格式化工具，集成了 Prettier、ESLint 和 Stylelint，为你的项目提供一站式的代码格式化解决方案。

## 什么是 @ldesign/formatter？

@ldesign/formatter 不是另一个代码格式化工具，而是一个**格式化工具的协调器**。它：

- 🎯 **统一管理** Prettier、ESLint、Stylelint 的配置
- 📦 **提供预设** 适用于各种主流框架的开箱即用配置
- ⚡ **优化性能** 通过智能缓存和增量格式化提升效率
- 🛠️ **智能检测** 自动识别项目类型和规则冲突
- 👁️ **实时监听** Watch 模式让开发更流畅

## 核心功能

### 统一配置管理

传统方式需要分别配置：
- `.prettierrc` - Prettier 配置
- `.eslintrc.js` - ESLint 配置
- `.stylelintrc.json` - Stylelint 配置
- `package.json` - lint-staged 配置
- `.husky/` - Git hooks 配置

使用 @ldesign/formatter，只需要一个配置文件：

```javascript
// formatter.config.js
module.exports = {
  preset: 'vue-typescript',
  // 所有配置集中管理
}
```

### 丰富的预设配置

支持多种主流框架：

| 预设 | 适用场景 |
|------|----------|
| `base` | 纯 JavaScript/TypeScript 项目 |
| `vue` / `vue-typescript` | Vue.js 项目 |
| `react` / `react-typescript` | React 项目 |
| `angular` / `angular-typescript` | Angular 项目 |
| `svelte` / `svelte-typescript` | Svelte 项目 |
| `next` | Next.js 项目 |
| `nuxt` | Nuxt 项目 |
| `node` | Node.js 后端项目 |

### 智能缓存

基于文件内容哈希的智能缓存系统：

```
第一次格式化: 处理 1000 个文件，耗时 30 秒
第二次格式化: 只处理 2 个修改的文件，耗时 0.5 秒
```

### 规则冲突检测

自动检测并提示 Prettier、ESLint、Stylelint 之间的规则冲突：

```bash
⚠️ 发现规则冲突:
  - semi: Prettier 和 ESLint 的分号配置不一致
    建议: 使用 eslint-config-prettier 禁用冲突规则
```

### Watch 模式

开发时实时监听文件变化：

```bash
ldesign-formatter watch src/

✓ Watcher is ready
  Watching for file changes...
  
  [15:30:45] Button.vue changed
  ✓ Formatted 1 file
```

### 项目自动检测

智能识别项目类型：

```bash
ldesign-formatter init

🔍 检测项目类型...
✓ 检测到 Vue + TypeScript 项目 (置信度: 95%)
  特征: vue dependency, TypeScript, @vue/cli-service
  
推荐使用预设: vue-typescript
```

## 与其他工具的对比

### vs 直接使用 Prettier

| 特性 | Prettier | @ldesign/formatter |
|------|----------|---------------------|
| 代码格式化 | ✅ | ✅ |
| 代码质量检查 | ❌ | ✅ (ESLint) |
| 样式检查 | ❌ | ✅ (Stylelint) |
| 预设配置 | ❌ | ✅ |
| 冲突检测 | ❌ | ✅ |
| 智能缓存 | ❌ | ✅ |
| Watch 模式 | ❌ | ✅ |

### vs 分别配置 Prettier + ESLint + Stylelint

| 特性 | 分别配置 | @ldesign/formatter |
|------|----------|---------------------|
| 配置复杂度 | 高（3+ 个配置文件） | 低（1 个配置文件） |
| 规则冲突 | 需要手动处理 | 自动检测 |
| 维护成本 | 高 | 低 |
| 学习曲线 | 陡峭 | 平缓 |
| 性能 | 一般 | 优化 |

## 工作原理

```
┌─────────────────┐
│  用户代码文件    │
└────────┬────────┘
         │
         v
┌─────────────────────────────┐
│  @ldesign/formatter         │
│  ┌──────────────────────┐   │
│  │  配置加载器           │   │
│  │  - 读取配置           │   │
│  │  - 应用预设           │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  冲突检测器           │   │
│  │  - 检测规则冲突       │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  缓存管理器           │   │
│  │  - 检查文件哈希       │   │
│  │  - 跳过未修改文件     │   │
│  └──────────────────────┘   │
└─────────┬───────────────────┘
          │
          v
┌─────────────────────────────┐
│  格式化工具集成              │
│  ┌───────┐ ┌───────┐ ┌─────┐│
│  │Prettier│ │ESLint│ │Style││
│  │       │ │      │ │lint ││
│  └───────┘ └───────┘ └─────┘│
└─────────┬───────────────────┘
          │
          v
┌─────────────────┐
│  格式化后的代码  │
└─────────────────┘
```

## 设计理念

### 1. 约定优于配置

提供合理的默认值和预设配置，减少配置工作。

### 2. 渐进式增强

从简单的格式化开始，逐步启用高级功能。

### 3. 性能优先

智能缓存、增量处理，确保大型项目也能快速完成。

### 4. 开发体验

Watch 模式、详细日志、友好的错误提示。

### 5. 可扩展性

支持自定义预设、灵活的配置覆盖。

## 下一步

- [快速开始](/guide/getting-started) - 5 分钟上手
- [配置文件](/guide/configuration) - 了解配置选项
- [预设配置](/guide/presets) - 选择适合你的预设
- [CLI 命令](/guide/cli-format) - 掌握命令行工具
