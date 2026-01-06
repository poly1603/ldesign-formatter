/**
 * @ldesign/formatter diff 命令
 * @module cli/commands/diff
 * @description 显示格式化前后的差异
 */

import * as diff from 'diff'
import chalk from 'chalk'
import * as prettier from 'prettier'
import type { FormatOptions } from '../../types/index.js'
import { configLoader } from '../../core/config-loader.js'
import { FileCollector } from '../../core/file-collector.js'
import { PrettierIntegration } from '../../integrations/prettier.js'
import { logger } from '../../utils/logger.js'
import { readFile, getRelativePath } from '../../utils/file-utils.js'

/**
 * diff 命令选项
 */
export interface DiffOptions extends FormatOptions {
  /** 是否使用颜色输出 */
  color?: boolean
  /** 上下文行数 */
  context?: number
  /** 是否只显示有差异的文件名 */
  nameOnly?: boolean
  /** 是否显示统计信息 */
  stat?: boolean
}

/**
 * diff 命令
 * @description 显示格式化前后的代码差异
 */
export async function diffCommand(
  paths: string[] = [],
  options: DiffOptions = {}
): Promise<void> {
  const cwd = process.cwd()
  const { color = true, context = 3, nameOnly = false, stat = false } = options

  logger.title('LDesign Formatter - Diff')

  // 加载配置
  let config = await configLoader.load(cwd)

  if (!config) {
    logger.warn('No configuration found, using default base preset')
    config = configLoader.getDefault('base')
  }

  const prettierIntegration = new PrettierIntegration(config.prettier || {})
  const fileCollector = new FileCollector(cwd, config)

  // 收集文件
  const files = await fileCollector.collect(paths.length > 0 ? paths : undefined)

  if (files.length === 0) {
    logger.warn('No files found')
    return
  }

  logger.info(`Checking ${files.length} files for differences...`)
  logger.newLine()

  let filesWithDiff = 0
  let totalAdditions = 0
  let totalDeletions = 0

  for (const file of files) {
    try {
      const original = await readFile(file)

      // 检查是否支持该文件
      if (!prettierIntegration.isSupported(file)) {
        continue
      }

      // 获取格式化后的内容
      const parser = prettierIntegration.getParserByExtension(file)
      if (!parser) continue

      const formatted = await prettier.format(original, {
        ...config.prettier,
        filepath: file,
        parser,
      } as prettier.Options)

      // 如果内容相同，跳过
      if (original === formatted) {
        continue
      }

      filesWithDiff++

      const relativePath = getRelativePath(cwd, file)

      if (nameOnly) {
        // 只显示文件名
        console.log(color ? chalk.cyan(relativePath) : relativePath)
        continue
      }

      // 生成差异
      const changes = diff.structuredPatch(
        relativePath,
        relativePath,
        original,
        formatted,
        'original',
        'formatted',
        { context }
      )

      // 统计变化
      let additions = 0
      let deletions = 0

      for (const hunk of changes.hunks) {
        for (const line of hunk.lines) {
          if (line.startsWith('+')) additions++
          else if (line.startsWith('-')) deletions++
        }
      }

      totalAdditions += additions
      totalDeletions += deletions

      if (stat) {
        // 只显示统计
        const stats = `+${additions} -${deletions}`
        console.log(
          color
            ? `${chalk.cyan(relativePath)} ${chalk.green(`+${additions}`)} ${chalk.red(`-${deletions}`)}`
            : `${relativePath} ${stats}`
        )
        continue
      }

      // 输出差异
      printDiff(changes, color)
      console.log()
    } catch (error) {
      logger.debug(`Failed to diff ${file}:`, error as Error)
    }
  }

  // 输出总结
  logger.newLine()
  if (filesWithDiff === 0) {
    logger.success('All files are properly formatted!')
  } else {
    logger.warn(`${filesWithDiff} file(s) need formatting`)

    if (stat || nameOnly) {
      logger.info(
        color
          ? `Total: ${chalk.green(`+${totalAdditions}`)} ${chalk.red(`-${totalDeletions}`)}`
          : `Total: +${totalAdditions} -${totalDeletions}`
      )
    }

    process.exitCode = 1
  }
}

/**
 * 打印差异
 */
function printDiff(patch: diff.ParsedDiff, useColor: boolean): void {
  // 文件头
  const header = `diff --formatter ${patch.oldFileName}`
  console.log(useColor ? chalk.bold(header) : header)
  console.log(useColor ? chalk.bold(`--- ${patch.oldFileName}`) : `--- ${patch.oldFileName}`)
  console.log(useColor ? chalk.bold(`+++ ${patch.newFileName}`) : `+++ ${patch.newFileName}`)

  // 输出每个 hunk
  for (const hunk of patch.hunks) {
    const hunkHeader = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`
    console.log(useColor ? chalk.cyan(hunkHeader) : hunkHeader)

    for (const line of hunk.lines) {
      if (line.startsWith('+')) {
        console.log(useColor ? chalk.green(line) : line)
      } else if (line.startsWith('-')) {
        console.log(useColor ? chalk.red(line) : line)
      } else {
        console.log(line)
      }
    }
  }
}
