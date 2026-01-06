// ============================================================================
// 基础类型
// ============================================================================

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * 格式化工具类型
 */
export type FormatterTool = 'prettier' | 'eslint' | 'stylelint'

/**
 * 文件状态
 */
export type FileStatus = 'formatted' | 'unchanged' | 'error' | 'ignored' | 'pending'

/**
 * 解析器类型
 */
export type ParserType =
  | 'babel'
  | 'babel-flow'
  | 'babel-ts'
  | 'typescript'
  | 'css'
  | 'scss'
  | 'less'
  | 'html'
  | 'xml'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'astro'
  | 'json'
  | 'json5'
  | 'jsonc'
  | 'yaml'
  | 'toml'
  | 'markdown'
  | 'mdx'
  | 'graphql'
  | string  // 允许自定义解析器

// ============================================================================
// 配置相关类型
// ============================================================================

/**
 * 格式化工具的配置接口
 */
export interface FormatterConfig {
  /** 预设配置名称 */
  preset?: PresetName
  /** Prettier 配置 */
  prettier?: PrettierConfig
  /** ESLint 配置 */
  eslint?: ESLintConfig
  /** Stylelint 配置 */
  stylelint?: StylelintConfig
  /** 忽略的文件或目录 */
  ignore?: string[]
  /** Git hooks 配置 */
  gitHooks?: GitHooksConfig
  /** 是否在 CI 环境中运行 */
  ci?: boolean
  /** 日志级别 */
  logLevel?: LogLevel
  /** 并发数 */
  concurrency?: number
  /** 格式化超时（毫秒） */
  timeout?: number
  /** 失败重试次数 */
  retries?: number
}

/**
 * 预设配置名称
 */
export type PresetName =
  | 'base'
  | 'vue'
  | 'vue-typescript'
  | 'react'
  | 'react-typescript'
  | 'node'
  | 'angular'
  | 'angular-typescript'
  | 'svelte'
  | 'svelte-typescript'
  | 'next'
  | 'nuxt'

/**
 * Prettier 配置
 */
export interface PrettierConfig {
  /** 是否添加分号 */
  semi?: boolean
  /** 使用单引号 */
  singleQuote?: boolean
  /** 引号属性处理 */
  quoteProps?: 'as-needed' | 'consistent' | 'preserve'
  /** 尾随逗号 */
  trailingComma?: 'none' | 'es5' | 'all'
  /** Tab 宽度 */
  tabWidth?: number
  /** 使用 Tab 而非空格 */
  useTabs?: boolean
  /** 打印宽度 */
  printWidth?: number
  /** 对象括号内空格 */
  bracketSpacing?: boolean
  /** 括号与内容同行 */
  bracketSameLine?: boolean
  /** 箭头函数括号 */
  arrowParens?: 'always' | 'avoid'
  /** 行尾符 */
  endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto'
  /** JSX 单引号 */
  jsxSingleQuote?: boolean
  /** HTML 空白敏感度 */
  htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore'
  /** Vue 文件缩进脚本和样式 */
  vueIndentScriptAndStyle?: boolean
  /** 嵌入语言格式化 */
  embeddedLanguageFormatting?: 'auto' | 'off'
  /** 单属性每行 */
  singleAttributePerLine?: boolean
  /** 其他 Prettier 配置项 */
  [key: string]: unknown
}

/**
 * ESLint 规则严重性
 */
export type ESLintRuleSeverity = 'off' | 'warn' | 'error' | 0 | 1 | 2

/**
 * ESLint 规则配置
 */
export type ESLintRuleConfig = ESLintRuleSeverity | [ESLintRuleSeverity, ...unknown[]]

/**
 * ESLint 配置
 */
export interface ESLintConfig {
  /** 继承的配置 */
  extends?: string | string[]
  /** 插件 */
  plugins?: string[]
  /** 规则 */
  rules?: Record<string, ESLintRuleConfig>
  /** 环境 */
  env?: Record<string, boolean>
  /** 解析器 */
  parser?: string
  /** 解析器选项 */
  parserOptions?: {
    ecmaVersion?: number | 'latest'
    sourceType?: 'module' | 'script' | 'commonjs'
    ecmaFeatures?: {
      jsx?: boolean
      globalReturn?: boolean
      impliedStrict?: boolean
    }
    project?: string | string[]
    tsconfigRootDir?: string
    [key: string]: unknown
  }
  /** 全局变量 */
  globals?: Record<string, boolean | 'readonly' | 'writable' | 'off'>
  /** 设置 */
  settings?: Record<string, unknown>
  /** 其他配置 */
  [key: string]: unknown
}

/**
 * Stylelint 规则严重性
 */
export type StylelintRuleSeverity = 'warning' | 'error' | null | boolean

/**
 * Stylelint 配置
 */
export interface StylelintConfig {
  /** 继承的配置 */
  extends?: string | string[]
  /** 插件 */
  plugins?: string[]
  /** 规则 */
  rules?: Record<string, StylelintRuleSeverity | [StylelintRuleSeverity, unknown]>
  /** 自定义语法 */
  customSyntax?: string
  /** 忽略文件 */
  ignoreFiles?: string | string[]
  /** 默认严重性 */
  defaultSeverity?: 'warning' | 'error'
  /** 其他配置 */
  [key: string]: unknown
}

/**
 * Git Hooks 配置
 */
export interface GitHooksConfig {
  /** 是否启用 pre-commit hook */
  preCommit?: boolean
  /** 是否启用 pre-push hook */
  prePush?: boolean
  /** 是否启用 commit-msg hook */
  commitMsg?: boolean
}

/**
 * 格式化选项
 */
export interface FormatOptions {
  /** 只检查不修改 */
  check?: boolean
  /** 只格式化暂存的文件 */
  staged?: boolean
  /** 是否写入文件 */
  write?: boolean
  /** 要格式化的路径 */
  paths?: string[]
  /** 是否显示详细信息 */
  verbose?: boolean
  /** 是否使用缓存 */
  cache?: boolean
  /** 显示差异 */
  diff?: boolean
  /** 输出格式 */
  outputFormat?: 'text' | 'json' | 'html'
  /** 报告输出路径 */
  reportPath?: string
}

/**
 * 格式化结果
 */
export interface FormatResult {
  /** 总文件数 */
  total: number
  /** 已格式化的文件数 */
  formatted: number
  /** 未改变的文件数 */
  unchanged: number
  /** 错误的文件数 */
  errors: number
  /** 错误详情 */
  errorDetails?: Array<{
    file: string
    message: string
    error?: Error
  }>
  /** 格式化的文件列表 */
  formattedFiles?: string[]
  /** 执行时长（毫秒） */
  duration?: number
}

/**
 * 文件信息
 */
export interface FileInfo {
  /** 文件路径 */
  path: string
  /** 文件内容 */
  content?: string
  /** 是否被修改 */
  modified?: boolean
  /** 错误信息 */
  error?: Error
}

/**
 * 预设配置接口
 */
export interface PresetConfig {
  name: PresetName
  prettier: PrettierConfig
  eslint?: ESLintConfig
  stylelint?: StylelintConfig
  ignore?: string[]
}

/**
 * 初始化选项
 */
export interface InitOptions {
  /** 预设配置 */
  preset?: PresetName
  /** 是否启用 Git hooks */
  gitHooks?: boolean
  /** 是否覆盖已存在的配置 */
  force?: boolean
  /** 是否跳过交互式提示 */
  skipPrompts?: boolean
}

/**
 * CLI 上下文
 */
export interface CLIContext {
  /** 当前工作目录 */
  cwd: string
  /** 配置 */
  config?: FormatterConfig
  /** 是否为调试模式 */
  debug?: boolean
}

/**
 * 缓存条目
 */
export interface CacheEntry {
  /** 文件路径 */
  path: string
  /** 文件哈希 */
  hash: string
  /** 最后格式化时间 */
  timestamp: number
  /** 配置哈希 */
  configHash: string
}

/**
 * 规则冲突
 */
export interface RuleConflict {
  /** 规则名称 */
  rule: string
  /** 冲突的工具 */
  tools: string[]
  /** 冲突描述 */
  description: string
  /** 建议的解决方案 */
  suggestion?: string
}

/**
 * 统计信息
 */
export interface FormatStats {
  /** 项目路径 */
  projectPath: string
  /** 总文件数 */
  totalFiles: number
  /** 文件类型分布 */
  fileTypes: Record<string, number>
  /** 格式化历史 */
  history: Array<{
    timestamp: number
    formatted: number
    errors: number
  }>
  /** 常见错误 */
  commonErrors: Array<{
    message: string
    count: number
  }>
}

/**
 * 项目检测结果
 */
export interface ProjectDetection {
  /** 项目类型 */
  type: PresetName
  /** 置信度 (0-1) */
  confidence: number
  /** 检测到的特征 */
  features: string[]
}

/**
 * Watch 选项
 */
export interface WatchOptions {
  /** 要监听的路径 */
  paths?: string[]
  /** 是否显示详细信息 */
  verbose?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
}

/**
 * 迁移选项
 */
export interface MigrateOptions {
  /** 源格式化工具 */
  from: 'prettier' | 'eslint' | 'standard' | 'airbnb'
  /** 是否备份原配置 */
  backup?: boolean
  /** 是否强制覆盖 */
  force?: boolean
}

/**
 * 报告格式
 */
export interface FormatReport {
  /** 报告生成时间 */
  timestamp: number
  /** 格式化结果 */
  result: FormatResult
  /** 配置信息 */
  config: FormatterConfig
  /** 执行时长（毫秒） */
  duration: number
  /** 环境信息 */
  environment: {
    node: string
    platform: string
    cwd: string
  }
}

// ============================================================================
// 事件系统类型
// ============================================================================

/**
 * 事件类型
 */
export type FormatterEventType =
  | 'start'
  | 'progress'
  | 'complete'
  | 'error'
  | 'file'
  | 'cache:hit'
  | 'cache:miss'
  | 'config:load'
  | 'config:error'

/**
 * 格式化开始事件数据
 */
export interface FormatStartEventData {
  /** 总文件数 */
  total: number
  /** 是否仅检查 */
  check: boolean
  /** 文件列表 */
  files: string[]
}

/**
 * 格式化进度事件数据
 */
export interface FormatProgressEventData {
  /** 已完成数 */
  completed: number
  /** 总文件数 */
  total: number
  /** 百分比 */
  percentage: number
  /** 当前文件 */
  file: string
  /** 处理工具 */
  tool: FormatterTool
}

/**
 * 格式化完成事件数据
 */
export interface FormatCompleteEventData {
  /** 格式化结果 */
  result: FormatResult
  /** 执行时长 */
  duration: number
}

/**
 * 文件事件数据
 */
export interface FileEventData {
  /** 文件路径 */
  file: string
  /** 操作类型 */
  action: 'formatted' | 'unchanged' | 'error' | 'skipped'
  /** 处理工具 */
  tool?: FormatterTool
  /** 错误信息 */
  error?: Error
}

/**
 * 事件数据映射
 */
export interface FormatterEventDataMap {
  'start': FormatStartEventData
  'progress': FormatProgressEventData
  'complete': FormatCompleteEventData
  'error': { error: Error; file?: string }
  'file': FileEventData
  'cache:hit': { file: string }
  'cache:miss': { file: string }
  'config:load': { config: FormatterConfig; filepath: string }
  'config:error': { error: Error; filepath?: string }
}

/**
 * 事件处理器
 */
export type FormatterEventHandler<T extends FormatterEventType> = (
  data: FormatterEventDataMap[T]
) => void | Promise<void>

// ============================================================================
// 任务队列类型
// ============================================================================

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * 格式化任务
 */
export interface FormatTask {
  /** 任务 ID */
  id: string
  /** 文件路径 */
  file: string
  /** 任务状态 */
  status: TaskStatus
  /** 创建时间 */
  createdAt: number
  /** 开始时间 */
  startedAt?: number
  /** 完成时间 */
  completedAt?: number
  /** 重试次数 */
  retries?: number
  /** 错误信息 */
  error?: Error
}

/**
 * 任务队列统计
 */
export interface TaskQueueStats {
  pending: number
  running: number
  completed: number
  failed: number
  cancelled?: number
  total: number
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

/**
 * 深度可选
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/**
 * 提取必填字段
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

/**
 * 提取可选字段
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]

/**
 * 运行时配置
 */
export type RuntimeConfig = Required<Omit<FormatterConfig, 'preset'>> & {
  preset?: PresetName
}

