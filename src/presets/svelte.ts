import type { PresetConfig } from '../types/index.js'

export const sveltePreset: PresetConfig = {
  name: 'svelte',
  prettier: {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
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
    extends: ['eslint:recommended', 'plugin:svelte/recommended'],
    plugins: ['svelte'],
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
      },
    ],
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
