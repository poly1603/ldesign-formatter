import type { PresetConfig } from '../types/index.js'

export const nuxtPreset: PresetConfig = {
  name: 'nuxt',
  prettier: {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 100,
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
  },
  eslint: {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:vue/vue3-recommended',
      '@nuxtjs/eslint-config-typescript',
    ],
    plugins: ['@typescript-eslint', 'vue'],
    parser: 'vue-eslint-parser',
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  stylelint: {
    extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  },
  ignore: [
    'node_modules',
    '.nuxt',
    '.output',
    'dist',
    'build',
    '*.min.js',
    '*.min.css',
  ],
}
