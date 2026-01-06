/**
 * @ldesign/formatter
 * 统一的代码格式化工具
 * @packageDocumentation
 */

// 导出类型
export * from './types/index.js'

// 导出错误类
export {
  ErrorCode,
  FormatterError,
  ConfigError,
  FileError,
  IntegrationError,
  CacheError,
  GitError,
  isFormatterError,
  isErrorCode,
  wrapError,
  assert,
  assertDefined,
  getErrorMessage,
  safeAsync,
  safeSync,
} from './errors.js'
export type { ErrorSeverity } from './errors.js'

// 导出预设配置
export * from './presets/index.js'

// 导出核心功能
export { ConfigLoader, configLoader } from './core/config-loader.js'
export { ConfigValidator, configValidator } from './core/config-validator.js'
export { FileCollector } from './core/file-collector.js'
export { Formatter } from './core/formatter.js'
export { IncrementalFormatter } from './core/incremental-formatter.js'
export { GitHooksManager } from './core/git-hooks-manager.js'
export { CacheManager } from './core/cache-manager.js'
export { ConflictDetector, createConflictDetector } from './core/conflict-detector.js'

// 导出集成
export { PrettierIntegration } from './integrations/prettier.js'
export { ESLintIntegration } from './integrations/eslint.js'
export { StylelintIntegration } from './integrations/stylelint.js'

// 导出工具函数
export { Logger, logger } from './utils/logger.js'
export * from './utils/file-utils.js'
export * from './utils/git-utils.js'
export { ProjectDetector, createProjectDetector } from './utils/project-detector.js'

