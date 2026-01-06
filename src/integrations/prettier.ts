import * as prettier from 'prettier'
import type { PrettierConfig, ParserType } from '../types/index.js'
import { readFile, writeFile, getExtension, getFileName } from '../utils/file-utils.js'
import { logger } from '../utils/logger.js'
import { IntegrationError } from '../errors.js'

/** 支持的解析器映射 */
const PARSER_MAP: Record<string, ParserType> = {
  // JavaScript/TypeScript
  '.js': 'babel',
  '.mjs': 'babel',
  '.cjs': 'babel',
  '.jsx': 'babel',
  '.ts': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.tsx': 'typescript',

  // Web
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.astro': 'astro',

  // Styles
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',

  // Markup
  '.html': 'html',
  '.htm': 'html',
  '.xml': 'xml',

  // Data
  '.json': 'json',
  '.json5': 'json5',
  '.jsonc': 'json',

  // Documentation
  '.md': 'markdown',
  '.mdx': 'mdx',

  // Config
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',

  // GraphQL
  '.graphql': 'graphql',
  '.gql': 'graphql',
}

/** 根据文件名判断解析器的配置文件 */
const FILENAME_PARSER_MAP: Record<string, ParserType> = {
  '.prettierrc': 'json',
  '.eslintrc': 'json',
  '.babelrc': 'json',
  'tsconfig.json': 'json',
  'package.json': 'json',
  'package-lock.json': 'json',
}

/**
 * Prettier 集成
 * @description 提供与 Prettier 的集成，支持多种文件格式的解析和格式化
 * @example
 * ```typescript
 * const prettier = new PrettierIntegration(config)
 *
 * // 格式化单个文件
 * const hasChanges = await prettier.formatFile('src/index.ts')
 *
 * // 检查文件格式
 * const needsFormat = await prettier.checkFile('src/index.ts')
 * ```
 */
export class PrettierIntegration {
  /** Prettier 配置 */
  private config: PrettierConfig
  /** 缓存的 Prettier 信息 */
  private cachedInfo: Map<string, prettier.FileInfoResult>

  constructor(config: PrettierConfig) {
    this.config = config
    this.cachedInfo = new Map()
  }

  /**
   * 格式化文件
   * @param filePath - 文件路径
   * @param check - 仅检查不修改
   * @returns 是否有变化
   */
  async formatFile(filePath: string, check = false): Promise<boolean> {
    try {
      const content = await readFile(filePath)

      // 获取文件信息（使用缓存）
      const fileInfo = await this.getFileInfo(filePath)

      if (fileInfo.ignored) {
        logger.debug(`Prettier ignored: ${filePath}`)
        return false
      }

      // 确定解析器
      const parser = this.resolveParser(filePath, fileInfo.inferredParser)

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
        await writeFile(filePath, formatted)
      }

      return hasChanges
    } catch (error) {
      const err = error as Error
      if (this.isParseError(err)) {
        throw IntegrationError.prettierParseError(filePath, err)
      }
      throw IntegrationError.prettierError(`Failed to format: ${filePath}`, filePath, err)
    }
  }

  /**
   * 检查文件格式
   */
  async checkFile(filePath: string): Promise<boolean> {
    return this.formatFile(filePath, true)
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
   * 格式化文本内容
   * @param content - 文本内容
   * @param options - 格式化选项
   */
  async formatText(
    content: string,
    options: { parser?: ParserType; filepath?: string } = {}
  ): Promise<string> {
    const parser = options.parser ?? (options.filepath ? this.getParserByExtension(options.filepath) : 'babel')

    if (!parser) {
      return content
    }

    return prettier.format(content, {
      ...this.config,
      ...options,
      parser,
    })
  }

  /**
   * 获取文件支持的解析器
   */
  getParserByExtension(filePath: string): ParserType | null {
    const ext = getExtension(filePath).toLowerCase()
    const fileName = getFileName(filePath)

    // 先检查文件名
    if (FILENAME_PARSER_MAP[fileName]) {
      return FILENAME_PARSER_MAP[fileName]
    }

    return PARSER_MAP[ext] ?? null
  }

  /**
   * 检查文件是否支持格式化
   */
  isSupported(filePath: string): boolean {
    return this.getParserByExtension(filePath) !== null
  }

  /**
   * 获取支持的文件扩展名列表
   */
  getSupportedExtensions(): string[] {
    return Object.keys(PARSER_MAP)
  }

  /**
   * 验证配置
   */
  async validateConfig(): Promise<boolean> {
    try {
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

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cachedInfo.clear()
  }

  // ===========================================================================
  // 私有方法
  // ===========================================================================

  /**
   * 获取文件信息（带缓存）
   */
  private async getFileInfo(filePath: string): Promise<prettier.FileInfoResult> {
    const cached = this.cachedInfo.get(filePath)
    if (cached) {
      return cached
    }

    const info = await prettier.getFileInfo(filePath)
    this.cachedInfo.set(filePath, info)

    return info
  }

  /**
   * 解析解析器
   */
  private resolveParser(filePath: string, inferredParser?: string | null): ParserType | null {
    // 优先使用 Prettier 推断的解析器
    if (inferredParser) {
      return inferredParser as ParserType
    }

    // 回退到我们的映射
    return this.getParserByExtension(filePath)
  }

  /**
   * 检查是否是解析错误
   */
  private isParseError(error: Error): boolean {
    return (
      error.name === 'SyntaxError' ||
      error.message.includes('Parsing error') ||
      error.message.includes('Unexpected token')
    )
  }
}

