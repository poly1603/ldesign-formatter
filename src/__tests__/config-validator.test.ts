import { describe, it, expect } from 'vitest'
import { ConfigValidator } from '../core/config-validator.js'
import type { FormatterConfig } from '../types/index.js'

describe('ConfigValidator', () => {
  const validator = new ConfigValidator()

  it('should validate valid config', () => {
    const config: FormatterConfig = {
      preset: 'base',
      prettier: {
        semi: false,
        singleQuote: true,
      },
    }

    const result = validator.validate(config)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid preset', () => {
    const config: FormatterConfig = {
      preset: 'invalid' as any,
      prettier: {},
    }

    const result = validator.validate(config)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should reject invalid prettier tabWidth', () => {
    const config: FormatterConfig = {
      prettier: {
        tabWidth: -1,
      },
    }

    const result = validator.validate(config)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('tabWidth'))).toBe(true)
  })

  it('should reject invalid trailingComma value', () => {
    const config: FormatterConfig = {
      prettier: {
        trailingComma: 'invalid' as any,
      },
    }

    const result = validator.validate(config)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('trailingComma'))).toBe(true)
  })
})

