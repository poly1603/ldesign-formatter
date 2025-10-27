import path from 'node:path'
import { collectFiles, createIgnoreFilter, isDirectory, shouldFormat } from '../utils/file-utils.js'
import type { FormatterConfig } from '../types/index.js'
import { logger } from '../utils/logger.js'

/**
 * 文件收集器
 */
export class FileCollector {
  private cwd: string
  private config: FormatterConfig

  constructor(cwd: string, config: FormatterConfig) {
    this.cwd = cwd
    this.config = config
  }

  /**
   * 收集需要格式化的文件
   */
  async collect(paths?: string[]): Promise<string[]> {
    // 如果没有指定路径，使用默认模式
    const targetPaths = paths && paths.length > 0 ? paths : ['.']

    const allFiles: string[] = []

    for (const targetPath of targetPaths) {
      const absolutePath = path.resolve(this.cwd, targetPath)

      // 检查是否为目录
      if (await isDirectory(absolutePath)) {
        // 收集目录下的所有文件
        const files = await this.collectFromDirectory(absolutePath)
        allFiles.push(...files)
      } else {
        // 单个文件
        allFiles.push(absolutePath)
      }
    }

    // 过滤文件
    const filteredFiles = await this.filterFiles(allFiles)

    logger.debug(`Collected ${filteredFiles.length} files`)
    return filteredFiles
  }

  /**
   * 从目录收集文件
   */
  private async collectFromDirectory(dir: string): Promise<string[]> {
    const patterns = [
      '**/*.{js,jsx,ts,tsx,vue,css,scss,less,html,json,md,yaml,yml}',
    ]

    const files = await collectFiles(patterns, {
      cwd: dir,
      ignore: this.config.ignore,
      absolute: true,
    })

    return files
  }

  /**
   * 过滤文件
   */
  private async filterFiles(files: string[]): Promise<string[]> {
    // 创建忽略过滤器
    const ignoreFilter = await createIgnoreFilter(this.cwd, this.config.ignore)

    // 过滤文件
    return files.filter(file => {
      // 检查是否应该被忽略
      if (!ignoreFilter(file)) {
        logger.debug(`Ignored: ${file}`)
        return false
      }

      // 检查是否为可格式化的文件
      if (!shouldFormat(file)) {
        logger.debug(`Not formattable: ${file}`)
        return false
      }

      return true
    })
  }

  /**
   * 收集指定的文件列表
   */
  async collectSpecific(files: string[]): Promise<string[]> {
    const absoluteFiles = files.map(file => path.resolve(this.cwd, file))
    return await this.filterFiles(absoluteFiles)
  }
}

