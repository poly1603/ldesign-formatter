import chalk from 'chalk'
import ora, { Ora } from 'ora'

/**
 * 日志工具类
 */
export class Logger {
  private spinner: Ora | null = null
  private verbose: boolean

  constructor(verbose = false) {
    this.verbose = verbose
  }

  /**
   * 成功消息
   */
  success(message: string): void {
    console.log(chalk.green('✓'), message)
  }

  /**
   * 错误消息
   */
  error(message: string, error?: Error): void {
    console.error(chalk.red('✗'), message)
    if (error && this.verbose) {
      console.error(chalk.red(error.stack || error.message))
    }
  }

  /**
   * 警告消息
   */
  warn(message: string): void {
    console.warn(chalk.yellow('⚠'), message)
  }

  /**
   * 信息消息
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message)
  }

  /**
   * 调试消息
   */
  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('›'), message)
    }
  }

  /**
   * 开始加载动画
   */
  startSpinner(message: string): void {
    this.spinner = ora(message).start()
  }

  /**
   * 更新加载动画文本
   */
  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message
    }
  }

  /**
   * 成功停止加载动画
   */
  succeedSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message)
      this.spinner = null
    }
  }

  /**
   * 失败停止加载动画
   */
  failSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message)
      this.spinner = null
    }
  }

  /**
   * 停止加载动画
   */
  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop()
      this.spinner = null
    }
  }

  /**
   * 打印标题
   */
  title(message: string): void {
    console.log()
    console.log(chalk.bold.cyan(message))
    console.log(chalk.cyan('─'.repeat(message.length)))
  }

  /**
   * 打印分隔线
   */
  divider(): void {
    console.log(chalk.gray('─'.repeat(50)))
  }

  /**
   * 换行
   */
  newLine(): void {
    console.log()
  }

  /**
   * 打印表格
   */
  table(data: Record<string, string | number>): void {
    const entries = Object.entries(data)
    const maxKeyLength = Math.max(...entries.map(([k]) => k.length))

    entries.forEach(([key, value]) => {
      const padding = ' '.repeat(maxKeyLength - key.length + 2)
      console.log(`  ${chalk.gray(key)}${padding}${chalk.white(value)}`)
    })
  }
}

// 默认导出单例
export const logger = new Logger()

