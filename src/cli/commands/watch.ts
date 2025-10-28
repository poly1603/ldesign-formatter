import chokidar from 'chokidar'
import type { WatchOptions } from '../../types/index.js'
import { ConfigLoader } from '../../core/config-loader.js'
import { Formatter } from '../../core/formatter.js'
import { logger } from '../../utils/logger.js'

/**
 * watch 命令
 */
export async function watchCommand(paths: string[], options: WatchOptions): Promise<void> {
  const cwd = process.cwd()
  const { verbose = false, debounce = 300 } = options

  logger.title('Watch Mode')
  logger.info('Starting file watcher...')

  // 加载配置
  const configLoader = new ConfigLoader()
  const config = await configLoader.load(cwd)

  // 创建格式化器
  const formatter = new Formatter(cwd, config)

  // 要监听的路径
  const watchPaths = paths.length > 0 ? paths : ['src/**/*', 'lib/**/*', 'app/**/*']

  // 创建监听器
  const watcher = chokidar.watch(watchPaths, {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.{js,css}',
      ...(config.ignore || []),
    ],
    persistent: true,
    ignoreInitial: true,
  })

  let formatTimeout: NodeJS.Timeout | null = null
  const pendingFiles = new Set<string>()

  // 处理文件变更
  const handleFileChange = (filePath: string) => {
    pendingFiles.add(filePath)

    // 清除之前的定时器
    if (formatTimeout) {
      clearTimeout(formatTimeout)
    }

    // 设置新的定时器（防抖）
    formatTimeout = setTimeout(async () => {
      const files = Array.from(pendingFiles)
      pendingFiles.clear()

      if (verbose) {
        logger.info(`Formatting ${files.length} file(s)...`)
        files.forEach(f => logger.debug(`  ${f}`))
      } else {
        logger.info(`Formatting ${files.length} file(s)...`)
      }

      try {
        await formatter.formatSpecific(files, false)
        logger.success('✓ Files formatted successfully')
      } catch (error) {
        logger.error('✗ Failed to format files', error as Error)
      }

      logger.newLine()
      logger.info('Watching for file changes...')
    }, debounce)
  }

  // 监听事件
  watcher
    .on('add', (path) => {
      if (verbose) {
        logger.debug(`File added: ${path}`)
      }
      handleFileChange(path)
    })
    .on('change', (path) => {
      if (verbose) {
        logger.debug(`File changed: ${path}`)
      }
      handleFileChange(path)
    })
    .on('ready', () => {
      logger.success('✓ Watcher is ready')
      logger.info('Watching for file changes...')
      logger.info('Press Ctrl+C to stop')
    })
    .on('error', (error) => {
      logger.error('Watcher error:', error)
    })

  // 处理退出信号
  const cleanup = () => {
    logger.newLine()
    logger.info('Stopping watcher...')
    watcher.close()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
