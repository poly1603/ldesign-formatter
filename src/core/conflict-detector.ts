import type { FormatterConfig, RuleConflict } from '../types/index.js'

/**
 * 规则冲突检测器
 */
export class ConflictDetector {
  private config: FormatterConfig

  constructor(config: FormatterConfig) {
    this.config = config
  }

  /**
   * 检测所有冲突
   */
  detect(): RuleConflict[] {
    const conflicts: RuleConflict[] = []

    // 检测 Prettier 和 ESLint 的冲突
    if (this.config.prettier && this.config.eslint) {
      conflicts.push(...this.detectPrettierESLintConflicts())
    }

    // 检测 Prettier 和 Stylelint 的冲突
    if (this.config.prettier && this.config.stylelint) {
      conflicts.push(...this.detectPrettierStylelintConflicts())
    }

    return conflicts
  }

  /**
   * 检测 Prettier 和 ESLint 的冲突
   */
  private detectPrettierESLintConflicts(): RuleConflict[] {
    const conflicts: RuleConflict[] = []
    const { prettier, eslint } = this.config

    if (!prettier || !eslint?.rules) {
      return conflicts
    }

    // semi 冲突
    if (prettier.semi !== undefined && eslint.rules['semi']) {
      const prettierSemi = prettier.semi
      const eslintSemi = eslint.rules['semi']

      // 检查 ESLint 规则配置
      const eslintSemiValue = Array.isArray(eslintSemi) ? eslintSemi[1] : null

      if (
        (prettierSemi && eslintSemiValue === 'never') ||
        (!prettierSemi && eslintSemiValue === 'always')
      ) {
        conflicts.push({
          rule: 'semi',
          tools: ['Prettier', 'ESLint'],
          description: 'Semicolon usage is configured differently',
          suggestion: 'Use eslint-config-prettier to disable conflicting ESLint rules',
        })
      }
    }

    // quotes 冲突
    if (prettier.singleQuote !== undefined && eslint.rules['quotes']) {
      const prettierQuote = prettier.singleQuote ? 'single' : 'double'
      const eslintQuote = eslint.rules['quotes']
      
      if (Array.isArray(eslintQuote) && eslintQuote[1] !== prettierQuote) {
        conflicts.push({
          rule: 'quotes',
          tools: ['Prettier', 'ESLint'],
          description: 'Quote style is configured differently',
          suggestion: 'Align Prettier and ESLint quote configurations or use eslint-config-prettier',
        })
      }
    }

    // indent 冲突
    if (prettier.tabWidth !== undefined && eslint.rules['indent']) {
      const eslintIndent = eslint.rules['indent']
      
      if (Array.isArray(eslintIndent) && eslintIndent[1] !== prettier.tabWidth) {
        conflicts.push({
          rule: 'indent',
          tools: ['Prettier', 'ESLint'],
          description: 'Indentation size is configured differently',
          suggestion: 'Use eslint-config-prettier to let Prettier handle indentation',
        })
      }
    }

    // max-len 冲突
    if (prettier.printWidth !== undefined && eslint.rules['max-len']) {
      const eslintMaxLen = eslint.rules['max-len']

      if (Array.isArray(eslintMaxLen) && eslintMaxLen[1]) {
        const maxLenConfig = eslintMaxLen[1] as { code?: number }
        if (maxLenConfig.code !== prettier.printWidth) {
          conflicts.push({
            rule: 'max-len',
            tools: ['Prettier', 'ESLint'],
            description: 'Line width is configured differently',
            suggestion: 'Use eslint-config-prettier to disable max-len rule',
          })
        }
      }
    }

    // arrow-parens 冲突
    if (prettier.arrowParens !== undefined && eslint.rules['arrow-parens']) {
      const prettierArrowParens = prettier.arrowParens
      const eslintArrowParens = eslint.rules['arrow-parens']

      // 检查 ESLint 规则配置
      const eslintArrowParensValue = Array.isArray(eslintArrowParens) ? eslintArrowParens[1] : null

      if (
        (prettierArrowParens === 'always' && eslintArrowParensValue === 'as-needed') ||
        (prettierArrowParens === 'avoid' && eslintArrowParensValue === 'always')
      ) {
        conflicts.push({
          rule: 'arrow-parens',
          tools: ['Prettier', 'ESLint'],
          description: 'Arrow function parentheses style is configured differently',
          suggestion: 'Use eslint-config-prettier to disable conflicting ESLint rules',
        })
      }
    }

    // trailing-comma 冲突
    if (prettier.trailingComma !== undefined && eslint.rules['comma-dangle']) {
      conflicts.push({
        rule: 'comma-dangle',
        tools: ['Prettier', 'ESLint'],
        description: 'Trailing comma usage might conflict',
        suggestion: 'Use eslint-config-prettier to disable comma-dangle rule',
      })
    }

    return conflicts
  }

  /**
   * 检测 Prettier 和 Stylelint 的冲突
   */
  private detectPrettierStylelintConflicts(): RuleConflict[] {
    const conflicts: RuleConflict[] = []
    const { prettier, stylelint } = this.config

    if (!prettier || !stylelint?.rules) {
      return conflicts
    }

    // indentation 冲突
    if (prettier.tabWidth !== undefined && stylelint.rules['indentation']) {
      conflicts.push({
        rule: 'indentation',
        tools: ['Prettier', 'Stylelint'],
        description: 'Indentation might be configured differently',
        suggestion: 'Use stylelint-config-prettier to disable conflicting Stylelint rules',
      })
    }

    // string-quotes 冲突
    if (prettier.singleQuote !== undefined && stylelint.rules['string-quotes']) {
      const prettierQuote = prettier.singleQuote ? 'single' : 'double'
      const stylelintQuote = stylelint.rules['string-quotes']

      // 检查 Stylelint 规则配置
      const stylelintQuoteValue = Array.isArray(stylelintQuote) ? stylelintQuote[1] : stylelintQuote

      if (stylelintQuoteValue && typeof stylelintQuoteValue === 'string' && stylelintQuoteValue !== prettierQuote) {
        conflicts.push({
          rule: 'string-quotes',
          tools: ['Prettier', 'Stylelint'],
          description: 'Quote style is configured differently',
          suggestion: 'Align Prettier and Stylelint quote configurations or use stylelint-config-prettier',
        })
      }
    }

    // max-line-length 冲突
    if (prettier.printWidth !== undefined && stylelint.rules['max-line-length']) {
      conflicts.push({
        rule: 'max-line-length',
        tools: ['Prettier', 'Stylelint'],
        description: 'Line width might be configured differently',
        suggestion: 'Use stylelint-config-prettier to disable max-line-length rule',
      })
    }

    return conflicts
  }

  /**
   * 检测是否有冲突
   */
  hasConflicts(): boolean {
    return this.detect().length > 0
  }

  /**
   * 获取严重冲突（高优先级）
   */
  getCriticalConflicts(): RuleConflict[] {
    const criticalRules = ['semi', 'quotes', 'indent', 'indentation']
    const allConflicts = this.detect()
    
    return allConflicts.filter(conflict => 
      criticalRules.includes(conflict.rule)
    )
  }
}

/**
 * 创建冲突检测器实例
 */
export function createConflictDetector(config: FormatterConfig): ConflictDetector {
  return new ConflictDetector(config)
}
