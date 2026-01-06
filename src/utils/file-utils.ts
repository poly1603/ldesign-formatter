import fs from 'fs-extra'
import path from 'node:path'
import fg from 'fast-glob'
import ignore from 'ignore'

/**
 * 读取文件内容
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8')
}

/**
 * 写入文件内容
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * 检查文件是否存在
 */
export async function exists(filePath: string): Promise<boolean> {
  return await fs.pathExists(filePath)
}

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest))
  await fs.copy(src, dest)
}

/**
 * 删除文件或目录
 */
export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath)
}

/**
 * 获取文件的相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to)
}

/**
 * 规范化路径（转换为 Unix 风格）
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

/**
 * 收集匹配的文件
 */
export async function collectFiles(
  patterns: string[],
  options?: {
    cwd?: string
    ignore?: string[]
    absolute?: boolean
  }
): Promise<string[]> {
  const cwd = options?.cwd || process.cwd()
  const ignorePatterns = options?.ignore || []

  // 使用 fast-glob 查找文件
  const files = await fg(patterns, {
    cwd,
    dot: false,
    absolute: options?.absolute ?? true,
    ignore: ignorePatterns,
  })

  return files
}

/**
 * 创建忽略过滤器
 */
export async function createIgnoreFilter(
  cwd: string,
  additionalPatterns: string[] = []
): Promise<(file: string) => boolean> {
  const ig = ignore()

  // 读取 .gitignore
  const gitignorePath = path.join(cwd, '.gitignore')
  if (await exists(gitignorePath)) {
    const gitignoreContent = await readFile(gitignorePath)
    ig.add(gitignoreContent)
  }

  // 读取 .prettierignore
  const prettierignorePath = path.join(cwd, '.prettierignore')
  if (await exists(prettierignorePath)) {
    const prettierignoreContent = await readFile(prettierignorePath)
    ig.add(prettierignoreContent)
  }

  // 添加额外的忽略模式
  if (additionalPatterns.length > 0) {
    ig.add(additionalPatterns)
  }

  // 默认忽略
  ig.add([
    'node_modules',
    'dist',
    'build',
    '.git',
    '*.min.js',
    '*.min.css',
    'coverage',
  ])

  return (file: string) => {
    const relativePath = normalizePath(getRelativePath(cwd, file))
    return !ig.ignores(relativePath)
  }
}

/**
 * 读取 JSON 文件
 */
export async function readJSON<T = any>(filePath: string): Promise<T> {
  return await fs.readJSON(filePath)
}

/**
 * 写入 JSON 文件
 */
export async function writeJSON(
  filePath: string,
  data: any,
  options?: { spaces?: number }
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeJSON(filePath, data, { spaces: options?.spaces ?? 2 })
}

/**
 * 检查路径是否为目录
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

/**
 * 获取文件扩展名
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase()
}

/**
 * 获取文件名
 */
export function getFileName(filePath: string): string {
  return path.basename(filePath)
}

/**
 * 获取文件名（不含扩展名）
 */
export function getFileNameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.extname(filePath))
}

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

/**
 * 判断文件是否需要格式化
 */
export function shouldFormat(filePath: string): boolean {
  const ext = getExtension(filePath)
  const formattableExtensions = [
    '.js',
    '.mjs',
    '.cjs',
    '.jsx',
    '.ts',
    '.mts',
    '.cts',
    '.tsx',
    '.vue',
    '.svelte',
    '.astro',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.html',
    '.htm',
    '.json',
    '.jsonc',
    '.md',
    '.mdx',
    '.yaml',
    '.yml',
    '.graphql',
    '.gql',
  ]
  return formattableExtensions.includes(ext)
}

