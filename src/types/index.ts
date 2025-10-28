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
  semi?: boolean
  singleQuote?: boolean
  quoteProps?: 'as-needed' | 'consistent' | 'preserve'
  trailingComma?: 'none' | 'es5' | 'all'
  tabWidth?: number
  useTabs?: boolean
  printWidth?: number
  bracketSpacing?: boolean
  bracketSameLine?: boolean
  arrowParens?: 'always' | 'avoid'
  endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto'
  [key: string]: any
}

/**
 * ESLint 配置
 */
export interface ESLintConfig {
  extends?: string | string[]
  plugins?: string[]
  rules?: Record<string, any>
  env?: Record<string, boolean>
  parser?: string
  parserOptions?: Record<string, any>
  [key: string]: any
}

/**
 * Stylelint 配置
 */
export interface StylelintConfig {
  extends?: string | string[]
  plugins?: string[]
  rules?: Record<string, any>
  [key: string]: any
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

