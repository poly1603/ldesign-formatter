import type { PresetConfig, PresetName } from '../types/index.js'
import { basePreset } from './base.js'
import { vuePreset } from './vue.js'
import { vueTypescriptPreset } from './vue-typescript.js'
import { reactPreset } from './react.js'
import { reactTypescriptPreset } from './react-typescript.js'
import { nodePreset } from './node.js'
import { angularPreset } from './angular.js'
import { angularTypescriptPreset } from './angular-typescript.js'
import { sveltePreset } from './svelte.js'
import { svelteTypescriptPreset } from './svelte-typescript.js'
import { nextPreset } from './next.js'
import { nuxtPreset } from './nuxt.js'

/**
 * 所有预设配置
 */
export const presets: Record<PresetName, PresetConfig> = {
  base: basePreset,
  vue: vuePreset,
  'vue-typescript': vueTypescriptPreset,
  react: reactPreset,
  'react-typescript': reactTypescriptPreset,
  node: nodePreset,
  angular: angularPreset,
  'angular-typescript': angularTypescriptPreset,
  svelte: sveltePreset,
  'svelte-typescript': svelteTypescriptPreset,
  next: nextPreset,
  nuxt: nuxtPreset,
}

/**
 * 获取预设配置
 */
export function getPreset(name: PresetName): PresetConfig {
  const preset = presets[name]
  if (!preset) {
    throw new Error(`Unknown preset: ${name}`)
  }
  return preset
}

/**
 * 获取所有预设名称
 */
export function getPresetNames(): PresetName[] {
  return Object.keys(presets) as PresetName[]
}

/**
 * 检查预设是否存在
 */
export function hasPreset(name: string): name is PresetName {
  return name in presets
}

export * from './base.js'
export * from './vue.js'
export * from './vue-typescript.js'
export * from './react.js'
export * from './react-typescript.js'
export * from './node.js'
export * from './angular.js'
export * from './angular-typescript.js'
export * from './svelte.js'
export * from './svelte-typescript.js'
export * from './next.js'
export * from './nuxt.js'

