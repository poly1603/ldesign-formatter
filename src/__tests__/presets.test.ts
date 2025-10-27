import { describe, it, expect } from 'vitest'
import { getPreset, getPresetNames, hasPreset } from '../presets/index.js'

describe('Presets', () => {
  it('should get preset names', () => {
    const names = getPresetNames()

    expect(names).toContain('base')
    expect(names).toContain('vue')
    expect(names).toContain('vue-typescript')
    expect(names).toContain('react')
    expect(names).toContain('react-typescript')
    expect(names).toContain('node')
  })

  it('should get base preset', () => {
    const preset = getPreset('base')

    expect(preset.name).toBe('base')
    expect(preset.prettier).toBeDefined()
    expect(preset.prettier.singleQuote).toBe(true)
  })

  it('should get vue-typescript preset', () => {
    const preset = getPreset('vue-typescript')

    expect(preset.name).toBe('vue-typescript')
    expect(preset.prettier).toBeDefined()
    expect(preset.eslint).toBeDefined()
  })

  it('should check if preset exists', () => {
    expect(hasPreset('base')).toBe(true)
    expect(hasPreset('vue-typescript')).toBe(true)
    expect(hasPreset('invalid')).toBe(false)
  })

  it('should throw error for unknown preset', () => {
    expect(() => getPreset('invalid' as any)).toThrow('Unknown preset')
  })
})

