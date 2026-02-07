import { describe, it, expect } from 'vitest'
import { formatWithThousandsSeparator, removeThousandsSeparator } from '../lib/utils'

describe('formatWithThousandsSeparator', () => {
  describe('basic formatting', () => {
    it('should format integers with commas', () => {
      expect(formatWithThousandsSeparator('1234567')).toBe('1,234,567')
    })

    it('should format number with decimal part (only integer part gets commas)', () => {
      expect(formatWithThousandsSeparator('1234567.89')).toBe('1,234,567.89')
    })

    it('should not add comma for numbers less than 1000', () => {
      expect(formatWithThousandsSeparator('999')).toBe('999')
      expect(formatWithThousandsSeparator('123')).toBe('123')
    })

    it('should format exactly 1000', () => {
      expect(formatWithThousandsSeparator('1000')).toBe('1,000')
    })

    it('should handle very large numbers', () => {
      expect(formatWithThousandsSeparator('999999999999')).toBe('999,999,999,999')
    })
  })

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      expect(formatWithThousandsSeparator('')).toBe('')
      expect(formatWithThousandsSeparator('   ')).toBe('')
    })

    it('should return "-" for just a minus sign', () => {
      expect(formatWithThousandsSeparator('-')).toBe('-')
    })

    it('should handle single digit', () => {
      expect(formatWithThousandsSeparator('5')).toBe('5')
    })

    it('should handle zero', () => {
      expect(formatWithThousandsSeparator('0')).toBe('0')
    })

    it('should preserve decimal point with trailing zeros', () => {
      expect(formatWithThousandsSeparator('1234.00')).toBe('1,234.00')
    })

    it('should handle decimal with long fractional part', () => {
      expect(formatWithThousandsSeparator('1234567.123456789')).toBe('1,234,567.123456789')
    })
  })

  describe('negative numbers', () => {
    it('should format negative integers', () => {
      expect(formatWithThousandsSeparator('-1234567')).toBe('-1,234,567')
    })

    it('should format negative decimals', () => {
      expect(formatWithThousandsSeparator('-1234567.89')).toBe('-1,234,567.89')
    })

    it('should handle small negative numbers', () => {
      expect(formatWithThousandsSeparator('-999')).toBe('-999')
    })
  })

  describe('decimal-only values', () => {
    it('should handle values less than 1', () => {
      expect(formatWithThousandsSeparator('0.123456')).toBe('0.123456')
    })

    it('should handle very small decimals', () => {
      expect(formatWithThousandsSeparator('0.000001')).toBe('0.000001')
    })
  })

  describe('invalid inputs', () => {
    it('should return original string for non-numeric input', () => {
      expect(formatWithThousandsSeparator('abc')).toBe('abc')
      expect(formatWithThousandsSeparator('12abc')).toBe('12abc')
    })
  })

  describe('whitespace handling', () => {
    it('should trim whitespace before formatting', () => {
      expect(formatWithThousandsSeparator('  1234567  ')).toBe('1,234,567')
    })
  })
})

describe('removeThousandsSeparator', () => {
  it('should remove commas from formatted number', () => {
    expect(removeThousandsSeparator('1,234,567')).toBe('1234567')
  })

  it('should remove commas from formatted decimal', () => {
    expect(removeThousandsSeparator('1,234,567.89')).toBe('1234567.89')
  })

  it('should handle string without commas', () => {
    expect(removeThousandsSeparator('12345')).toBe('12345')
  })

  it('should handle empty string', () => {
    expect(removeThousandsSeparator('')).toBe('')
  })

  it('should handle negative formatted numbers', () => {
    expect(removeThousandsSeparator('-1,234,567')).toBe('-1234567')
  })

  it('should remove multiple commas', () => {
    expect(removeThousandsSeparator('1,234,567,890')).toBe('1234567890')
  })
})
