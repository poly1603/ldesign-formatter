import type { PresetConfig } from '../types/index.js'

/**
 * 基础预设配置
 */
export const basePreset: PresetConfig = {
  name: 'base',
  prettier: {
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'es5',
    tabWidth: 2,
    useTabs: false,
    printWidth: 80,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    htmlWhitespaceSensitivity: 'css',
    insertPragma: false,
    proseWrap: 'preserve',
    requirePragma: false,
  },
  ignore: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    '*.min.js',
    '*.min.css',
    '.next',
    '.nuxt',
    '.cache',
  ],
}

