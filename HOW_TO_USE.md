# 如何使用 @ldesign/formatter

## 📦 第一步：安装依赖

由于这是 monorepo 中的工具包，首先需要安装依赖：

```bash
cd E:\ldesign\ldesign\tools\formatter
pnpm install
```

## 🔨 第二步：构建项目

```bash
pnpm build
```

这将：
- 编译 TypeScript 代码
- 生成 ESM 和 CJS 格式
- 生成类型声明文件
- 输出到 `dist/` 目录

## 🧪 第三步：运行测试（可选）

```bash
pnpm test
```

确保所有测试通过。

## 🚀 第四步：在项目中使用

### 方式 1: 本地开发模式

在 monorepo 根目录：

```bash
# 链接到全局
cd tools/formatter
npm link

# 在目标项目中使用
cd ../../apps/app  # 或其他项目
npm link @ldesign/formatter

# 初始化
npx ldesign-formatter init
```

### 方式 2: 作为工作空间依赖

在目标项目的 `package.json` 中添加：

```json
{
  "devDependencies": {
    "@ldesign/formatter": "workspace:*"
  }
}
```

然后运行：

```bash
pnpm install
npx ldesign-formatter init
```

### 方式 3: 发布到 NPM 后使用

```bash
# 在 formatter 目录发布
pnpm publish

# 在其他项目中安装
pnpm add @ldesign/formatter -D
npx ldesign-formatter init
```

## 📝 第五步：初始化配置

```bash
npx ldesign-formatter init
```

选择适合的预设配置：
- **vue-typescript** - 适用于 LDesign 项目（推荐）
- **react-typescript** - 适用于 React + TypeScript 项目
- **node** - 适用于 Node.js 项目

## 🎨 第六步：开始格式化

```bash
# 格式化所有文件
npx ldesign-formatter format

# 格式化指定目录
npx ldesign-formatter format src/

# 只检查不修改
npx ldesign-formatter check

# 格式化暂存文件
npx ldesign-formatter format --staged
```

## 🔧 第七步：配置 package.json 脚本

在项目的 `package.json` 中添加：

```json
{
  "scripts": {
    "format": "ldesign-formatter format",
    "format:check": "ldesign-formatter check",
    "format:staged": "ldesign-formatter format --staged"
  }
}
```

然后可以使用：

```bash
npm run format
npm run format:check
```

## 🎯 第八步：Git Hooks 配置

如果在初始化时启用了 Git hooks，每次提交时会自动格式化：

```bash
git add .
git commit -m "feat: add new feature"
# 自动触发格式化
```

## 🔍 在 LDesign 项目中使用

### 在 apps/app 中使用

```bash
cd E:\ldesign\ldesign\apps\app

# 添加依赖（如果还没有）
pnpm add @ldesign/formatter -D

# 初始化（选择 vue-typescript 预设）
npx ldesign-formatter init

# 格式化所有代码
npm run format

# 检查格式
npm run format:check
```

### 在其他 packages 中使用

```bash
cd E:\ldesign\ldesign\packages/[package-name]

# 初始化
npx ldesign-formatter init

# 格式化
npm run format
```

## 💡 实用技巧

### 1. 自定义配置

编辑项目根目录的 `formatter.config.js`：

```javascript
module.exports = {
  preset: 'vue-typescript',
  prettier: {
    printWidth: 100,  // 改变行宽
    semi: false,      // 不使用分号
  },
}
```

### 2. 忽略特定文件

在 `formatter.config.js` 中添加：

```javascript
module.exports = {
  // ...
  ignore: [
    'dist',
    'node_modules',
    '*.min.js',
    'legacy/**',  // 忽略 legacy 目录
  ],
}
```

### 3. CI/CD 集成

在 `.github/workflows/ci.yml` 中：

```yaml
- name: Check code format
  run: npm run format:check
```

### 4. VSCode 集成

安装 Prettier 扩展后，会自动使用项目的 `.prettierrc` 配置。

## 🐛 故障排查

### 问题 1: 命令找不到

```bash
# 确保已经构建
pnpm build

# 检查 dist 目录是否存在
ls dist/
```

### 问题 2: Git hooks 不工作

```bash
# 检查 .husky 目录
ls .husky/

# 重新安装 hooks
npx ldesign-formatter init --force
```

### 问题 3: 格式化报错

```bash
# 使用 verbose 模式查看详细错误
npx ldesign-formatter format --verbose

# 检查配置文件
cat formatter.config.js
```

## 📚 更多信息

- [完整文档](./README.md)
- [快速开始](./QUICK_START.md)
- [实施报告](./IMPLEMENTATION_COMPLETE.md)
- [项目总结](./PROJECT_SUMMARY.md)

## 🤝 需要帮助？

如果遇到问题，请：
1. 查看文档
2. 检查配置文件
3. 运行 `--verbose` 模式
4. 提交 issue

---

**祝你使用愉快！** 🎉

