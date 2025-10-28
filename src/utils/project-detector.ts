import path from 'node:path'
import type { ProjectDetection, PresetName } from '../types/index.js'
import { exists, readFile } from './file-utils.js'

/**
 * 项目检测器
 */
export class ProjectDetector {
  private cwd: string

  constructor(cwd: string) {
    this.cwd = cwd
  }

  /**
   * 检测项目类型
   */
  async detect(): Promise<ProjectDetection> {
    const detections: Array<{ type: PresetName; confidence: number; features: string[] }> = []

    // 检测 Vue 项目
    const vueDetection = await this.detectVue()
    if (vueDetection.confidence > 0) {
      detections.push(vueDetection)
    }

    // 检测 React 项目
    const reactDetection = await this.detectReact()
    if (reactDetection.confidence > 0) {
      detections.push(reactDetection)
    }

    // 检测 Angular 项目
    const angularDetection = await this.detectAngular()
    if (angularDetection.confidence > 0) {
      detections.push(angularDetection)
    }

    // 检测 Svelte 项目
    const svelteDetection = await this.detectSvelte()
    if (svelteDetection.confidence > 0) {
      detections.push(svelteDetection)
    }

    // 检测 Next.js 项目
    const nextDetection = await this.detectNext()
    if (nextDetection.confidence > 0) {
      detections.push(nextDetection)
    }

    // 检测 Nuxt 项目
    const nuxtDetection = await this.detectNuxt()
    if (nuxtDetection.confidence > 0) {
      detections.push(nuxtDetection)
    }

    // 检测 Node 项目
    const nodeDetection = await this.detectNode()
    if (nodeDetection.confidence > 0) {
      detections.push(nodeDetection)
    }

    // 按置信度排序，返回最高的
    detections.sort((a, b) => b.confidence - a.confidence)

    return detections[0] || { type: 'base', confidence: 0.5, features: [] }
  }

  /**
   * 检测 Vue 项目
   */
  private async detectVue(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
        confidence += 0.5
        features.push('vue dependency')
      }

      const hasTS = packageJson.devDependencies?.typescript
      const type: PresetName = hasTS ? 'vue-typescript' : 'vue'

      if (packageJson.dependencies?.['@vue/cli-service']) {
        confidence += 0.2
        features.push('@vue/cli-service')
      }

      if (await exists(path.join(this.cwd, 'vue.config.js'))) {
        confidence += 0.2
        features.push('vue.config.js')
      }

      if (hasTS) {
        confidence += 0.1
        features.push('TypeScript')
      }

      return { type, confidence, features }
    }

    return { type: 'vue', confidence: 0, features: [] }
  }

  /**
   * 检测 React 项目
   */
  private async detectReact(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
        confidence += 0.5
        features.push('react dependency')
      }

      const hasTS = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript
      const type: PresetName = hasTS ? 'react-typescript' : 'react'

      if (packageJson.dependencies?.['react-scripts']) {
        confidence += 0.2
        features.push('create-react-app')
      }

      if (hasTS) {
        confidence += 0.1
        features.push('TypeScript')
      }

      return { type, confidence, features }
    }

    return { type: 'react', confidence: 0, features: [] }
  }

  /**
   * 检测 Angular 项目
   */
  private async detectAngular(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.['@angular/core']) {
        confidence += 0.6
        features.push('@angular/core')
      }

      if (await exists(path.join(this.cwd, 'angular.json'))) {
        confidence += 0.3
        features.push('angular.json')
      }

      const hasTS = packageJson.devDependencies?.typescript
      const type: PresetName = hasTS ? 'angular-typescript' : 'angular'

      if (hasTS) {
        features.push('TypeScript')
      }

      return { type, confidence, features }
    }

    return { type: 'angular', confidence: 0, features: [] }
  }

  /**
   * 检测 Svelte 项目
   */
  private async detectSvelte(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte) {
        confidence += 0.5
        features.push('svelte dependency')
      }

      const hasTS = packageJson.devDependencies?.typescript
      const type: PresetName = hasTS ? 'svelte-typescript' : 'svelte'

      if (packageJson.devDependencies?.['@sveltejs/kit']) {
        confidence += 0.3
        features.push('SvelteKit')
      }

      if (await exists(path.join(this.cwd, 'svelte.config.js'))) {
        confidence += 0.2
        features.push('svelte.config.js')
      }

      if (hasTS) {
        features.push('TypeScript')
      }

      return { type, confidence, features }
    }

    return { type: 'svelte', confidence: 0, features: [] }
  }

  /**
   * 检测 Next.js 项目
   */
  private async detectNext(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
        confidence += 0.7
        features.push('next dependency')
      }

      if (await exists(path.join(this.cwd, 'next.config.js')) || 
          await exists(path.join(this.cwd, 'next.config.mjs'))) {
        confidence += 0.3
        features.push('next.config')
      }

      return { type: 'next', confidence, features }
    }

    return { type: 'next', confidence: 0, features: [] }
  }

  /**
   * 检测 Nuxt 项目
   */
  private async detectNuxt(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.dependencies?.nuxt || packageJson.devDependencies?.nuxt) {
        confidence += 0.7
        features.push('nuxt dependency')
      }

      if (await exists(path.join(this.cwd, 'nuxt.config.js')) || 
          await exists(path.join(this.cwd, 'nuxt.config.ts'))) {
        confidence += 0.3
        features.push('nuxt.config')
      }

      return { type: 'nuxt', confidence, features }
    }

    return { type: 'nuxt', confidence: 0, features: [] }
  }

  /**
   * 检测 Node.js 项目
   */
  private async detectNode(): Promise<{ type: PresetName; confidence: number; features: string[] }> {
    const features: string[] = []
    let confidence = 0.3 // 默认置信度

    const packageJson = await this.readPackageJson()
    if (packageJson) {
      if (packageJson.type === 'module') {
        confidence += 0.1
        features.push('ESM module')
      }

      if (packageJson.main || packageJson.exports) {
        confidence += 0.1
        features.push('package exports')
      }

      // 如果没有前端框架依赖，可能是纯 Node 项目
      const hasFrontendFramework = 
        packageJson.dependencies?.react ||
        packageJson.dependencies?.vue ||
        packageJson.dependencies?.['@angular/core'] ||
        packageJson.dependencies?.svelte

      if (!hasFrontendFramework) {
        confidence += 0.2
        features.push('no frontend framework')
      }
    }

    return { type: 'node', confidence, features }
  }

  /**
   * 读取 package.json
   */
  private async readPackageJson(): Promise<any> {
    try {
      const packageJsonPath = path.join(this.cwd, 'package.json')
      if (await exists(packageJsonPath)) {
        const content = await readFile(packageJsonPath)
        return JSON.parse(content)
      }
    } catch {
      // 忽略错误
    }
    return null
  }
}

/**
 * 创建项目检测器
 */
export function createProjectDetector(cwd: string): ProjectDetector {
  return new ProjectDetector(cwd)
}
