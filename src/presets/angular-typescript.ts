import type { PresetConfig } from '../types/index.js'

export const angularTypescriptPreset: PresetConfig = {
  name: 'angular-typescript',
  prettier: {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 120,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
  },
  eslint: {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
    ],
    plugins: ['@typescript-eslint', '@angular-eslint'],
    parser: '@typescript-eslint/parser',
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      project: './tsconfig.json',
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  stylelint: {
    extends: ['stylelint-config-standard'],
    rules: {
      'selector-pseudo-element-no-unknown': [
        true,
        {
          ignorePseudoElements: ['ng-deep'],
        },
      ],
    },
  },
  ignore: [
    'node_modules',
    'dist',
    'build',
    '.angular',
    'coverage',
    '*.min.js',
    '*.min.css',
  ],
}
