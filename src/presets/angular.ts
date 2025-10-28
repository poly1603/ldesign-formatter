import type { PresetConfig } from '../types/index.js'

export const angularPreset: PresetConfig = {
  name: 'angular',
  prettier: {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    tabWidth: 2,
    printWidth: 120,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
  },
  eslint: {
    extends: ['eslint:recommended', 'plugin:@angular-eslint/recommended'],
    plugins: ['@angular-eslint'],
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
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
