#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { formatCommand } from './commands/format.js'
import { checkCommand } from './commands/check.js'
import { watchCommand } from './commands/watch.js'
import { statsCommand } from './commands/stats.js'
import { diffCommand } from './commands/diff.js'
import { ignoreAddCommand, ignoreRemoveCommand, ignoreListCommand } from './commands/ignore.js'
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

// watch 命令
program
  .command('watch [paths...]')
  .description('监听文件变化并自动格式化')
  .option('-v, --verbose', '显示详细信息')
  .option('-d, --debounce <ms>', '防抖延迟（毫秒）', '300')
  .action(async (paths, options) => {
    try {
      await watchCommand(paths, { ...options, debounce: parseInt(options.debounce) })
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// stats 命令
program
  .command('stats')
  .description('显示格式化统计信息')
  .action(async () => {
    try {
      await statsCommand()
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// diff 命令
program
  .command('diff [paths...]')
  .description('显示格式化前后的差异')
  .option('--no-color', '禁用颜色输出')
  .option('-C, --context <lines>', '上下文行数', '3')
  .option('--name-only', '只显示有差异的文件名')
  .option('--stat', '显示统计信息')
  .action(async (paths, options) => {
    try {
      await diffCommand(paths, {
        color: options.color,
        context: parseInt(options.context),
        nameOnly: options.nameOnly,
        stat: options.stat,
      })
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// ignore 命令
const ignoreCommand = program.command('ignore').description('管理忽略规则')

ignoreCommand
  .command('add <patterns...>')
  .description('添加忽略规则')
  .action(async (patterns) => {
    try {
      await ignoreAddCommand(patterns)
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

ignoreCommand
  .command('remove <patterns...>')
  .description('移除忽略规则')
  .action(async (patterns) => {
    try {
      await ignoreRemoveCommand(patterns)
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

ignoreCommand
  .command('list')
  .description('列出所有忽略规则')
  .action(async () => {
    try {
      await ignoreListCommand()
    } catch (error) {
      logger.error('Command failed', error as Error)
      process.exit(1)
    }
  })

// 解析命令行参数
program.parse()

