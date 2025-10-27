import { describe, it, expect } from 'vitest'
import { ConfigLoader } from '../core/config-loader.js'

describe('ConfigLoader', () => {
  const loader = new ConfigLoader()

  it('should get default config', () => {
    const config = loader.getDefault('base')

    expect(config).toBeDefined()
    expect(config.preset).toBe('base')
    expect(config.prettier).toBeDefined()
  })

  it('should get vue-typescript preset', () => {
    const config = loader.getDefault('vue-typescript')

    expect(config.preset).toBe('vue-typescript')
    expect(config.prettier?.singleQuote).toBe(true)
    expect(config.prettier?.semi).toBe(false)
  })

  it('should merge configs', () => {
    const base = loader.getDefault('base')
    const override = {
      prettier: {
        semi: true,
      },
    }

    const merged = loader.merge(base, override)

    expect(merged.prettier?.semi).toBe(true)
    expect(merged.prettier?.singleQuote).toBe(base.prettier?.singleQuote)
  })
})

