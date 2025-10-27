import type { FormatterConfig } from '../types/index.js'
import { hasPreset } from '../presets/index.js'

/**
 * 配置验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证配置
   */
  validate(config: FormatterConfig): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证预设
    if (config.preset && !hasPreset(config.preset)) {
      errors.push(`Invalid preset: ${config.preset}`)
    }

    // 验证 Prettier 配置
    if (config.prettier) {
      this.validatePrettier(config.prettier, errors, warnings)
    }

    // 验证 ESLint 配置
    if (config.eslint) {
      this.validateESLint(config.eslint, errors, warnings)
    }

    // 验证 Stylelint 配置
    if (config.stylelint) {
      this.validateStylelint(config.stylelint, errors, warnings)
    }

    // 验证 Git hooks 配置
    if (config.gitHooks) {
      this.validateGitHooks(config.gitHooks, errors, warnings)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证 Prettier 配置
   */
  private validatePrettier(
    config: any,
    errors: string[],
    warnings: string[]
  ): void {
    if (config.tabWidth !== undefined) {
      if (typeof config.tabWidth !== 'number' || config.tabWidth < 1) {
        errors.push('prettier.tabWidth must be a positive number')
      }
    }

    if (config.printWidth !== undefined) {
      if (typeof config.printWidth !== 'number' || config.printWidth < 1) {
        errors.push('prettier.printWidth must be a positive number')
      }
    }

    if (config.trailingComma !== undefined) {
      const validValues = ['none', 'es5', 'all']
      if (!validValues.includes(config.trailingComma)) {
        errors.push(
          `prettier.trailingComma must be one of: ${validValues.join(', ')}`
        )
      }
    }

    if (config.endOfLine !== undefined) {
      const validValues = ['lf', 'crlf', 'cr', 'auto']
      if (!validValues.includes(config.endOfLine)) {
        errors.push(
          `prettier.endOfLine must be one of: ${validValues.join(', ')}`
        )
      }
    }

    if (config.arrowParens !== undefined) {
      const validValues = ['always', 'avoid']
      if (!validValues.includes(config.arrowParens)) {
        errors.push(
          `prettier.arrowParens must be one of: ${validValues.join(', ')}`
        )
      }
    }
  }

  /**
   * 验证 ESLint 配置
   */
  private validateESLint(
    config: any,
    errors: string[],
    _warnings: string[]
  ): void {
    if (config.extends !== undefined) {
      if (
        typeof config.extends !== 'string' &&
        !Array.isArray(config.extends)
      ) {
        errors.push('eslint.extends must be a string or array')
      }
    }

    if (config.plugins !== undefined && !Array.isArray(config.plugins)) {
      errors.push('eslint.plugins must be an array')
    }

    if (config.rules !== undefined && typeof config.rules !== 'object') {
      errors.push('eslint.rules must be an object')
    }

    if (config.env !== undefined && typeof config.env !== 'object') {
      errors.push('eslint.env must be an object')
    }
  }

  /**
   * 验证 Stylelint 配置
   */
  private validateStylelint(
    config: any,
    errors: string[],
    _warnings: string[]
  ): void {
    if (config.extends !== undefined) {
      if (
        typeof config.extends !== 'string' &&
        !Array.isArray(config.extends)
      ) {
        errors.push('stylelint.extends must be a string or array')
      }
    }

    if (config.plugins !== undefined && !Array.isArray(config.plugins)) {
      errors.push('stylelint.plugins must be an array')
    }

    if (config.rules !== undefined && typeof config.rules !== 'object') {
      errors.push('stylelint.rules must be an object')
    }
  }

  /**
   * 验证 Git hooks 配置
   */
  private validateGitHooks(
    config: any,
    _errors: string[],
    warnings: string[]
  ): void {
    if (config.preCommit !== undefined && typeof config.preCommit !== 'boolean') {
      warnings.push('gitHooks.preCommit should be a boolean')
    }

    if (config.prePush !== undefined && typeof config.prePush !== 'boolean') {
      warnings.push('gitHooks.prePush should be a boolean')
    }

    if (config.commitMsg !== undefined && typeof config.commitMsg !== 'boolean') {
      warnings.push('gitHooks.commitMsg should be a boolean')
    }
  }
}

// 默认导出单例
export const configValidator = new ConfigValidator()

