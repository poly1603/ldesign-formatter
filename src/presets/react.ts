import type { PresetConfig } from '../types/index.js'
import { basePreset } from './base.js'

/**
 * React 预设配置
 */
export const reactPreset: PresetConfig = {
  name: 'react',
  prettier: {
    ...basePreset.prettier,
    jsxSingleQuote: false,
    jsxBracketSameLine: false,
  },
  eslint: {
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime'],
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
  stylelint: {
    extends: ['stylelint-config-standard'],
  },
  ignore: basePreset.ignore,
}

