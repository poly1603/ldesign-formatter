import { ESLint } from 'eslint'
import type { ESLintConfig } from '../types/index.js'
import { logger } from '../utils/logger.js'

/**
 * ESLint 集成
 */
export class ESLintIntegration {
  private eslint: ESLint
  private config: ESLintConfig

  constructor(config: ESLintConfig, cwd: string) {
    this.config = config
    this.eslint = new ESLint({
      cwd,
      fix: true,
      baseConfig: config as any,
      useEslintrc: false, // 不使用项目的 .eslintrc，使用我们提供的配置
    })
  }

  /**
   * 检查并修复文件
   */
  async lintFile(filePath: string, fix = true): Promise<boolean> {
    try {
      // 检查文件是否应该被 ESLint 处理
      const isIgnored = await this.eslint.isPathIgnored(filePath)
      if (isIgnored) {
        logger.debug(`ESLint ignored: ${filePath}`)
        return false
      }

      // Lint 文件
      const results = await this.eslint.lintFiles([filePath])

      // 如果需要修复，应用修复
      if (fix) {
        await ESLint.outputFixes(results)
      }

      // 检查是否有错误
      const hasErrors = results.some(result => result.errorCount > 0)
      const hasWarnings = results.some(result => result.warningCount > 0)

      if (hasErrors || hasWarnings) {
        logger.debug(
          `ESLint found issues in ${filePath}: ${results[0].errorCount} errors, ${results[0].warningCount} warnings`
        )
      }

      // 返回是否有变化（有修复）
      return results.some(result => result.output !== undefined)
    } catch (error) {
      logger.error(`Failed to lint with ESLint: ${filePath}`, error as Error)
      throw error
    }
  }

  /**
   * 检查文件（不修复）
   */
  async checkFile(filePath: string): Promise<{
    hasErrors: boolean
    hasWarnings: boolean
    errorCount: number
    warningCount: number
  }> {
    try {
      const isIgnored = await this.eslint.isPathIgnored(filePath)
      if (isIgnored) {
        return { hasErrors: false, hasWarnings: false, errorCount: 0, warningCount: 0 }
      }

      const results = await this.eslint.lintFiles([filePath])
      const result = results[0]

      return {
        hasErrors: result.errorCount > 0,
        hasWarnings: result.warningCount > 0,
        errorCount: result.errorCount,
        warningCount: result.warningCount,
      }
    } catch (error) {
      logger.error(`Failed to check with ESLint: ${filePath}`, error as Error)
      throw error
    }
  }

  /**
   * 批量 Lint 文件
   */
  async lintFiles(
    files: string[],
    fix = true
  ): Promise<{
    fixed: string[]
    unchanged: string[]
    errors: Array<{ file: string; error: Error }>
  }> {
    const fixed: string[] = []
    const unchanged: string[] = []
    const errors: Array<{ file: string; error: Error }> = []

    // 过滤掉被忽略的文件
    const filesToLint: string[] = []
    for (const file of files) {
      const isIgnored = await this.eslint.isPathIgnored(file)
      if (!isIgnored) {
        filesToLint.push(file)
      }
    }

    try {
      const results = await this.eslint.lintFiles(filesToLint)

      if (fix) {
        await ESLint.outputFixes(results)
      }

      results.forEach(result => {
        if (result.output !== undefined) {
          fixed.push(result.filePath)
        } else {
          unchanged.push(result.filePath)
        }
      })
    } catch (error) {
      errors.push({ file: files.join(', '), error: error as Error })
    }

    return { fixed, unchanged, errors }
  }

  /**
   * 获取格式化后的结果
   */
  async getFormattedText(filePath: string, text: string): Promise<string> {
    try {
      const results = await this.eslint.lintText(text, { filePath })

      if (results.length > 0 && results[0].output) {
        return results[0].output
      }

      return text
    } catch (error) {
      logger.error('Failed to format text with ESLint', error as Error)
      return text
    }
  }
}

