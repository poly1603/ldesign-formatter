# 快速开始

本指南将帮助你在 5 分钟内开始使用 @ldesign/formatter。

## 安装

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

## 初始化配置

运行 init 命令，工具会自动检测你的项目类型：

```bash
npx ldesign-formatter init
```

你会看到类似的输出：

```
🔍 检测项目类型...
✓ 检测到 Vue + TypeScript 项目 (置信度: 95%)
  特征: vue dependency, TypeScript, @vue/cli-service

推荐使用预设: vue-typescript

? 是否使用推荐的预设? (Y/n)
```

确认后，工具会创建以下文件：

- `formatter.config.js` - 主配置文件
- `.prettierrc` - Prettier 配置
- `.prettierignore` - Prettier 忽略文件
- `.formatterignore` - Formatter 忽略文件

## 格式化代码

### 格式化所有文件

```bash
npx ldesign-formatter format
```

### 格式化指定目录

```bash
npx ldesign-formatter format src/
```

### 格式化指定文件

```bash
npx ldesign-formatter format src/components/Button.vue
```

## 检查代码格式

只检查而不修改文件：

```bash
npx ldesign-formatter check
```

这在 CI/CD 流程中非常有用。

## 添加 npm 脚本

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "format": "ldesign-formatter format",
    "format:check": "ldesign-formatter check",
    "format:watch": "ldesign-formatter watch src/"
  }
}
```

现在可以使用：

```bash
npm run format
npm run format:check
npm run format:watch
```

## 启用 Git Hooks

在初始化时启用 Git hooks：

```bash
npx ldesign-formatter init --git-hooks
```

或者在已存在的项目中添加：

在 `formatter.config.js` 中：

```javascript
module.exports = {
  preset: 'vue-typescript',
  gitHooks: {
    preCommit: true,  // 提交前自动格式化
    prePush: false,   // 推送前检查格式
  },
}
```

这会自动配置 `husky` 和 `lint-staged`，在每次 git commit 前自动格式化暂存的文件。

## 开发时使用 Watch 模式

启动 Watch 模式，实时监听文件变化：

```bash
npx ldesign-formatter watch src/
```

现在每次保存文件时，都会自动格式化！

## 配置示例

### Vue + TypeScript 项目

```javascript
// formatter.config.js
module.exports = {
  preset: 'vue-typescript',
  prettier: {
    semi: false,
    singleQuote: true,
    printWidth: 100,
  },
  ignore: [
    'dist',
    'node_modules',
    '*.d.ts',
  ],
}
```

### React + TypeScript 项目

```javascript
// formatter.config.js
module.exports = {
  preset: 'react-typescript',
  prettier: {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
  },
  eslint: {
    rules: {
      'react/prop-types': 'off',
    },
  },
}
```

### Next.js 项目

```javascript
// formatter.config.js
module.exports = {
  preset: 'next',
  prettier: {
    semi: false,
    singleQuote: true,
  },
}
```

## 常见工作流

### 1. 开发新功能

```bash
# 启动 Watch 模式
npm run format:watch

# 在另一个终端开发
# 每次保存文件自动格式化
```

### 2. 提交代码前

如果启用了 Git hooks，代码会自动格式化。否则手动运行：

```bash
# 格式化暂存的文件
npm run format -- --staged

# 或格式化所有文件
npm run format
```

### 3. CI/CD 检查

```yaml
# .github/workflows/ci.yml
- name: Check code format
  run: npm run format:check
```

## 下一步

- [配置文件](/guide/configuration) - 深入了解配置选项
- [CLI 命令](/guide/cli-format) - 掌握所有命令
- [预设配置](/guide/presets) - 选择或自定义预设
- [高级功能](/guide/caching) - 探索缓存、冲突检测等功能
