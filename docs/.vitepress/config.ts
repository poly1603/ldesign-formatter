import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/formatter',
  description: '统一的代码格式化工具 - 集成 Prettier、ESLint、Stylelint',
  base: '/formatter/',
  
  head: [
    ['link', { rel: 'icon', href: '/formatter/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/formatter' },
      { text: '预设', link: '/presets/overview' },
      { text: '示例', link: '/examples/basic' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '配置文件', link: '/guide/configuration' },
            { text: '预设配置', link: '/guide/presets' },
            { text: '忽略文件', link: '/guide/ignore-files' },
          ]
        },
        {
          text: 'CLI 命令',
          items: [
            { text: 'init', link: '/guide/cli-init' },
            { text: 'format', link: '/guide/cli-format' },
            { text: 'check', link: '/guide/cli-check' },
            { text: 'watch', link: '/guide/cli-watch' },
            { text: 'stats', link: '/guide/cli-stats' },
            { text: 'ignore', link: '/guide/cli-ignore' },
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '缓存机制', link: '/guide/caching' },
            { text: '冲突检测', link: '/guide/conflict-detection' },
            { text: '项目检测', link: '/guide/project-detection' },
            { text: 'Git Hooks', link: '/guide/git-hooks' },
          ]
        },
        {
          text: '集成',
          items: [
            { text: 'CI/CD', link: '/guide/ci-cd' },
            { text: 'VSCode', link: '/guide/vscode' },
            { text: 'WebStorm', link: '/guide/webstorm' },
          ]
        },
      ],
      
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: 'Formatter', link: '/api/formatter' },
            { text: 'ConfigLoader', link: '/api/config-loader' },
            { text: 'CacheManager', link: '/api/cache-manager' },
            { text: 'ConflictDetector', link: '/api/conflict-detector' },
            { text: 'ProjectDetector', link: '/api/project-detector' },
          ]
        },
        {
          text: '集成 API',
          items: [
            { text: 'PrettierIntegration', link: '/api/prettier-integration' },
            { text: 'ESLintIntegration', link: '/api/eslint-integration' },
            { text: 'StylelintIntegration', link: '/api/stylelint-integration' },
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: 'Types', link: '/api/types' },
          ]
        },
      ],

      '/presets/': [
        {
          text: '预设配置',
          items: [
            { text: '概览', link: '/presets/overview' },
            { text: 'Base', link: '/presets/base' },
            { text: 'Vue', link: '/presets/vue' },
            { text: 'React', link: '/presets/react' },
            { text: 'Angular', link: '/presets/angular' },
            { text: 'Svelte', link: '/presets/svelte' },
            { text: 'Next.js', link: '/presets/next' },
            { text: 'Nuxt', link: '/presets/nuxt' },
            { text: 'Node', link: '/presets/node' },
          ]
        },
        {
          text: '自定义',
          items: [
            { text: '创建预设', link: '/presets/custom' },
          ]
        },
      ],

      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本使用', link: '/examples/basic' },
            { text: '格式化单个文件', link: '/examples/single-file' },
            { text: '格式化目录', link: '/examples/directory' },
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: 'Watch 模式', link: '/examples/watch-mode' },
            { text: '编程式 API', link: '/examples/programmatic' },
            { text: 'Monorepo', link: '/examples/monorepo' },
          ]
        },
        {
          text: '集成示例',
          items: [
            { text: 'GitHub Actions', link: '/examples/github-actions' },
            { text: 'GitLab CI', link: '/examples/gitlab-ci' },
            { text: 'pre-commit', link: '/examples/pre-commit' },
          ]
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/formatter' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/formatter/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  }
})
