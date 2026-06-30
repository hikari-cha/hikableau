import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number string with thousands separators (commas) in the integer part only.
 * Preserves the decimal part without formatting.
 * Returns empty string for empty input, and returns the original string if it's not a valid number.
 */
export function formatWithThousandsSeparator(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '-') return trimmed

  const isNegative = trimmed.startsWith('-')
  const absValue = isNegative ? trimmed.slice(1) : trimmed

  const parts = absValue.split('.')

  if (parts.length > 2) {
    return value
  }

  const integerPart = parts[0]
  const decimalPart = parts.length === 2 ? parts[1] : null

  if (integerPart === '' || !/^\d+$/.test(integerPart)) {
    return value
  }

  if (decimalPart !== null && decimalPart !== '' && !/^\d+$/.test(decimalPart)) {
    return value
  }

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  let result = isNegative ? '-' + formattedInteger : formattedInteger
  if (decimalPart !== null) {
    result += '.' + decimalPart
  }

  return result
}

/**
 * Remove thousands separators (commas) from a formatted number string.
 */
export function removeThousandsSeparator(value: string): string {
  return value.replace(/,/g, '')
}

/**
 * Format a total number for display, stripping unnecessary trailing zeros.
 */
export function formatTotal(total: number): string {
  if (Number.isInteger(total)) {
    return formatWithThousandsSeparator(total.toString())
  }
  const str = String(total)
  if (str.includes('e') || str.includes('E')) {
    return str
  }
  return formatWithThousandsSeparator(str.replace(/\.?0+$/, ''))
}
