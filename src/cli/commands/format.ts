import type { FormatOptions } from '../../types/index.js'
import { configLoader } from '../../core/config-loader.js'
import { Formatter } from '../../core/formatter.js'
import { IncrementalFormatter } from '../../core/incremental-formatter.js'
import { logger } from '../../utils/logger.js'

/**
 * 格式化命令
 */
export async function formatCommand(
  paths: string[] = [],
  options: FormatOptions = {}
): Promise<void> {
  const cwd = process.cwd()

  logger.title('LDesign Formatter')

  // 加载配置
  let config = await configLoader.load(cwd)

  if (!config) {
    logger.warn('No configuration found, using default base preset')
    config = configLoader.getDefault('base')
  }

  logger.debug(`Configuration loaded: preset = ${config.preset || 'none'}`)

  try {
    // 如果指定了 --staged，使用增量格式化
    if (options.staged) {
      const incrementalFormatter = new IncrementalFormatter(cwd, config)
      await incrementalFormatter.formatStaged(options.check)
      return
    }

    // 否则使用常规格式化
    const formatter = new Formatter(cwd, config)
    await formatter.format({
      ...options,
      paths: paths.length > 0 ? paths : undefined,
    })
  } catch (error) {
    logger.error('Format failed', error as Error)
    process.exit(1)
  }
}

