import type { PresetConfig } from '../types/index.js'
import { reactPreset } from './react.js'

/**
 * React + TypeScript 预设配置
 */
export const reactTypescriptPreset: PresetConfig = {
  name: 'react-typescript',
  prettier: reactPreset.prettier,
  eslint: {
    ...reactPreset.eslint,
    parser: '@typescript-eslint/parser',
    plugins: [...(reactPreset.eslint?.plugins || []), '@typescript-eslint'],
    extends: [
      ...(Array.isArray(reactPreset.eslint?.extends) ? reactPreset.eslint.extends : [reactPreset.eslint?.extends || '']),
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
    ].filter(Boolean),
    rules: {
      ...reactPreset.eslint?.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  stylelint: reactPreset.stylelint,
  ignore: reactPreset.ignore,
}

