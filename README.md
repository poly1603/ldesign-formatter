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
1. 创建 `.prettierrc.js` 配置文件
2. 创建 `.eslintrc.js` 配置文件
3. 创建 `.stylelintrc.js` 配置文件（如果有 CSS）
4. 配置 Git hooks（可选）
5. 更新 `.gitignore` 和 `.editorconfig`

### 基础使用

```bash
# 格式化所有文件
npx ldesign-formatter format

# 格式化指定目录
npx ldesign-formatter format src/

# 只检查不修改
npx ldesign-formatter check

# 格式化暂存的文件（适合 pre-commit）
npx ldesign-formatter format --staged
```

## ⚙️ 配置

### 配置文件

在项目根目录创建 `formatter.config.js`：

```javascript
module.exports = {
  // 选择预设配置
  preset: 'react-typescript', // 'vue', 'react', 'node', 'react-typescript'
  
  // Prettier 配置
  prettier: {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 100,
    bracketSpacing: true,
    arrowParens: 'avoid',
  },
  
  // ESLint 配置
  eslint: {
    extends: ['@ldesign/eslint-config'],
    rules: {
      // 自定义规则
    },
  },
  
  // Stylelint 配置
  stylelint: {
    extends: ['@ldesign/stylelint-config'],
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
};
```

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

MIT © LDesign Team
@ldesign/formatter - Code formatting tool
