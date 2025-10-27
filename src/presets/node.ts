import type { PresetConfig } from '../types/index.js'
import { basePreset } from './base.js'

/**
 * Node.js 预设配置
 */
export const nodePreset: PresetConfig = {
  name: 'node',
  prettier: basePreset.prettier,
  eslint: {
    extends: ['eslint:recommended'],
    env: {
      node: true,
      es2021: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
      'no-process-exit': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  ignore: [...(basePreset.ignore || []), 'logs', '*.log'],
}

