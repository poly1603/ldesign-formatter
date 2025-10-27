import type { PresetConfig } from '../types/index.js'
import { vuePreset } from './vue.js'

/**
 * Vue + TypeScript 预设配置（基于项目现有配置）
 */
export const vueTypescriptPreset: PresetConfig = {
  name: 'vue-typescript',
  prettier: {
    ...vuePreset.prettier,
    semi: false,
    singleQuote: true,
    printWidth: 80,
    trailingComma: 'es5',
    arrowParens: 'avoid',
    jsxSingleQuote: true,
  },
  eslint: {
    extends: ['@antfu/eslint-config'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', {
        allow: ['warn', 'error', 'info', 'group', 'groupEnd', 'time', 'timeEnd', 'table', 'debug']
      }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-debugger': 'error',
    },
  },
  stylelint: vuePreset.stylelint,
  ignore: vuePreset.ignore,
}

