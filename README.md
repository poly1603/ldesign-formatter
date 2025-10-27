# @ldesign/formatter

> 🎨 统一的代码格式化工具，让你的代码始终保持优雅

## ✨ 特性

- 🎨 **统一配置管理** - 集中管理 Prettier、ESLint、Stylelint 配置
- 🔄 **批量格式化** - 一键格式化整个项目或指定目录
- 🪝 **Git Hooks 集成** - 自动配置 pre-commit/pre-push hooks
- ⚙️ **自定义规则** - 支持项目级规则覆盖
- 📈 **增量格式化** - 只格式化变更的文件，提高效率
- 🔧 **IDE 集成** - 完美支持 VSCode、WebStorm 等主流 IDE
- 📦 **预设配置** - 提供多种预设配置（React、Vue、TypeScript等）

## 📦 安装

```bash
npm install @ldesign/formatter --save-dev
# 或
yarn add @ldesign/formatter -D
# 或
pnpm add @ldesign/formatter -D
```

## 🚀 快速开始

### 初始化配置

```bash
npx ldesign-formatter init
```

这将会：
1. 创建 `formatter.config.js` 配置文件
2. 创建 `.prettierrc` 配置文件
3. 创建 `.eslintrc.js` 配置文件（可选）
4. 创建 `.stylelintrc.json` 配置文件（可选）
5. 配置 Git hooks（可选）
6. 更新 `.editorconfig` 和 `package.json`

### 基础使用

```bash
# 格式化所有文件
npx ldesign-formatter format

# 格式化指定目录或文件
npx ldesign-formatter format src/
npx ldesign-formatter format src/components/Button.vue

# 只检查不修改
npx ldesign-formatter check

# 格式化暂存的文件（适合 pre-commit）
npx ldesign-formatter format --staged
```

## ⚙️ 配置

### 预设配置

支持以下预设配置：

- `base` - 基础配置，只包含 Prettier
- `vue` - Vue.js 项目配置
- `vue-typescript` - Vue.js + TypeScript 项目配置（推荐）
- `react` - React 项目配置
- `react-typescript` - React + TypeScript 项目配置
- `node` - Node.js 项目配置

### 配置文件

在项目根目录创建 `formatter.config.js`：

```javascript
module.exports = {
  // 选择预设配置
  preset: 'vue-typescript',
  
  // Prettier 配置（可覆盖预设）
  prettier: {
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
    bracketSpacing: true,
    arrowParens: 'avoid',
  },
  
  // ESLint 配置（可覆盖预设）
  eslint: {
    extends: ['@antfu/eslint-config'],
    rules: {
      // 自定义规则
    },
  },
  
  // Stylelint 配置（可覆盖预设）
  stylelint: {
    extends: ['stylelint-config-standard'],
    rules: {
      // 自定义规则
    },
  },
  
  // 文件过滤
  ignore: [
    'node_modules',
    'dist',
    'build',
    '*.min.js',
    '*.min.css',
  ],
  
  // Git hooks 配置
  gitHooks: {
    preCommit: true,
    prePush: false,
  },
}
```

## 📖 CLI 命令

### init

初始化格式化配置：

```bash
ldesign-formatter init [options]
```

选项：
- `-p, --preset <preset>` - 指定预设配置
- `--no-git-hooks` - 不启用 Git hooks
- `-f, --force` - 强制覆盖已存在的配置文件
- `--skip-prompts` - 跳过交互式提示

### format

格式化代码文件：

```bash
ldesign-formatter format [paths...] [options]
```

选项：
- `-c, --check` - 只检查不修改
- `-s, --staged` - 只格式化暂存的文件
- `-v, --verbose` - 显示详细信息
- `--no-cache` - 不使用缓存

### check

检查代码格式（不修改文件）：

```bash
ldesign-formatter check [paths...] [options]
```

选项：
- `-v, --verbose` - 显示详细信息

## 💡 使用示例

### 在 package.json 中添加脚本

```json
{
  "scripts": {
    "format": "ldesign-formatter format",
    "format:check": "ldesign-formatter check",
    "format:staged": "ldesign-formatter format --staged"
  }
}
```

### 在 CI/CD 中使用

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run format:check
```

### 配合 Git Hooks

初始化时启用 Git hooks，每次提交前自动格式化暂存的文件：

```bash
npx ldesign-formatter init --git-hooks
```

## 🔧 编程式 API

你也可以在代码中使用 formatter：

```typescript
import { Formatter, ConfigLoader } from '@ldesign/formatter'

// 加载配置
const configLoader = new ConfigLoader()
const config = await configLoader.load(process.cwd())

// 创建格式化器
const formatter = new Formatter(process.cwd(), config)

// 格式化文件
const result = await formatter.format({
  paths: ['src/'],
  check: false,
})

console.log(`Formatted ${result.formatted} files`)
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

MIT © LDesign Team
