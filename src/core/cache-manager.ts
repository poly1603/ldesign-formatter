import { createHash } from 'node:crypto'
import path from 'node:path'
import type { CacheEntry, FormatterConfig } from '../types/index.js'
import { readFile, writeFile, exists, ensureDir } from '../utils/file-utils.js'
import { logger } from '../utils/logger.js'
import { CacheError } from '../errors.js'

/** 默认缓存最大条目数 */
const DEFAULT_MAX_ENTRIES = 10000

/** 默认缓存过期时间 (30天) */
const DEFAULT_MAX_AGE = 30 * 24 * 60 * 60 * 1000

/** 缓存版本 */
const CACHE_VERSION = 2

/**
 * 缓存管理器
 * @description 提供文件格式化缓存功能，支持 LRU 淘汰和过期清理
 * @example
 * ```typescript
 * const cache = new CacheManager(cwd, config, { maxEntries: 5000 })
 * await cache.init()
 *
 * if (await cache.shouldFormat(filePath)) {
 *   // 执行格式化
 *   await cache.updateFile(filePath)
 * }
 *
 * await cache.save()
 * ```
 */
export class CacheManager {
  /** 工作目录 */
  readonly cwd: string
  /** 缓存目录 */
  private cacheDir: string
  /** 缓存文件路径 */
  private cacheFile: string
  /** 缓存数据 (LRU 顺序，最近使用的在最后) */
  private cache: Map<string, CacheEntry>
  /** 配置哈希 */
  private configHash: string
  /** 最大缓存条目数 */
  private maxEntries: number
  /** 缓存过期时间 (ms) */
  private maxAge: number
  /** 是否已修改 */
  private dirty: boolean

  constructor(
    cwd: string,
    config: FormatterConfig,
    options?: {
      maxEntries?: number
      maxAge?: number
    }
  ) {
    this.cwd = cwd
    this.cacheDir = path.join(cwd, 'node_modules', '.cache', '@ldesign', 'formatter')
    this.cacheFile = path.join(this.cacheDir, 'cache.json')
    this.cache = new Map()
    this.configHash = this.hashConfig(config)
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES
    this.maxAge = options?.maxAge ?? DEFAULT_MAX_AGE
    this.dirty = false
  }

  /**
   * 初始化缓存
   * @description 从缓存文件加载数据，自动进行版本检查和过期清理
   */
  async init(): Promise<void> {
    try {
      await ensureDir(this.cacheDir)

      if (await exists(this.cacheFile)) {
        const content = await readFile(this.cacheFile)
        const data = JSON.parse(content) as {
          version?: number
          entries: CacheEntry[]
        }

        // 检查缓存版本
        const version = data.version ?? 1
        if (version !== CACHE_VERSION) {
          logger.debug(`Cache version mismatch (${version} vs ${CACHE_VERSION}), clearing cache`)
          this.cache.clear()
          this.dirty = true
          return
        }

        // 加载缓存条目
        const entries = Array.isArray(data) ? data : data.entries || []
        for (const entry of entries) {
          if (this.isValidEntry(entry)) {
            this.cache.set(entry.path, entry)
          }
        }

        logger.debug(`Loaded ${this.cache.size} entries from cache`)

        // 自动清理过期缓存
        this.cleanupExpired()
      }
    } catch (error) {
      logger.warn('Failed to load cache, starting with empty cache')
      this.cache.clear()
      this.dirty = true
    }
  }

  /**
   * 保存缓存
   * @param force - 强制保存（即使未修改）
   */
  async save(force = false): Promise<void> {
    if (!force && !this.dirty) {
      logger.debug('Cache unchanged, skipping save')
      return
    }

    try {
      await ensureDir(this.cacheDir)

      // LRU 淘汰
      this.evictIfNeeded()

      const data = {
        version: CACHE_VERSION,
        entries: Array.from(this.cache.values()),
      }

      await writeFile(this.cacheFile, JSON.stringify(data, null, 2))
      this.dirty = false

      logger.debug(`Saved ${this.cache.size} entries to cache`)
    } catch (error) {
      throw CacheError.writeError(error as Error)
    }
  }

  /**
   * 检查文件是否需要格式化
   * @param filePath - 文件路径
   * @returns 是否需要格式化
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

    // 检查缓存是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(filePath)
      this.dirty = true
      return true
    }

    // 检查文件是否被修改
    try {
      const content = await readFile(filePath)
      const currentHash = this.hashContent(content)

      if (currentHash !== entry.hash) {
        return true
      }

      // LRU: 更新访问顺序
      this.touch(filePath)

      return false
    } catch {
      // 文件不存在或无法读取
      this.cache.delete(filePath)
      this.dirty = true
      return true
    }
  }

  /**
   * 更新文件缓存
   * @param filePath - 文件路径
   * @param content - 文件内容（可选，不提供则自动读取）
   */
  async updateFile(filePath: string, content?: string): Promise<void> {
    try {
      const fileContent = content ?? (await readFile(filePath))
      const hash = this.hashContent(fileContent)

      // LRU: 先删除旧条目，再添加新条目（确保在末尾）
      this.cache.delete(filePath)
      this.cache.set(filePath, {
        path: filePath,
        hash,
        timestamp: Date.now(),
        configHash: this.configHash,
      })
      this.dirty = true

      // 检查是否需要淘汰
      this.evictIfNeeded()
    } catch (error) {
      logger.debug(`Failed to update cache for ${filePath}`, error as Error)
    }
  }

  /**
   * 移除文件缓存
   */
  removeFile(filePath: string): void {
    if (this.cache.delete(filePath)) {
      this.dirty = true
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    if (this.cache.size > 0) {
      this.cache.clear()
      this.dirty = true
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number
    maxEntries: number
    oldestEntry?: number
    newestEntry?: number
    hitRate?: number
  } {
    const entries = Array.from(this.cache.values())

    if (entries.length === 0) {
      return { size: 0, maxEntries: this.maxEntries }
    }

    const timestamps = entries.map(e => e.timestamp)

    return {
      size: entries.length,
      maxEntries: this.maxEntries,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    }
  }

  /**
   * 清理过期缓存
   * @param maxAge - 最大缓存时间（ms）
   */
  cleanup(maxAge?: number): number {
    return this.cleanupExpired(maxAge ?? this.maxAge)
  }

  /**
   * 内部清理过期缓存
   */
  private cleanupExpired(maxAge: number = this.maxAge): number {
    const now = Date.now()
    const toRemove: string[] = []

    for (const [filePath, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        toRemove.push(filePath)
      }
    }

    for (const filePath of toRemove) {
      this.cache.delete(filePath)
    }

    if (toRemove.length > 0) {
      this.dirty = true
      logger.debug(`Cleaned up ${toRemove.length} expired cache entries`)
    }

    return toRemove.length
  }

  /**
   * LRU 淘汰
   * @description 当缓存超过最大条目数时，删除最早的条目
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxEntries) {
      return
    }

    const entriesToRemove = this.cache.size - this.maxEntries
    const keys = Array.from(this.cache.keys())

    // Map 保持插入顺序，所以前面的是最早的
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(keys[i])
    }

    this.dirty = true
    logger.debug(`Evicted ${entriesToRemove} cache entries (LRU)`)
  }

  /**
   * 更新缓存条目的访问时间 (LRU)
   */
  private touch(filePath: string): void {
    const entry = this.cache.get(filePath)
    if (entry) {
      // 删除并重新添加到末尾
      this.cache.delete(filePath)
      entry.timestamp = Date.now()
      this.cache.set(filePath, entry)
      this.dirty = true
    }
  }

  /**
   * 检查缓存条目是否有效
   */
  private isValidEntry(entry: unknown): entry is CacheEntry {
    if (!entry || typeof entry !== 'object') {
      return false
    }
    const e = entry as Record<string, unknown>
    return (
      typeof e.path === 'string' &&
      typeof e.hash === 'string' &&
      typeof e.timestamp === 'number'
    )
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
