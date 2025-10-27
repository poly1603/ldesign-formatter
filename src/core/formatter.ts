import type { FormatterConfig, FormatOptions, FormatResult } from '../types/index.js'
import { PrettierIntegration } from '../integrations/prettier.js'
import { ESLintIntegration } from '../integrations/eslint.js'
import { StylelintIntegration } from '../integrations/stylelint.js'
import { FileCollector } from './file-collector.js'
import { logger } from '../utils/logger.js'
import { getRelativePath } from '../utils/file-utils.js'

/**
 * 格式化引擎
 */
export class Formatter {
  private cwd: string
  private config: FormatterConfig
  private prettier: PrettierIntegration
  private eslint?: ESLintIntegration
  private stylelint?: StylelintIntegration
  private fileCollector: FileCollector

  constructor(cwd: string, config: FormatterConfig) {
    this.cwd = cwd
    this.config = config

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

  /**
   * 格式化文件
   */
  async format(options: FormatOptions = {}): Promise<FormatResult> {
    const { check = false, paths, verbose = false } = options

    if (verbose) {
      logger.debug('Starting format operation')
      logger.debug(`Check mode: ${check}`)
      logger.debug(`Paths: ${paths?.join(', ') || 'all'}`)
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
      }
    }

    logger.info(`Found ${files.length} files to format`)

    // 格式化文件
    const result = await this.formatFiles(files, check)

    // 输出结果
    this.printResult(result, check)

    return result
  }

  /**
   * 格式化指定的文件列表
   */
  async formatSpecific(files: string[], check = false): Promise<FormatResult> {
    logger.info(`Formatting ${files.length} files`)

    const result = await this.formatFiles(files, check)
    this.printResult(result, check)

    return result
  }

  /**
   * 格式化文件列表
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

    // 使用 Prettier 格式化
    logger.startSpinner('Formatting with Prettier...')
    try {
      const prettierResult = await this.prettier.formatFiles(files, check)

      result.formatted += prettierResult.formatted.length
      result.unchanged += prettierResult.unchanged.length
      result.errors += prettierResult.errors.length
      result.formattedFiles?.push(...prettierResult.formatted)

      prettierResult.errors.forEach(({ file, error }) => {
        result.errorDetails?.push({
          file: getRelativePath(this.cwd, file),
          message: 'Prettier error',
          error,
        })
      })

      logger.succeedSpinner(`Prettier: ${prettierResult.formatted.length} formatted`)
    } catch (error) {
      logger.failSpinner('Prettier failed')
      throw error
    }

    // 使用 ESLint（如果启用）
    if (this.eslint) {
      logger.startSpinner('Linting with ESLint...')
      try {
        const eslintResult = await this.eslint.lintFiles(files, !check)

        // ESLint 的修复会覆盖 Prettier 的格式化，所以只计算额外的修复
        const additionalFixed = eslintResult.fixed.filter(
          file => !result.formattedFiles?.includes(file)
        )

        result.formatted += additionalFixed.length
        result.formattedFiles?.push(...additionalFixed)
        result.errors += eslintResult.errors.length

        eslintResult.errors.forEach(({ file, error }) => {
          result.errorDetails?.push({
            file: getRelativePath(this.cwd, file),
            message: 'ESLint error',
            error,
          })
        })

        logger.succeedSpinner(
          `ESLint: ${eslintResult.fixed.length} fixed, ${eslintResult.unchanged.length} unchanged`
        )
      } catch (error) {
        logger.failSpinner('ESLint failed')
        // ESLint 失败不应该阻止整个流程
        logger.error('ESLint encountered an error', error as Error)
      }
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

        stylelintResult.errors.forEach(({ file, error }) => {
          result.errorDetails?.push({
            file: getRelativePath(this.cwd, file),
            message: 'Stylelint error',
            error,
          })
        })

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

