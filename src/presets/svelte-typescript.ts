import type { PresetConfig } from '../types/index.js'

export const svelteTypescriptPreset: PresetConfig = {
  name: 'svelte-typescript',
  prettier: {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 100,
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    plugins: ['prettier-plugin-svelte'],
    overrides: [
      {
        files: '*.svelte',
        options: {
          parser: 'svelte',
        },
      },
    ],
  },
  eslint: {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:svelte/recommended',
    ],
    plugins: ['@typescript-eslint', 'svelte'],
    parser: '@typescript-eslint/parser',
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      extraFileExtensions: ['.svelte'],
    },
    overrides: [
      {
        files: ['*.svelte'],
        parser: 'svelte-eslint-parser',
        parserOptions: {
          parser: '@typescript-eslint/parser',
        },
      },
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  stylelint: {
    extends: ['stylelint-config-standard'],
    rules: {
      'selector-pseudo-class-no-unknown': [
        true,
        {
          ignorePseudoClasses: ['global'],
        },
      ],
    },
  },
  ignore: [
    'node_modules',
    'dist',
    'build',
    '.svelte-kit',
    'package',
    '*.min.js',
    '*.min.css',
  ],
}
