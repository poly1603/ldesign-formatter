import path from 'node:path'
import { readFile, writeFile, exists } from '../../utils/file-utils.js'
import { logger } from '../../utils/logger.js'

/**
 * ignore 命令 - add 子命令
 */
export async function ignoreAddCommand(patterns: string[]): Promise<void> {
  const cwd = process.cwd()
  const ignorePath = path.join(cwd, '.formatterignore')

  let currentPatterns: string[] = []

  // 读取现有的忽略规则
  if (await exists(ignorePath)) {
    const content = await readFile(ignorePath)
    currentPatterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  }

  // 添加新规则
  const newPatterns = patterns.filter(p => !currentPatterns.includes(p))
  if (newPatterns.length === 0) {
    logger.warn('All patterns already exist')
    return
  }

  currentPatterns.push(...newPatterns)

  // 写回文件
  const content = [
    '# Formatter ignore patterns',
    ...currentPatterns,
  ].join('\n')

  await writeFile(ignorePath, content)

  logger.success(`Added ${newPatterns.length} pattern(s) to .formatterignore`)
  newPatterns.forEach(p => logger.info(`  + ${p}`))
}

/**
 * ignore 命令 - remove 子命令
 */
export async function ignoreRemoveCommand(patterns: string[]): Promise<void> {
  const cwd = process.cwd()
  const ignorePath = path.join(cwd, '.formatterignore')

  if (!(await exists(ignorePath))) {
    logger.error('.formatterignore file does not exist')
    return
  }

  // 读取现有的忽略规则
  const content = await readFile(ignorePath)
  let currentPatterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

  // 移除指定规则
  const removed: string[] = []
  currentPatterns = currentPatterns.filter(p => {
    if (patterns.includes(p)) {
      removed.push(p)
      return false
    }
    return true
  })

  if (removed.length === 0) {
    logger.warn('No matching patterns found')
    return
  }

  // 写回文件
  const newContent = [
    '# Formatter ignore patterns',
    ...currentPatterns,
  ].join('\n')

  await writeFile(ignorePath, newContent)

  logger.success(`Removed ${removed.length} pattern(s) from .formatterignore`)
  removed.forEach(p => logger.info(`  - ${p}`))
}

/**
 * ignore 命令 - list 子命令
 */
export async function ignoreListCommand(): Promise<void> {
  const cwd = process.cwd()
  const ignorePath = path.join(cwd, '.formatterignore')

  logger.title('Ignore Patterns')

  if (!(await exists(ignorePath))) {
    logger.warn('.formatterignore file does not exist')
    logger.info('No ignore patterns configured')
    return
  }

  // 读取忽略规则
  const content = await readFile(ignorePath)
  const patterns = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

  if (patterns.length === 0) {
    logger.info('No ignore patterns configured')
    return
  }

  logger.info(`Found ${patterns.length} pattern(s):`)
  logger.newLine()
  patterns.forEach(p => logger.info(`  ${p}`))
  logger.newLine()
}
