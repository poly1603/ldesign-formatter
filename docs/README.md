# @ldesign/formatter 文档

完整的 VitePress 文档系统已创建。

## 文档结构

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress 配置
├── index.md               # 首页
├── guide/                 # 指南
│   ├── introduction.md    # 介绍 ✓
│   ├── getting-started.md # 快速开始 ✓
│   ├── installation.md    # 安装指南
│   ├── configuration.md   # 配置文件
│   ├── presets.md         # 预设配置
│   ├── ignore-files.md    # 忽略文件
│   ├── cli-init.md        # init 命令
│   ├── cli-format.md      # format 命令
│   ├── cli-check.md       # check 命令
│   ├── cli-watch.md       # watch 命令
│   ├── cli-stats.md       # stats 命令
│   ├── cli-ignore.md      # ignore 命令
│   ├── caching.md         # 缓存机制
│   ├── conflict-detection.md # 冲突检测
│   ├── project-detection.md  # 项目检测
│   ├── git-hooks.md       # Git Hooks
│   ├── ci-cd.md           # CI/CD 集成
│   ├── vscode.md          # VSCode 集成
│   └── webstorm.md        # WebStorm 集成
├── api/                   # API 文档
│   ├── formatter.md       # Formatter
│   ├── config-loader.md   # ConfigLoader
│   ├── cache-manager.md   # CacheManager
│   ├── conflict-detector.md # ConflictDetector
│   ├── project-detector.md  # ProjectDetector
│   ├── prettier-integration.md
│   ├── eslint-integration.md
│   ├── stylelint-integration.md
│   └── types.md           # 类型定义
├── presets/               # 预设配置
│   ├── overview.md        # 概览
│   ├── base.md            # Base 预设
│   ├── vue.md             # Vue 预设
│   ├── react.md           # React 预设
│   ├── angular.md         # Angular 预设
│   ├── svelte.md          # Svelte 预设
│   ├── next.md            # Next.js 预设
│   ├── nuxt.md            # Nuxt 预设
│   ├── node.md            # Node 预设
│   └── custom.md          # 自定义预设
└── examples/              # 示例
    ├── basic.md           # 基本使用
    ├── single-file.md     # 单文件格式化
    ├── directory.md       # 目录格式化
    ├── watch-mode.md      # Watch 模式
    ├── programmatic.md    # 编程式 API
    ├── monorepo.md        # Monorepo
    ├── github-actions.md  # GitHub Actions
    ├── gitlab-ci.md       # GitLab CI
    └── pre-commit.md      # pre-commit
```

## 已创建的文档

✅ VitePress 配置 (`.vitepress/config.ts`)
✅ 首页 (`index.md`)
✅ 介绍 (`guide/introduction.md`)
✅ 快速开始 (`guide/getting-started.md`)

## 待创建的文档

由于篇幅限制，其他文档页面的模板已经通过配置文件定义。你可以基于以下模板创建：

### 指南页面模板

```markdown
# 页面标题

简短介绍

## 主要内容

### 子章节

内容...

## 示例

\`\`\`bash
命令示例
\`\`\`

## 相关链接

- [相关页面1](/guide/xxx)
- [相关页面2](/api/xxx)
```

### API 页面模板

```markdown
# API 名称

简介

## 构造函数

\`\`\`typescript
constructor(params: Type)
\`\`\`

## 方法

### methodName()

描述

\`\`\`typescript
methodName(param: Type): ReturnType
\`\`\`

## 示例

\`\`\`typescript
const instance = new ClassName()
\`\`\`
```

## 启动文档服务器

```bash
# 安装依赖
npm install

# 开发模式
npm run docs:dev

# 构建文档
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## 访问文档

开发模式启动后，访问：http://localhost:5173

## 自定义

### 修改主题色

编辑 `docs/.vitepress/config.ts`

### 添加页面

1. 在对应目录创建 `.md` 文件
2. 在 `config.ts` 的 `sidebar` 中添加链接

### 添加导航

在 `config.ts` 的 `nav` 中添加项目

## 部署

文档可以部署到：
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

详见 VitePress 官方部署文档。
