import path from 'node:path'
import fg from 'fast-glob'
import type { FormatStats } from '../../types/index.js'
import { ConfigLoader } from '../../core/config-loader.js'
import { logger } from '../../utils/logger.js'
import { exists, readFile } from '../../utils/file-utils.js'

/**
 * stats 命令
 */
export async function statsCommand(): Promise<void> {
  const cwd = process.cwd()

  logger.title('Format Statistics')

  // 加载配置
  const configLoader = new ConfigLoader()
  const config = await configLoader.load(cwd)

  // 获取所有文件
  const allFiles = await fg(
    ['**/*'],
    {
      cwd,
      ignore: [
        'node_modules',
        '.git',
        'dist',
        'build',
        ...(config.ignore || []),
      ],
      onlyFiles: true,
    }
  )

  // 统计文件类型
  const fileTypes: Record<string, number> = {}
  for (const file of allFiles) {
    const ext = path.extname(file) || 'no extension'
    fileTypes[ext] = (fileTypes[ext] || 0) + 1
  }

  // 读取历史记录
  const history = await loadHistory(cwd)

  const stats: FormatStats = {
    projectPath: cwd,
    totalFiles: allFiles.length,
    fileTypes,
    history: history.slice(-10), // 最近10次记录
    commonErrors: [], // TODO: 从历史记录中统计
  }

  // 显示统计信息
  displayStats(stats)
}

/**
 * 加载历史记录
 */
async function loadHistory(cwd: string): Promise<Array<{ timestamp: number; formatted: number; errors: number }>> {
  try {
    const historyPath = path.join(cwd, 'node_modules', '.cache', '@ldesign', 'formatter', 'history.json')
    if (await exists(historyPath)) {
      const content = await readFile(historyPath)
      return JSON.parse(content)
    }
  } catch {
    // 忽略错误
  }
  return []
}

/**
 * 显示统计信息
 */
function displayStats(stats: FormatStats): void {
  logger.newLine()
  logger.info(`Project: ${stats.projectPath}`)
  logger.info(`Total files: ${stats.totalFiles}`)
  
  logger.newLine()
  logger.subtitle('File Types Distribution')
  
  // 按数量排序文件类型
  const sortedTypes = Object.entries(stats.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15) // 只显示前15种类型

  for (const [ext, count] of sortedTypes) {
    const percentage = ((count / stats.totalFiles) * 100).toFixed(1)
    const bar = '█'.repeat(Math.floor(Number(percentage) / 2))
    logger.info(`  ${ext.padEnd(15)} ${bar} ${count} (${percentage}%)`)
  }

  if (stats.history.length > 0) {
    logger.newLine()
    logger.subtitle('Recent Format History')
    
    for (const entry of stats.history) {
      const date = new Date(entry.timestamp).toLocaleString()
      logger.info(`  ${date}: ${entry.formatted} formatted, ${entry.errors} errors`)
    }
  } else {
    logger.newLine()
    logger.info('No format history available')
  }

  logger.newLine()
}
