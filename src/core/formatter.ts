import pLimit from 'p-limit'
import type {
  FormatterConfig,
  FormatOptions,
  FormatResult,
  FormatterEventType,
  FormatterEventHandler,
  FormatterEventDataMap,
  FormatTask,
  TaskQueueStats,
} from '../types/index.js'
import { PrettierIntegration } from '../integrations/prettier.js'
import { ESLintIntegration } from '../integrations/eslint.js'
import { StylelintIntegration } from '../integrations/stylelint.js'
import { FileCollector } from './file-collector.js'
import { logger } from '../utils/logger.js'
import { getRelativePath } from '../utils/file-utils.js'
import {
  IntegrationError,
  wrapError,
  ErrorCode,
} from '../errors.js'

/** 默认并发数 */
const DEFAULT_CONCURRENCY = 4

/** 默认超时时间 (ms) */
const DEFAULT_TIMEOUT = 30000

/** 默认重试次数 */
const DEFAULT_RETRIES = 2

/**
 * 格式化引擎
 * @description 统一的代码格式化工具，集成 Prettier、ESLint 和 Stylelint
 * @example
 * ```typescript
 * const formatter = new Formatter(process.cwd(), config)
 *
 * // 监听事件
 * formatter.on('progress', (data) => {
 *   console.log(`Progress: ${data.completed}/${data.total}`)
 * })
 *
 * // 格式化文件
 * const result = await formatter.format()
 * ```
 */
export class Formatter {
  /** 工作目录 */
  private cwd: string
  /** 配置 */
  private config: FormatterConfig
  /** Prettier 集成 */
  private prettier: PrettierIntegration
  /** ESLint 集成 */
  private eslint?: ESLintIntegration
  /** Stylelint 集成 */
  private stylelint?: StylelintIntegration
  /** 文件收集器 */
  private fileCollector: FileCollector
  /** 并发限制器 */
  private limiter: ReturnType<typeof pLimit>
  /** 事件监听器 */
  private eventListeners: Map<FormatterEventType, Set<FormatterEventHandler<FormatterEventType>>>
  /** 任务队列 */
  private taskQueue: Map<string, FormatTask>
  /** 超时时间 */
  private timeout: number
  /** 重试次数 */
  private retries: number
  /** 是否已中止 */
  private aborted: boolean

  constructor(cwd: string, config: FormatterConfig) {
    this.cwd = cwd
    this.config = config
    this.eventListeners = new Map()
    this.taskQueue = new Map()
    this.aborted = false

    // 并发配置
    const concurrency = config.concurrency ?? DEFAULT_CONCURRENCY
    this.limiter = pLimit(concurrency)
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT
    this.retries = config.retries ?? DEFAULT_RETRIES

    // 初始化集成
    this.prettier = new PrettierIntegration(config.prettier || {})

    if (config.eslint && Object.keys(config.eslint).length > 0) {
      this.eslint = new ESLintIntegration(config.eslint, cwd)
    }

    if (config.stylelint && Object.keys(config.stylelint).length > 0) {
      this.stylelint = new StylelintIntegration(config.stylelint)
    }

    this.fileCollector = new FileCollector(cwd, config)
  }

  // ===========================================================================
  // 事件系统
  // ===========================================================================

  /**
   * 注册事件监听器
   * @param event - 事件类型
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  on<T extends FormatterEventType>(
    event: T,
    handler: FormatterEventHandler<T>
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(handler as FormatterEventHandler<FormatterEventType>)

    return () => this.off(event, handler)
  }

  /**
   * 移除事件监听器
   */
  off<T extends FormatterEventType>(
    event: T,
    handler: FormatterEventHandler<T>
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(handler as FormatterEventHandler<FormatterEventType>)
    }
  }

  /**
   * 触发事件
   */
  private emit<T extends FormatterEventType>(
    event: T,
    data: FormatterEventDataMap[T]
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      for (const handler of listeners) {
        try {
          handler(data)
        } catch (error) {
          logger.debug(`Event handler error for ${event}:`, error as Error)
        }
      }
    }
  }

  // ===========================================================================
  // 任务队列管理
  // ===========================================================================

  /**
   * 获取任务队列统计
   */
  getQueueStats(): TaskQueueStats {
    const tasks = Array.from(this.taskQueue.values())
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      total: tasks.length,
    }
  }

  /**
   * 中止所有任务
   */
  abort(): void {
    this.aborted = true
    this.limiter.clearQueue()
    logger.warn('Format operation aborted')
  }

  /**
   * 重置中止状态
   */
  reset(): void {
    this.aborted = false
    this.taskQueue.clear()
  }

  // ===========================================================================
  // 核心格式化方法
  // ===========================================================================

  /**
   * 格式化文件
   * @param options - 格式化选项
   * @returns 格式化结果
   */
  async format(options: FormatOptions = {}): Promise<FormatResult> {
    const { check = false, paths, verbose = false } = options

    // 重置状态
    this.reset()
    const startTime = Date.now()

    if (verbose) {
      logger.debug('Starting format operation')
      logger.debug(`Check mode: ${check}`)
      logger.debug(`Paths: ${paths?.join(', ') || 'all'}`)
      logger.debug(`Concurrency: ${this.config.concurrency ?? DEFAULT_CONCURRENCY}`)
    }

    // 收集文件
    const files = await this.fileCollector.collect(paths)

    if (files.length === 0) {
      logger.warn('No files found to format')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 0,
        duration: Date.now() - startTime,
      }
    }

    logger.info(`Found ${files.length} files to format`)

    // 触发开始事件
    this.emit('start', {
      total: files.length,
      check,
      files,
    })

    // 格式化文件
    const result = await this.formatFiles(files, check)
    result.duration = Date.now() - startTime

    // 触发完成事件
    this.emit('complete', {
      result,
      duration: result.duration,
    })

    // 输出结果
    this.printResult(result, check)

    return result
  }

  /**
   * 格式化指定的文件列表
   * @param files - 文件路径列表
   * @param check - 是否仅检查
   */
  async formatSpecific(files: string[], check = false): Promise<FormatResult> {
    logger.info(`Formatting ${files.length} files`)

    this.reset()
    const startTime = Date.now()

    this.emit('start', {
      total: files.length,
      check,
      files,
    })

    const result = await this.formatFiles(files, check)
    result.duration = Date.now() - startTime

    this.emit('complete', {
      result,
      duration: result.duration,
    })

    this.printResult(result, check)

    return result
  }

  /**
   * 格式化文件列表（内部实现）
   */
  private async formatFiles(files: string[], check: boolean): Promise<FormatResult> {
    const result: FormatResult = {
      total: files.length,
      formatted: 0,
      unchanged: 0,
      errors: 0,
      errorDetails: [],
      formattedFiles: [],
    }

    let completedCount = 0

    // 初始化任务队列
    for (const file of files) {
      this.taskQueue.set(file, {
        id: file,
        file,
        status: 'pending',
        createdAt: Date.now(),
      })
    }

    // 使用 Prettier 格式化
    logger.startSpinner('Formatting with Prettier...')
    try {
      const prettierResult = await this.formatWithPrettier(files, check, (file, success) => {
        completedCount++
        this.emit('progress', {
          completed: completedCount,
          total: files.length,
          file,
          tool: 'prettier',
          percentage: Math.round((completedCount / files.length) * 100),
        })

        // 更新任务状态
        const task = this.taskQueue.get(file)
        if (task) {
          task.status = success ? 'completed' : 'failed'
          task.completedAt = Date.now()
        }

        // 触发文件事件
        this.emit('file', {
          file,
          action: success ? 'formatted' : 'error',
          tool: 'prettier',
        })
      })

      result.formatted += prettierResult.formatted.length
      result.unchanged += prettierResult.unchanged.length
      result.errors += prettierResult.errors.length
      result.formattedFiles?.push(...prettierResult.formatted)

      for (const { file, error } of prettierResult.errors) {
        result.errorDetails?.push({
          file: getRelativePath(this.cwd, file),
          message: 'Prettier error',
          error,
        })
      }

      logger.succeedSpinner(`Prettier: ${prettierResult.formatted.length} formatted`)
    } catch (error) {
      logger.failSpinner('Prettier failed')
      throw wrapError(error, 'Prettier formatting failed', ErrorCode.PRETTIER_ERROR)
    }

    // 检查是否已中止
    if (this.aborted) {
      logger.warn('Format operation was aborted')
      return result
    }

    // 使用 ESLint（如果启用）
    if (this.eslint) {
      logger.startSpinner('Linting with ESLint...')
      try {
        const eslintResult = await this.eslint.lintFiles(files, !check)

        const additionalFixed = eslintResult.fixed.filter(
          file => !result.formattedFiles?.includes(file)
        )

        result.formatted += additionalFixed.length
        result.formattedFiles?.push(...additionalFixed)
        result.errors += eslintResult.errors.length

        for (const { file, error } of eslintResult.errors) {
          result.errorDetails?.push({
            file: getRelativePath(this.cwd, file),
            message: 'ESLint error',
            error,
          })
        }

        logger.succeedSpinner(
          `ESLint: ${eslintResult.fixed.length} fixed, ${eslintResult.unchanged.length} unchanged`
        )
      } catch (error) {
        logger.failSpinner('ESLint failed')
        logger.error('ESLint encountered an error', error as Error)
      }
    }

    // 检查是否已中止
    if (this.aborted) {
      logger.warn('Format operation was aborted')
      return result
    }

    // 使用 Stylelint（如果启用）
    if (this.stylelint) {
      logger.startSpinner('Linting styles with Stylelint...')
      try {
        const stylelintResult = await this.stylelint.lintFiles(files, !check)

        const additionalFixed = stylelintResult.fixed.filter(
          file => !result.formattedFiles?.includes(file)
        )

        result.formatted += additionalFixed.length
        result.formattedFiles?.push(...additionalFixed)
        result.errors += stylelintResult.errors.length

        for (const { file, error } of stylelintResult.errors) {
          result.errorDetails?.push({
            file: getRelativePath(this.cwd, file),
            message: 'Stylelint error',
            error,
          })
        }

        logger.succeedSpinner(
          `Stylelint: ${stylelintResult.fixed.length} fixed, ${stylelintResult.unchanged.length} unchanged`
        )
      } catch (error) {
        logger.failSpinner('Stylelint failed')
        logger.error('Stylelint encountered an error', error as Error)
      }
    }

    return result
  }

  /**
   * 使用 Prettier 格式化文件（带并发控制和重试）
   */
  private async formatWithPrettier(
    files: string[],
    check: boolean,
    onProgress?: (file: string, success: boolean) => void
  ): Promise<{ formatted: string[]; unchanged: string[]; errors: Array<{ file: string; error: Error }> }> {
    const formatted: string[] = []
    const unchanged: string[] = []
    const errors: Array<{ file: string; error: Error }> = []

    const tasks = files.map(file =>
      this.limiter(async () => {
        if (this.aborted) return

        try {
          const hasChanges = await this.formatFileWithRetry(file, check)
          if (hasChanges) {
            formatted.push(file)
          } else {
            unchanged.push(file)
          }
          onProgress?.(file, true)
        } catch (error) {
          errors.push({ file, error: error as Error })
          onProgress?.(file, false)
        }
      })
    )

    await Promise.all(tasks)

    return { formatted, unchanged, errors }
  }

  /**
   * 格式化单个文件（带超时和重试）
   */
  private async formatFileWithRetry(file: string, check: boolean): Promise<boolean> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await this.formatFileWithTimeout(file, check)
      } catch (error) {
        lastError = error as Error
        if (attempt < this.retries) {
          logger.debug(`Retrying ${file} (attempt ${attempt + 2}/${this.retries + 1})`)
          // 指数退避
          await this.sleep(Math.pow(2, attempt) * 100)
        }
      }
    }

    throw lastError
  }

  /**
   * 格式化单个文件（带超时）
   */
  private async formatFileWithTimeout(file: string, check: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(IntegrationError.timeout('prettier', file, this.timeout))
      }, this.timeout)

      this.prettier
        .formatFile(file, check)
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * 等待指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 打印格式化结果
   */
  private printResult(result: FormatResult, check: boolean): void {
    logger.newLine()
    logger.title('Format Result')

    logger.table({
      'Total files': result.total,
      [check ? 'Files with issues' : 'Files formatted']: result.formatted,
      'Files unchanged': result.unchanged,
      'Files with errors': result.errors,
    })

    if (result.errors > 0 && result.errorDetails) {
      logger.newLine()
      logger.warn('Errors occurred during formatting:')
      result.errorDetails.forEach(({ file, message, error }) => {
        logger.error(`  ${file}: ${message}`)
        if (error) {
          logger.debug(`    ${error.message}`)
        }
      })
    }

    logger.newLine()

    if (check) {
      if (result.formatted > 0) {
        logger.error('Some files need formatting!')
        process.exitCode = 1
      } else {
        logger.success('All files are properly formatted!')
      }
    } else {
      if (result.formatted > 0) {
        logger.success(`Formatted ${result.formatted} files successfully!`)
      } else {
        logger.info('No files needed formatting')
      }
    }
  }
}

