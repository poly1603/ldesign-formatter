import inquirer from 'inquirer'
import path from 'node:path'
import ejs from 'ejs'
import { fileURLToPath } from 'node:url'
import type { InitOptions, PresetName } from '../../types/index.js'
import { getPresetNames, getPreset } from '../../presets/index.js'
import { configLoader } from '../../core/config-loader.js'
import { GitHooksManager } from '../../core/git-hooks-manager.js'
import { logger } from '../../utils/logger.js'
import { writeFile, exists, readFile, writeJSON } from '../../utils/file-utils.js'

// 获取当前模块目录
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesDir = path.resolve(__dirname, '../../../templates')

/**
 * 初始化命令
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  const cwd = process.cwd()

  logger.title('LDesign Formatter - Initialization')

  let preset: PresetName
  let enableGitHooks: boolean

  // 如果没有跳过提示，进行交互式配置
  if (!options.skipPrompts) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Select a preset configuration:',
        choices: getPresetNames().map(name => ({
          name: `${name} - ${getPresetDescription(name)}`,
          value: name,
        })),
        default: options.preset || 'vue-typescript',
      },
      {
        type: 'confirm',
        name: 'gitHooks',
        message: 'Enable Git hooks (pre-commit)?',
        default: options.gitHooks ?? true,
      },
    ])

    preset = answers.preset
    enableGitHooks = answers.gitHooks
  } else {
    preset = options.preset || 'base'
    enableGitHooks = options.gitHooks ?? true
  }

  logger.info(`Using preset: ${preset}`)

  // 获取预设配置
  const presetConfig = getPreset(preset)
  const config = configLoader.getDefault(preset)
  config.gitHooks = {
    preCommit: enableGitHooks,
    prePush: false,
  }

  // 检查配置文件是否已存在
  const configPath = path.join(cwd, 'formatter.config.js')
  if ((await exists(configPath)) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'formatter.config.js already exists. Overwrite?',
        default: false,
      },
    ])

    if (!overwrite) {
      logger.warn('Initialization cancelled')
      return
    }
  }

  // 生成配置文件
  logger.startSpinner('Generating configuration files...')

  try {
    // 生成 formatter.config.js
    await generateConfigFile(cwd, config)

    // 生成 .prettierrc
    await generatePrettierConfig(cwd, presetConfig.prettier, options.force)

    // 生成 .editorconfig
    await generateEditorConfig(cwd, presetConfig.prettier, options.force)

    // 生成 ESLint 配置（如果预设有）
    if (presetConfig.eslint) {
      await generateESLintConfig(cwd, presetConfig.eslint, options.force)
    }

    // 生成 Stylelint 配置（如果预设有）
    if (presetConfig.stylelint) {
      await generateStylelintConfig(cwd, presetConfig.stylelint, options.force)
    }

    logger.succeedSpinner('Configuration files generated')

    // 更新 package.json
    await updatePackageJson(cwd)

    // 安装 Git hooks
    if (enableGitHooks) {
      const hooksManager = new GitHooksManager(cwd, config.gitHooks || {})
      await hooksManager.install()
    }

    logger.newLine()
    logger.success('Initialization complete!')
    logger.newLine()
    logger.info('Next steps:')
    logger.info('  1. Run "npm install" or "pnpm install" to install dependencies')
    logger.info('  2. Run "ldesign-formatter format" to format your code')
    logger.info('  3. Run "ldesign-formatter check" to check code formatting')
  } catch (error) {
    logger.failSpinner('Failed to generate configuration files')
    logger.error('Initialization failed', error as Error)
    throw error
  }
}

/**
 * 生成配置文件
 */
async function generateConfigFile(cwd: string, config: any): Promise<void> {
  const templatePath = path.join(templatesDir, 'formatter.config.ejs')
  const template = await readFile(templatePath)
  const content = ejs.render(template, config)

  const outputPath = path.join(cwd, 'formatter.config.js')
  await writeFile(outputPath, content)
  logger.debug(`Generated: formatter.config.js`)
}

/**
 * 生成 Prettier 配置
 */
async function generatePrettierConfig(
  cwd: string,
  config: any,
  force = false
): Promise<void> {
  const outputPath = path.join(cwd, '.prettierrc')

  if ((await exists(outputPath)) && !force) {
    logger.debug('.prettierrc already exists, skipping')
    return
  }

  const templatePath = path.join(templatesDir, '.prettierrc.ejs')
  const template = await readFile(templatePath)
  const content = ejs.render(template, {
    ...config,
    jsxSingleQuote: config.jsxSingleQuote ?? false,
  })

  await writeFile(outputPath, content)
  logger.debug('Generated: .prettierrc')
}

/**
 * 生成 EditorConfig
 */
async function generateEditorConfig(
  cwd: string,
  config: any,
  force = false
): Promise<void> {
  const outputPath = path.join(cwd, '.editorconfig')

  if ((await exists(outputPath)) && !force) {
    logger.debug('.editorconfig already exists, skipping')
    return
  }

  const templatePath = path.join(templatesDir, '.editorconfig.ejs')
  const template = await readFile(templatePath)
  const content = ejs.render(template, {
    endOfLine: config.endOfLine || 'lf',
    useTabs: config.useTabs || false,
    tabWidth: config.tabWidth || 2,
  })

  await writeFile(outputPath, content)
  logger.debug('Generated: .editorconfig')
}

/**
 * 生成 ESLint 配置
 */
async function generateESLintConfig(
  cwd: string,
  config: any,
  force = false
): Promise<void> {
  const outputPath = path.join(cwd, '.eslintrc.js')

  if ((await exists(outputPath)) && !force) {
    logger.debug('.eslintrc.js already exists, skipping')
    return
  }

  const templatePath = path.join(templatesDir, '.eslintrc.ejs')
  const template = await readFile(templatePath)
  const content = ejs.render(template, config)

  await writeFile(outputPath, content)
  logger.debug('Generated: .eslintrc.js')
}

/**
 * 生成 Stylelint 配置
 */
async function generateStylelintConfig(
  cwd: string,
  config: any,
  force = false
): Promise<void> {
  const outputPath = path.join(cwd, '.stylelintrc.json')

  if ((await exists(outputPath)) && !force) {
    logger.debug('.stylelintrc.json already exists, skipping')
    return
  }

  const templatePath = path.join(templatesDir, '.stylelintrc.ejs')
  const template = await readFile(templatePath)
  const content = ejs.render(template, config)

  await writeFile(outputPath, content)
  logger.debug('Generated: .stylelintrc.json')
}

/**
 * 更新 package.json
 */
async function updatePackageJson(cwd: string): Promise<void> {
  const packageJsonPath = path.join(cwd, 'package.json')

  if (!(await exists(packageJsonPath))) {
    logger.debug('package.json not found, skipping')
    return
  }

  try {
    const content = await readFile(packageJsonPath)
    const packageJson = JSON.parse(content)

    // 添加 scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    packageJson.scripts['format'] = 'ldesign-formatter format'
    packageJson.scripts['format:check'] = 'ldesign-formatter check'

    await writeJSON(packageJsonPath, packageJson, { spaces: 2 })
    logger.debug('Updated package.json with format scripts')
  } catch (error) {
    logger.warn('Failed to update package.json', error as Error)
  }
}

/**
 * 获取预设描述
 */
function getPresetDescription(preset: PresetName): string {
  const descriptions: Partial<Record<PresetName, string>> = {
    base: 'Basic configuration with Prettier',
    vue: 'Vue.js projects',
    'vue-typescript': 'Vue.js with TypeScript',
    react: 'React projects',
    'react-typescript': 'React with TypeScript',
    angular: 'Angular projects',
    'angular-typescript': 'Angular with TypeScript',
    svelte: 'Svelte projects',
    'svelte-typescript': 'Svelte with TypeScript',
    next: 'Next.js projects',
    nuxt: 'Nuxt.js projects',
    node: 'Node.js projects',
  }
  return descriptions[preset] || preset
}

