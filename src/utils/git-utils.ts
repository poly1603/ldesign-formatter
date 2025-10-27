import { execa } from 'execa'
import path from 'node:path'
import { exists } from './file-utils.js'

/**
 * 检查是否在 Git 仓库中
 */
export async function isGitRepository(cwd: string): Promise<boolean> {
  const gitDir = path.join(cwd, '.git')
  return await exists(gitDir)
}

/**
 * 获取 Git 暂存区的文件列表
 */
export async function getStagedFiles(cwd: string): Promise<string[]> {
  try {
    const { stdout } = await execa('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
      cwd,
    })

    if (!stdout) {
      return []
    }

    return stdout
      .split('\n')
      .map(file => path.resolve(cwd, file.trim()))
      .filter(file => file.length > 0)
  } catch {
    return []
  }
}

/**
 * 获取所有已修改的文件（包括暂存和未暂存）
 */
export async function getModifiedFiles(cwd: string): Promise<string[]> {
  try {
    const { stdout } = await execa('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], {
      cwd,
    })

    if (!stdout) {
      return []
    }

    return stdout
      .split('\n')
      .map(file => path.resolve(cwd, file.trim()))
      .filter(file => file.length > 0)
  } catch {
    return []
  }
}

/**
 * 获取与特定分支的差异文件
 */
export async function getDiffFiles(cwd: string, base = 'main'): Promise<string[]> {
  try {
    const { stdout } = await execa('git', ['diff', '--name-only', '--diff-filter=ACMR', base], {
      cwd,
    })

    if (!stdout) {
      return []
    }

    return stdout
      .split('\n')
      .map(file => path.resolve(cwd, file.trim()))
      .filter(file => file.length > 0)
  } catch {
    return []
  }
}

/**
 * 暂存文件
 */
export async function stageFiles(cwd: string, files: string[]): Promise<void> {
  if (files.length === 0) return

  const relativeFiles = files.map(file => path.relative(cwd, file))
  await execa('git', ['add', ...relativeFiles], { cwd })
}

/**
 * 获取 Git 根目录
 */
export async function getGitRoot(cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--show-toplevel'], { cwd })
    return stdout.trim()
  } catch {
    return null
  }
}

/**
 * 检查文件是否在 Git 仓库中被跟踪
 */
export async function isTracked(cwd: string, file: string): Promise<boolean> {
  try {
    const relativePath = path.relative(cwd, file)
    await execa('git', ['ls-files', '--error-unmatch', relativePath], { cwd })
    return true
  } catch {
    return false
  }
}

/**
 * 获取当前分支名
 */
export async function getCurrentBranch(cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd })
    return stdout.trim()
  } catch {
    return null
  }
}

/**
 * 检查工作区是否干净
 */
export async function isWorkingTreeClean(cwd: string): Promise<boolean> {
  try {
    const { stdout } = await execa('git', ['status', '--porcelain'], { cwd })
    return stdout.trim().length === 0
  } catch {
    return false
  }
}

