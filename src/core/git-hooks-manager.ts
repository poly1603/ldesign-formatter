import path from 'node:path'
import { execa } from 'execa'
import { exists, writeFile, readFile, writeJSON } from '../utils/file-utils.js'
import { isGitRepository } from '../utils/git-utils.js'
import { logger } from '../utils/logger.js'
import type { GitHooksConfig } from '../types/index.js'

/**
 * Git Hooks 管理器
 */
export class GitHooksManager {
  private cwd: string
  private config: GitHooksConfig

  constructor(cwd: string, config: GitHooksConfig) {
    this.cwd = cwd
    this.config = config
  }

  /**
   * 安装 Git hooks
   */
  async install(): Promise<void> {
    logger.info('Installing Git hooks...')

    // 检查是否在 Git 仓库中
    if (!(await isGitRepository(this.cwd))) {
      logger.error('Not in a Git repository. Cannot install Git hooks.')
      throw new Error('Not in a Git repository')
    }

    // 安装 husky
    await this.installHusky()

    // 配置 lint-staged
    await this.configureLintStaged()

    // 创建 hooks
    if (this.config.preCommit) {
      await this.createPreCommitHook()
    }

    if (this.config.prePush) {
      await this.createPrePushHook()
    }

    logger.success('Git hooks installed successfully!')
  }

  /**
   * 卸载 Git hooks
   */
  async uninstall(): Promise<void> {
    logger.info('Uninstalling Git hooks...')

    try {
      // 删除 husky hooks
      await execa('npx', ['husky', 'uninstall'], { cwd: this.cwd })
      logger.success('Git hooks uninstalled successfully!')
    } catch (error) {
      logger.error('Failed to uninstall Git hooks', error as Error)
      throw error
    }
  }

  /**
   * 安装 husky
   */
  private async installHusky(): Promise<void> {
    try {
      logger.startSpinner('Installing husky...')

      // 初始化 husky
      await execa('npx', ['husky', 'init'], { cwd: this.cwd })

      logger.succeedSpinner('Husky installed')
    } catch (error) {
      logger.failSpinner('Failed to install husky')
      throw error
    }
  }

  /**
   * 配置 lint-staged
   */
  private async configureLintStaged(): Promise<void> {
    const packageJsonPath = path.join(this.cwd, 'package.json')

    // 检查 package.json 是否存在
    if (!(await exists(packageJsonPath))) {
      logger.warn('package.json not found, skipping lint-staged configuration')
      return
    }

    try {
      // 读取 package.json
      const packageJsonContent = await readFile(packageJsonPath)
      const packageJson = JSON.parse(packageJsonContent)

      // 添加 lint-staged 配置
      packageJson['lint-staged'] = {
        '*.{js,jsx,ts,tsx,vue}': ['ldesign-formatter format --staged'],
        '*.{css,scss,less}': ['ldesign-formatter format --staged'],
        '*.{json,md,yaml,yml}': ['ldesign-formatter format --staged'],
      }

      // 写回 package.json
      await writeJSON(packageJsonPath, packageJson, { spaces: 2 })

      logger.success('lint-staged configured in package.json')
    } catch (error) {
      logger.error('Failed to configure lint-staged', error as Error)
      throw error
    }
  }

  /**
   * 创建 pre-commit hook
   */
  private async createPreCommitHook(): Promise<void> {
    const hookPath = path.join(this.cwd, '.husky', 'pre-commit')

    const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`

    try {
      await writeFile(hookPath, hookContent)

      // 在 Unix 系统上设置执行权限
      if (process.platform !== 'win32') {
        await execa('chmod', ['+x', hookPath])
      }

      logger.success('pre-commit hook created')
    } catch (error) {
      logger.error('Failed to create pre-commit hook', error as Error)
      throw error
    }
  }

  /**
   * 创建 pre-push hook
   */
  private async createPrePushHook(): Promise<void> {
    const hookPath = path.join(this.cwd, '.husky', 'pre-push')

    const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run test
`

    try {
      await writeFile(hookPath, hookContent)

      // 在 Unix 系统上设置执行权限
      if (process.platform !== 'win32') {
        await execa('chmod', ['+x', hookPath])
      }

      logger.success('pre-push hook created')
    } catch (error) {
      logger.error('Failed to create pre-push hook', error as Error)
      throw error
    }
  }

  /**
   * 检查 Git hooks 是否已安装
   */
  async isInstalled(): Promise<boolean> {
    const huskyDir = path.join(this.cwd, '.husky')
    return await exists(huskyDir)
  }
}

