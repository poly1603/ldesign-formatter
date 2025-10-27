import * as prettier from 'prettier'
import type { PrettierConfig } from '../types/index.js'
import { readFile, writeFile, getExtension } from '../utils/file-utils.js'
import { logger } from '../utils/logger.js'

/**
 * Prettier 集成
 */
export class PrettierIntegration {
  private config: PrettierConfig

  constructor(config: PrettierConfig) {
    this.config = config
  }

  /**
   * 格式化文件
   */
  async formatFile(filePath: string, check = false): Promise<boolean> {
    try {
      const content = await readFile(filePath)

      // 获取文件的 Prettier 配置（支持 .prettierrc 等）
      const fileInfo = await prettier.getFileInfo(filePath)

      if (fileInfo.ignored) {
        logger.debug(`Prettier ignored: ${filePath}`)
        return false
      }

      // 解析文件以确定解析器
      const parser = this.getParser(filePath)

      if (!parser) {
        logger.debug(`No parser found for: ${filePath}`)
        return false
      }

      // 格式化
      const formatted = await prettier.format(content, {
        ...this.config,
        filepath: filePath,
        parser,
      })

      // 检查是否有变化
      const hasChanges = formatted !== content

      if (!check && hasChanges) {
        // 写入格式化后的内容
        await writeFile(filePath, formatted)
      }

      return hasChanges
    } catch (error) {
      logger.error(`Failed to format with Prettier: ${filePath}`, error as Error)
      throw error
    }
  }

  /**
   * 检查文件格式
   */
  async checkFile(filePath: string): Promise<boolean> {
    return await this.formatFile(filePath, true)
  }

  /**
   * 批量格式化文件
   */
  async formatFiles(
    files: string[],
    check = false
  ): Promise<{ formatted: string[]; unchanged: string[]; errors: Array<{ file: string; error: Error }> }> {
    const formatted: string[] = []
    const unchanged: string[] = []
    const errors: Array<{ file: string; error: Error }> = []

    await Promise.all(
      files.map(async file => {
        try {
          const hasChanges = await this.formatFile(file, check)
          if (hasChanges) {
            formatted.push(file)
          } else {
            unchanged.push(file)
          }
        } catch (error) {
          errors.push({ file, error: error as Error })
        }
      })
    )

    return { formatted, unchanged, errors }
  }

  /**
   * 获取适合文件的解析器
   */
  private getParser(filePath: string): string | null {
    const ext = getExtension(filePath)

    const parserMap: Record<string, string> = {
      '.js': 'babel',
      '.jsx': 'babel',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.vue': 'vue',
      '.css': 'css',
      '.scss': 'scss',
      '.less': 'less',
      '.html': 'html',
      '.json': 'json',
      '.md': 'markdown',
      '.yaml': 'yaml',
      '.yml': 'yaml',
    }

    return parserMap[ext] || null
  }

  /**
   * 验证配置
   */
  async validateConfig(): Promise<boolean> {
    try {
      // 尝试使用配置格式化一个简单的 JavaScript 代码
      await prettier.format('const x = 1;', {
        ...this.config,
        parser: 'babel',
      })
      return true
    } catch (error) {
      logger.error('Invalid Prettier configuration', error as Error)
      return false
    }
  }
}

