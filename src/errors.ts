/**
 * @ldesign/formatter 错误处理模块
 * @module errors
 * @description 提供统一的错误类层次结构和错误处理工具
 */

// ============================================================================
// 错误码枚举
// ============================================================================

/**
 * 错误码枚举
 * @description 格式: E{类别}{编号}
 * - E1xxx: 配置错误
 * - E2xxx: 文件错误
 * - E3xxx: 集成错误 (Prettier/ESLint/Stylelint)
 * - E4xxx: 缓存错误
 * - E5xxx: Git 错误
 * - E9xxx: 未知错误
 */
export enum ErrorCode {
  // 配置错误 E1xxx
  CONFIG_NOT_FOUND = 'E1001',
  CONFIG_INVALID = 'E1002',
  CONFIG_PARSE_ERROR = 'E1003',
  CONFIG_VALIDATION_ERROR = 'E1004',
  PRESET_NOT_FOUND = 'E1005',
  PRESET_INVALID = 'E1006',

  // 文件错误 E2xxx
  FILE_NOT_FOUND = 'E2001',
  FILE_READ_ERROR = 'E2002',
  FILE_WRITE_ERROR = 'E2003',
  FILE_PERMISSION_ERROR = 'E2004',
  FILE_TOO_LARGE = 'E2005',
  DIRECTORY_NOT_FOUND = 'E2006',
  GLOB_ERROR = 'E2007',

  // 集成错误 E3xxx
  PRETTIER_ERROR = 'E3001',
  PRETTIER_PARSE_ERROR = 'E3002',
  PRETTIER_CONFIG_ERROR = 'E3003',
  ESLINT_ERROR = 'E3101',
  ESLINT_CONFIG_ERROR = 'E3102',
  ESLINT_RULE_ERROR = 'E3103',
  STYLELINT_ERROR = 'E3201',
  STYLELINT_CONFIG_ERROR = 'E3202',
  STYLELINT_RULE_ERROR = 'E3203',
  INTEGRATION_TIMEOUT = 'E3900',
  INTEGRATION_UNAVAILABLE = 'E3901',

  // 缓存错误 E4xxx
  CACHE_READ_ERROR = 'E4001',
  CACHE_WRITE_ERROR = 'E4002',
  CACHE_CORRUPT = 'E4003',
  CACHE_VERSION_MISMATCH = 'E4004',

  // Git 错误 E5xxx
  GIT_NOT_FOUND = 'E5001',
  GIT_NOT_REPOSITORY = 'E5002',
  GIT_HOOKS_ERROR = 'E5003',
  GIT_STAGED_FILES_ERROR = 'E5004',

  // 未知错误 E9xxx
  UNKNOWN_ERROR = 'E9999',
}

/**
 * 错误严重性
 */
export type ErrorSeverity = 'warning' | 'error' | 'fatal'

// ============================================================================
// 基础错误类
// ============================================================================

/**
 * 格式化工具基础错误类
 * @description 所有格式化工具错误的基类
 * @example
 * ```typescript
 * throw new FormatterError('配置文件无效', ErrorCode.CONFIG_INVALID)
 * ```
 */
export class FormatterError extends Error {
  /** 错误码 */
  readonly code: ErrorCode
  /** 错误严重性 */
  readonly severity: ErrorSeverity
  /** 原始错误 */
  readonly cause?: Error
  /** 错误发生时间 */
  readonly timestamp: Date
  /** 额外上下文信息 */
  readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    options?: {
      severity?: ErrorSeverity
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'FormatterError'
    this.code = code
    this.severity = options?.severity ?? 'error'
    this.cause = options?.cause
    this.timestamp = new Date()
    this.context = options?.context

    // 保持正确的原型链
    Object.setPrototypeOf(this, new.target.prototype)

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target)
    }
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(): string {
    return `[${this.code}] ${this.message}`
  }
}

// ============================================================================
// 配置错误
// ============================================================================

/**
 * 配置错误类
 * @description 配置加载、解析、验证相关的错误
 */
export class ConfigError extends FormatterError {
  /** 配置文件路径 */
  readonly filepath?: string
  /** 无效的配置键 */
  readonly invalidKey?: string

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.CONFIG_INVALID,
    options?: {
      filepath?: string
      invalidKey?: string
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, {
      severity: 'error',
      cause: options?.cause,
      context: {
        ...options?.context,
        filepath: options?.filepath,
        invalidKey: options?.invalidKey,
      },
    })
    this.name = 'ConfigError'
    this.filepath = options?.filepath
    this.invalidKey = options?.invalidKey
  }

  /**
   * 创建配置未找到错误
   */
  static notFound(filepath: string): ConfigError {
    return new ConfigError(
      `配置文件未找到: ${filepath}`,
      ErrorCode.CONFIG_NOT_FOUND,
      { filepath }
    )
  }

  /**
   * 创建配置解析错误
   */
  static parseError(filepath: string, cause?: Error): ConfigError {
    return new ConfigError(
      `配置文件解析失败: ${filepath}`,
      ErrorCode.CONFIG_PARSE_ERROR,
      { filepath, cause }
    )
  }

  /**
   * 创建配置验证错误
   */
  static validationError(message: string, invalidKey?: string): ConfigError {
    return new ConfigError(
      message,
      ErrorCode.CONFIG_VALIDATION_ERROR,
      { invalidKey }
    )
  }

  /**
   * 创建预设未找到错误
   */
  static presetNotFound(preset: string): ConfigError {
    return new ConfigError(
      `预设配置不存在: ${preset}`,
      ErrorCode.PRESET_NOT_FOUND,
      { context: { preset } }
    )
  }
}

// ============================================================================
// 文件错误
// ============================================================================

/**
 * 文件错误类
 * @description 文件读写、权限相关的错误
 */
export class FileError extends FormatterError {
  /** 文件路径 */
  readonly filepath: string

  constructor(
    message: string,
    filepath: string,
    code: ErrorCode = ErrorCode.FILE_READ_ERROR,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, {
      severity: 'error',
      cause: options?.cause,
      context: {
        ...options?.context,
        filepath,
      },
    })
    this.name = 'FileError'
    this.filepath = filepath
  }

  /**
   * 创建文件未找到错误
   */
  static notFound(filepath: string): FileError {
    return new FileError(
      `文件不存在: ${filepath}`,
      filepath,
      ErrorCode.FILE_NOT_FOUND
    )
  }

  /**
   * 创建文件读取错误
   */
  static readError(filepath: string, cause?: Error): FileError {
    return new FileError(
      `无法读取文件: ${filepath}`,
      filepath,
      ErrorCode.FILE_READ_ERROR,
      { cause }
    )
  }

  /**
   * 创建文件写入错误
   */
  static writeError(filepath: string, cause?: Error): FileError {
    return new FileError(
      `无法写入文件: ${filepath}`,
      filepath,
      ErrorCode.FILE_WRITE_ERROR,
      { cause }
    )
  }

  /**
   * 创建权限错误
   */
  static permissionError(filepath: string): FileError {
    return new FileError(
      `没有权限访问文件: ${filepath}`,
      filepath,
      ErrorCode.FILE_PERMISSION_ERROR
    )
  }

  /**
   * 创建文件过大错误
   */
  static tooLarge(filepath: string, size: number, maxSize: number): FileError {
    return new FileError(
      `文件过大: ${filepath} (${size} bytes, 最大 ${maxSize} bytes)`,
      filepath,
      ErrorCode.FILE_TOO_LARGE,
      { context: { size, maxSize } }
    )
  }
}

// ============================================================================
// 集成错误
// ============================================================================

/**
 * 集成错误类
 * @description Prettier、ESLint、Stylelint 集成相关的错误
 */
export class IntegrationError extends FormatterError {
  /** 集成工具名称 */
  readonly tool: 'prettier' | 'eslint' | 'stylelint'
  /** 相关文件 */
  readonly file?: string

  constructor(
    message: string,
    tool: 'prettier' | 'eslint' | 'stylelint',
    code: ErrorCode,
    options?: {
      file?: string
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, {
      severity: 'error',
      cause: options?.cause,
      context: {
        ...options?.context,
        tool,
        file: options?.file,
      },
    })
    this.name = 'IntegrationError'
    this.tool = tool
    this.file = options?.file
  }

  /**
   * 创建 Prettier 错误
   */
  static prettierError(message: string, file?: string, cause?: Error): IntegrationError {
    return new IntegrationError(
      message,
      'prettier',
      ErrorCode.PRETTIER_ERROR,
      { file, cause }
    )
  }

  /**
   * 创建 Prettier 解析错误
   */
  static prettierParseError(file: string, cause?: Error): IntegrationError {
    return new IntegrationError(
      `Prettier 解析失败: ${file}`,
      'prettier',
      ErrorCode.PRETTIER_PARSE_ERROR,
      { file, cause }
    )
  }

  /**
   * 创建 ESLint 错误
   */
  static eslintError(message: string, file?: string, cause?: Error): IntegrationError {
    return new IntegrationError(
      message,
      'eslint',
      ErrorCode.ESLINT_ERROR,
      { file, cause }
    )
  }

  /**
   * 创建 Stylelint 错误
   */
  static stylelintError(message: string, file?: string, cause?: Error): IntegrationError {
    return new IntegrationError(
      message,
      'stylelint',
      ErrorCode.STYLELINT_ERROR,
      { file, cause }
    )
  }

  /**
   * 创建超时错误
   */
  static timeout(tool: 'prettier' | 'eslint' | 'stylelint', file: string, timeout: number): IntegrationError {
    return new IntegrationError(
      `${tool} 处理超时: ${file} (${timeout}ms)`,
      tool,
      ErrorCode.INTEGRATION_TIMEOUT,
      { file, context: { timeout } }
    )
  }
}

// ============================================================================
// 缓存错误
// ============================================================================

/**
 * 缓存错误类
 */
export class CacheError extends FormatterError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.CACHE_READ_ERROR,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, {
      severity: 'warning',
      cause: options?.cause,
      context: options?.context,
    })
    this.name = 'CacheError'
  }

  /**
   * 创建缓存读取错误
   */
  static readError(cause?: Error): CacheError {
    return new CacheError('无法读取缓存', ErrorCode.CACHE_READ_ERROR, { cause })
  }

  /**
   * 创建缓存写入错误
   */
  static writeError(cause?: Error): CacheError {
    return new CacheError('无法写入缓存', ErrorCode.CACHE_WRITE_ERROR, { cause })
  }

  /**
   * 创建缓存损坏错误
   */
  static corrupt(): CacheError {
    return new CacheError('缓存文件已损坏', ErrorCode.CACHE_CORRUPT)
  }
}

// ============================================================================
// Git 错误
// ============================================================================

/**
 * Git 错误类
 */
export class GitError extends FormatterError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.GIT_NOT_FOUND,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, {
      severity: 'error',
      cause: options?.cause,
      context: options?.context,
    })
    this.name = 'GitError'
  }

  /**
   * 创建 Git 未找到错误
   */
  static notFound(): GitError {
    return new GitError('Git 未安装或不在 PATH 中', ErrorCode.GIT_NOT_FOUND)
  }

  /**
   * 创建非 Git 仓库错误
   */
  static notRepository(cwd: string): GitError {
    return new GitError(
      `当前目录不是 Git 仓库: ${cwd}`,
      ErrorCode.GIT_NOT_REPOSITORY,
      { context: { cwd } }
    )
  }

  /**
   * 创建 Git hooks 错误
   */
  static hooksError(message: string, cause?: Error): GitError {
    return new GitError(message, ErrorCode.GIT_HOOKS_ERROR, { cause })
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查是否为 FormatterError
 */
export function isFormatterError(error: unknown): error is FormatterError {
  return error instanceof FormatterError
}

/**
 * 检查是否为特定错误类型
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return isFormatterError(error) && error.code === code
}

/**
 * 包装错误为 FormatterError
 * @description 将任意错误转换为 FormatterError
 */
export function wrapError(
  error: unknown,
  defaultMessage = '发生未知错误',
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR
): FormatterError {
  if (isFormatterError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new FormatterError(error.message || defaultMessage, code, {
      cause: error,
    })
  }

  return new FormatterError(
    typeof error === 'string' ? error : defaultMessage,
    code
  )
}

/**
 * 断言条件为真
 * @throws {FormatterError} 条件为假时抛出
 */
export function assert(
  condition: unknown,
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR
): asserts condition {
  if (!condition) {
    throw new FormatterError(message, code)
  }
}

/**
 * 断言值已定义
 * @throws {FormatterError} 值为 null 或 undefined 时抛出
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR
): asserts value is T {
  if (value === null || value === undefined) {
    throw new FormatterError(message, code)
  }
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (isFormatterError(error)) {
    return error.getUserMessage()
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * 安全执行异步函数
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await fn()
  } catch {
    return defaultValue
  }
}

/**
 * 安全执行同步函数
 */
export function safeSync<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn()
  } catch {
    return defaultValue
  }
}
