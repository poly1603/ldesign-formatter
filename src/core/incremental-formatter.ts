import type { FormatterConfig, FormatResult } from '../types/index.js'
import { Formatter } from './formatter.js'
import { FileCollector } from './file-collector.js'
import { getStagedFiles, getModifiedFiles, isGitRepository } from '../utils/git-utils.js'
import { logger } from '../utils/logger.js'

/**
 * 增量格式化器
 */
export class IncrementalFormatter {
  private cwd: string
  private formatter: Formatter
  private fileCollector: FileCollector

  constructor(cwd: string, config: FormatterConfig) {
    this.cwd = cwd
    this.formatter = new Formatter(cwd, config)
    this.fileCollector = new FileCollector(cwd, config)
  }

  /**
   * 格式化暂存的文件
   */
  async formatStaged(check = false): Promise<FormatResult> {
    logger.info('Formatting staged files...')

    // 检查是否在 Git 仓库中
    if (!(await isGitRepository(this.cwd))) {
      logger.error('Not in a Git repository')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 1,
        errorDetails: [
          {
            file: this.cwd,
            message: 'Not in a Git repository',
          },
        ],
      }
    }

    // 获取暂存的文件
    const stagedFiles = await getStagedFiles(this.cwd)

    if (stagedFiles.length === 0) {
      logger.info('No staged files found')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 0,
      }
    }

    logger.info(`Found ${stagedFiles.length} staged files`)

    // 过滤可格式化的文件
    const files = await this.fileCollector.collectSpecific(stagedFiles)

    if (files.length === 0) {
      logger.info('No formattable staged files found')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 0,
      }
    }

    // 格式化
    return await this.formatter.formatSpecific(files, check)
  }

  /**
   * 格式化已修改的文件
   */
  async formatModified(check = false): Promise<FormatResult> {
    logger.info('Formatting modified files...')

    // 检查是否在 Git 仓库中
    if (!(await isGitRepository(this.cwd))) {
      logger.error('Not in a Git repository')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 1,
        errorDetails: [
          {
            file: this.cwd,
            message: 'Not in a Git repository',
          },
        ],
      }
    }

    // 获取已修改的文件
    const modifiedFiles = await getModifiedFiles(this.cwd)

    if (modifiedFiles.length === 0) {
      logger.info('No modified files found')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 0,
      }
    }

    logger.info(`Found ${modifiedFiles.length} modified files`)

    // 过滤可格式化的文件
    const files = await this.fileCollector.collectSpecific(modifiedFiles)

    if (files.length === 0) {
      logger.info('No formattable modified files found')
      return {
        total: 0,
        formatted: 0,
        unchanged: 0,
        errors: 0,
      }
    }

    // 格式化
    return await this.formatter.formatSpecific(files, check)
  }

  /**
   * 格式化自动检测的文件
   */
  async formatAuto(check = false): Promise<FormatResult> {
    // 首先尝试格式化暂存的文件
    const isGit = await isGitRepository(this.cwd)

    if (isGit) {
      const stagedFiles = await getStagedFiles(this.cwd)
      if (stagedFiles.length > 0) {
        return await this.formatStaged(check)
      }

      // 如果没有暂存的文件，尝试格式化已修改的文件
      const modifiedFiles = await getModifiedFiles(this.cwd)
      if (modifiedFiles.length > 0) {
        logger.info('No staged files, formatting modified files instead')
        return await this.formatModified(check)
      }
    }

    // 如果没有 Git 仓库或没有变更，格式化所有文件
    logger.info('No Git changes found, formatting all files')
    return await this.formatter.format({ check })
  }
}

