import { createHash } from 'node:crypto'
import path from 'node:path'
import type { CacheEntry, FormatterConfig } from '../types/index.js'
import { readFile, writeFile, exists, ensureDir } from '../utils/file-utils.js'
import { logger } from '../utils/logger.js'

/**
 * 缓存管理器
 */
export class CacheManager {
  private cwd: string
  private cacheDir: string
  private cacheFile: string
  private cache: Map<string, CacheEntry>
  private configHash: string

  constructor(cwd: string, config: FormatterConfig) {
    this.cwd = cwd
    this.cacheDir = path.join(cwd, 'node_modules', '.cache', '@ldesign', 'formatter')
    this.cacheFile = path.join(this.cacheDir, 'cache.json')
    this.cache = new Map()
    this.configHash = this.hashConfig(config)
  }

  /**
   * 初始化缓存
   */
  async init(): Promise<void> {
    try {
      await ensureDir(this.cacheDir)

      if (await exists(this.cacheFile)) {
        const content = await readFile(this.cacheFile)
        const data = JSON.parse(content) as CacheEntry[]
        
        for (const entry of data) {
          this.cache.set(entry.path, entry)
        }

        logger.debug(`Loaded ${this.cache.size} entries from cache`)
      }
    } catch (error) {
      logger.warn('Failed to load cache, starting with empty cache')
      this.cache.clear()
    }
  }

  /**
   * 保存缓存
   */
  async save(): Promise<void> {
    try {
      await ensureDir(this.cacheDir)
      
      const data = Array.from(this.cache.values())
      await writeFile(this.cacheFile, JSON.stringify(data, null, 2))
      
      logger.debug(`Saved ${this.cache.size} entries to cache`)
    } catch (error) {
      logger.warn('Failed to save cache', error as Error)
    }
  }

  /**
   * 检查文件是否需要格式化
   */
  async shouldFormat(filePath: string): Promise<boolean> {
    const entry = this.cache.get(filePath)
    
    if (!entry) {
      return true
    }

    // 配置变更了，需要重新格式化
    if (entry.configHash !== this.configHash) {
      return true
    }

    // 检查文件是否被修改
    try {
      const content = await readFile(filePath)
      const currentHash = this.hashContent(content)
      
      return currentHash !== entry.hash
    } catch {
      // 文件不存在或无法读取
      return true
    }
  }

  /**
   * 更新文件缓存
   */
  async updateFile(filePath: string, content?: string): Promise<void> {
    try {
      const fileContent = content || await readFile(filePath)
      const hash = this.hashContent(fileContent)

      this.cache.set(filePath, {
        path: filePath,
        hash,
        timestamp: Date.now(),
        configHash: this.configHash,
      })
    } catch (error) {
      logger.debug(`Failed to update cache for ${filePath}`, error as Error)
    }
  }

  /**
   * 移除文件缓存
   */
  removeFile(filePath: string): void {
    this.cache.delete(filePath)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; oldestEntry?: number; newestEntry?: number } {
    const entries = Array.from(this.cache.values())
    
    if (entries.length === 0) {
      return { size: 0 }
    }

    const timestamps = entries.map(e => e.timestamp)
    
    return {
      size: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    const toRemove: string[] = []

    for (const [path, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        toRemove.push(path)
      }
    }

    for (const path of toRemove) {
      this.cache.delete(path)
    }

    if (toRemove.length > 0) {
      logger.debug(`Cleaned up ${toRemove.length} expired cache entries`)
    }
  }

  /**
   * 计算内容哈希
   */
  private hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex')
  }

  /**
   * 计算配置哈希
   */
  private hashConfig(config: FormatterConfig): string {
    const configStr = JSON.stringify(config)
    return createHash('md5').update(configStr).digest('hex')
  }
}
