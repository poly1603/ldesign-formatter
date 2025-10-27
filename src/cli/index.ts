#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { formatCommand } from './commands/format.js'
import { checkCommand } from './commands/check.js'
import { logger } from '../utils/logger.js'

// 创建 CLI 程序
const program = new Command()

program
  .name('ldesign-formatter')
  .description('统一的代码格式化工具 - 集成 Prettier、ESLint、Stylelint')
  .version('1.0.0')

// init 命令
program
  .command('init')
  .description('初始化格式化配置')
  .option('-p, --preset <preset>', '预设配置 (base, vue, vue-typescript, react, react-typescript, node)')
  .option('--no-git-hooks', '不启用 Git hooks')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('--skip-prompts', '跳过交互式提示')
  .action(async (options) => {
    try {
      await initCommand(options)
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// format 命令
program
  .command('format [paths...]')
  .description('格式化代码文件')
  .option('-c, --check', '只检查不修改')
  .option('-s, --staged', '只格式化暂存的文件')
  .option('-v, --verbose', '显示详细信息')
  .option('--no-cache', '不使用缓存')
  .action(async (paths, options) => {
    try {
      await formatCommand(paths, options)
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// check 命令
program
  .command('check [paths...]')
  .description('检查代码格式（不修改文件）')
  .option('-v, --verbose', '显示详细信息')
  .action(async (paths, options) => {
    try {
      await checkCommand(paths, options)
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// 解析命令行参数
program.parse()

