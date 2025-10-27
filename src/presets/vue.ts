import type { PresetConfig } from '../types/index.js'
import { basePreset } from './base.js'

/**
 * Vue 预设配置
 */
export const vuePreset: PresetConfig = {
  name: 'vue',
  prettier: {
    ...basePreset.prettier,
    vueIndentScriptAndStyle: false,
    overrides: [
      {
        files: '*.vue',
        options: {
          parser: 'vue',
        },
      },
    ],
  },
  eslint: {
    extends: ['plugin:vue/vue3-recommended', 'eslint:recommended'],
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
    },
  },
  stylelint: {
    extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
    rules: {
      'selector-pseudo-class-no-unknown': [
        true,
        {
          ignorePseudoClasses: ['deep', 'global'],
        },
      ],
      'selector-pseudo-element-no-unknown': [
        true,
        {
          ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'],
        },
      ],
    },
  },
  ignore: [...(basePreset.ignore || []), '*.config.js', '*.config.ts'],
}

