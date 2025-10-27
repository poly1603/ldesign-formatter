import { cosmiconfig } from 'cosmiconfig'
import type { FormatterConfig, PresetName } from '../types/index.js'
import { getPreset, hasPreset } from '../presets/index.js'
import { logger } from '../utils/logger.js'

/**
 * 配置加载器
 */
export class ConfigLoader {
  private explorer = cosmiconfig('formatter')

  /**
   * 加载配置文件
   */
  async load(cwd: string): Promise<FormatterConfig | null> {
    try {
      const result = await this.explorer.search(cwd)

      if (!result || result.isEmpty) {
        logger.debug('No configuration file found')
        return null
      }

      logger.debug(`Loaded configuration from: ${result.filepath}`)
      return this.normalize(result.config)
    } catch (error) {
      logger.error('Failed to load configuration', error as Error)
      return null
    }
  }

  /**
   * 规范化配置
   */
  private normalize(config: any): FormatterConfig {
    const normalized: FormatterConfig = {
      preset: config.preset,
      prettier: config.prettier || {},
      eslint: config.eslint || {},
      stylelint: config.stylelint || {},
      ignore: config.ignore || [],
      gitHooks: config.gitHooks || {},
      ci: config.ci ?? false,
    }

    // 如果指定了预设，合并预设配置
    if (normalized.preset && hasPreset(normalized.preset)) {
      const preset = getPreset(normalized.preset as PresetName)

      normalized.prettier = {
        ...preset.prettier,
        ...normalized.prettier,
      }

      if (preset.eslint) {
        normalized.eslint = {
          ...preset.eslint,
          ...normalized.eslint,
        }
      }

      if (preset.stylelint) {
        normalized.stylelint = {
          ...preset.stylelint,
          ...normalized.stylelint,
        }
      }

      if (preset.ignore) {
        normalized.ignore = [
          ...preset.ignore,
          ...(normalized.ignore || []),
        ]
      }
    }

    return normalized
  }

  /**
   * 获取默认配置
   */
  getDefault(preset: PresetName = 'base'): FormatterConfig {
    const presetConfig = getPreset(preset)

    return {
      preset,
      prettier: presetConfig.prettier,
      eslint: presetConfig.eslint || {},
      stylelint: presetConfig.stylelint || {},
      ignore: presetConfig.ignore || [],
      gitHooks: {
        preCommit: true,
        prePush: false,
      },
      ci: false,
    }
  }

  /**
   * 合并配置
   */
  merge(base: FormatterConfig, override: Partial<FormatterConfig>): FormatterConfig {
    return {
      preset: override.preset ?? base.preset,
      prettier: {
        ...base.prettier,
        ...override.prettier,
      },
      eslint: {
        ...base.eslint,
        ...override.eslint,
      },
      stylelint: {
        ...base.stylelint,
        ...override.stylelint,
      },
      ignore: [
        ...(base.ignore || []),
        ...(override.ignore || []),
      ],
      gitHooks: {
        ...base.gitHooks,
        ...override.gitHooks,
      },
      ci: override.ci ?? base.ci,
    }
  }
}

// 默认导出单例
export const configLoader = new ConfigLoader()

