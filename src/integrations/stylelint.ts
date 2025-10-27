import stylelint from 'stylelint'
import type { StylelintConfig } from '../types/index.js'
import { readFile, writeFile, getExtension } from '../utils/file-utils.js'
import { logger } from '../utils/logger.js'

/**
 * Stylelint 集成
 */
export class StylelintIntegration {
  private config: StylelintConfig

  constructor(config: StylelintConfig) {
    this.config = config
  }

  /**
   * Lint 并修复样式文件
   */
  async lintFile(filePath: string, fix = true): Promise<boolean> {
    try {
      // 检查文件类型
      if (!this.isStyLintable(filePath)) {
        logger.debug(`Not a style file: ${filePath}`)
        return false
      }

      const content = await readFile(filePath)

      // Lint 文件
      const result = await stylelint.lint({
        code: content,
        codeFilename: filePath,
        config: this.config as any,
        fix,
      })

      // 如果有修复，写入文件
      if (fix && result.output) {
        await writeFile(filePath, result.output)
        return true
      }

      // 检查是否有错误或警告
      const hasIssues = result.results.some(
        r => r.errored || r.warnings.length > 0
      )

      if (hasIssues) {
        logger.debug(`Stylelint found issues in ${filePath}`)
      }

      return false
    } catch (error) {
      logger.error(`Failed to lint with Stylelint: ${filePath}`, error as Error)
      throw error
    }
  }

  /**
   * 检查样式文件（不修复）
   */
  async checkFile(filePath: string): Promise<{
    hasErrors: boolean
    hasWarnings: boolean
    errorCount: number
    warningCount: number
  }> {
    try {
      if (!this.isStyLintable(filePath)) {
        return { hasErrors: false, hasWarnings: false, errorCount: 0, warningCount: 0 }
      }

      const content = await readFile(filePath)

      const result = await stylelint.lint({
        code: content,
        codeFilename: filePath,
        config: this.config as any,
        fix: false,
      })

      const fileResult = result.results[0]
      const errorCount = fileResult.warnings.filter(w => w.severity === 'error').length
      const warningCount = fileResult.warnings.filter(w => w.severity === 'warning').length

      return {
        hasErrors: errorCount > 0,
        hasWarnings: warningCount > 0,
        errorCount,
        warningCount,
      }
    } catch (error) {
      logger.error(`Failed to check with Stylelint: ${filePath}`, error as Error)
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

    // 过滤样式文件
    const styleFiles = files.filter(file => this.isStyLintable(file))

    await Promise.all(
      styleFiles.map(async file => {
        try {
          const hasChanges = await this.lintFile(file, fix)
          if (hasChanges) {
            fixed.push(file)
          } else {
            unchanged.push(file)
          }
        } catch (error) {
          errors.push({ file, error: error as Error })
        }
      })
    )

    return { fixed, unchanged, errors }
  }

  /**
   * 检查文件是否可以被 Stylelint 处理
   */
  private isStyLintable(filePath: string): boolean {
    const ext = getExtension(filePath)
    const styleExtensions = ['.css', '.scss', '.less', '.sass', '.vue']
    return styleExtensions.includes(ext)
  }

  /**
   * 验证配置
   */
  async validateConfig(): Promise<boolean> {
    try {
      // 尝试使用配置 lint 一个简单的 CSS 代码
      await stylelint.lint({
        code: '.test { color: red; }',
        config: this.config as any,
      })
      return true
    } catch (error) {
      logger.error('Invalid Stylelint configuration', error as Error)
      return false
    }
  }
}

