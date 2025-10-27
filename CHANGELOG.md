# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-10-27

### 🎉 Initial Release

#### ✨ Features

- **核心功能**
  - 集成 Prettier、ESLint、Stylelint
  - 统一配置管理
  - 批量格式化支持
  - 增量格式化（只格式化变更的文件）
  - Git hooks 集成（pre-commit）
  
- **预设配置**
  - Base - 基础配置
  - Vue - Vue.js 项目配置
  - Vue TypeScript - Vue + TypeScript 配置
  - React - React 项目配置
  - React TypeScript - React + TypeScript 配置
  - Node - Node.js 项目配置

- **CLI 命令**
  - `init` - 初始化格式化配置
  - `format` - 格式化代码文件
  - `check` - 检查代码格式（不修改）
  - 支持 `--staged` 只格式化暂存文件
  - 支持 `--check` 检查模式
  - 支持 `--verbose` 详细输出

- **配置管理**
  - 支持 `formatter.config.js` 配置文件
  - 支持 cosmiconfig 多种配置格式
  - 配置验证和错误提示
  - 预设配置和自定义配置合并

- **文件处理**
  - 智能文件收集器
  - 支持 glob 模式匹配
  - 集成 .gitignore 和 .prettierignore
  - 自动过滤可格式化文件

- **Git 集成**
  - 自动安装 husky
  - 配置 lint-staged
  - 生成 pre-commit hook
  - 支持格式化暂存文件

- **用户体验**
  - 交互式初始化向导
  - 美化的控制台输出
  - 加载动画和进度提示
  - 详细的错误信息
  - 格式化结果统计

#### 📦 Dependencies

- prettier@^3.2.5
- eslint@^9.18.0
- stylelint@^16.10.0
- husky@^9.0.11
- lint-staged@^15.2.0
- commander@^12.0.0
- inquirer@^9.2.0
- chalk@^5.3.0
- ora@^8.0.1

#### 📖 Documentation

- 完整的 README 文档
- 快速开始指南
- 实施完成报告
- API 文档
- 使用示例

#### 🧪 Testing

- 配置加载器测试
- 配置验证器测试
- 预设配置测试
- 基础测试覆盖

---

## Future Plans

### [1.1.0] - Planned

- [ ] 添加文件缓存机制
- [ ] 性能优化（并发处理）
- [ ] 支持自定义插件系统
- [ ] 添加更多预设配置
- [ ] 增加测试覆盖率
- [ ] 添加格式化报告生成
- [ ] 支持配置文件热重载

### [1.2.0] - Planned

- [ ] Web UI 界面
- [ ] 可视化配置编辑器
- [ ] 格式化统计和分析
- [ ] 团队规范同步
- [ ] 云端配置共享

---

[1.0.0]: https://github.com/ldesign/ldesign/releases/tag/formatter-v1.0.0

