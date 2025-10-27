import type { FormatOptions } from '../../types/index.js'
import { formatCommand } from './format.js'

/**
 * 检查命令（格式化检查模式）
 */
export async function checkCommand(
  paths: string[] = [],
  options: FormatOptions = {}
): Promise<void> {
  // 调用格式化命令，但设置为检查模式
  await formatCommand(paths, {
    ...options,
    check: true,
  })
}

