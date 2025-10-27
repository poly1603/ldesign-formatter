# 🚀 快速开始指南

## 1. 安装

```bash
pnpm add @ldesign/formatter -D
```

## 2. 初始化

```bash
npx ldesign-formatter init
```

按照提示选择：
- 预设配置：`vue-typescript`（推荐）
- Git hooks：`Yes`

## 3. 开始使用

### 格式化所有文件
```bash
npm run format
# 或
npx ldesign-formatter format
```

### 检查格式（不修改）
```bash
npm run format:check
# 或
npx ldesign-formatter check
```

### 格式化指定目录
```bash
npx ldesign-formatter format src/
```

### 格式化暂存文件
```bash
npx ldesign-formatter format --staged
```

## 4. Git 提交

配置了 Git hooks 后，每次提交时会自动格式化暂存的文件：

```bash
git add .
git commit -m "feat: add new feature"
# 自动触发格式化
```

## 5. CI/CD 集成

在 `.github/workflows/ci.yml` 中添加：

```yaml
- name: Check code format
  run: npm run format:check
```

## 6. 配置自定义

编辑 `formatter.config.js` 来自定义配置：

```javascript
module.exports = {
  preset: 'vue-typescript',
  prettier: {
    printWidth: 100, // 自定义行宽
  },
}
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npx ldesign-formatter init` | 初始化配置 |
| `npx ldesign-formatter format` | 格式化所有文件 |
| `npx ldesign-formatter check` | 检查格式 |
| `npx ldesign-formatter format --staged` | 格式化暂存文件 |
| `npx ldesign-formatter format src/` | 格式化指定目录 |

## 预设配置

- `base` - 基础配置（只有 Prettier）
- `vue` - Vue.js 项目
- `vue-typescript` - Vue + TypeScript（推荐）
- `react` - React 项目
- `react-typescript` - React + TypeScript
- `node` - Node.js 项目

## 需要帮助？

查看 [完整文档](./README.md) 了解更多信息。

