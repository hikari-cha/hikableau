import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number string with thousands separators (commas) in the integer part only.
 * Preserves the decimal part without formatting.
 * Returns empty string for empty input, and returns the original string if it's not a valid number.
 *
 * @param value - The string value to format
 * @returns Formatted string with thousands separators
 */
export function formatWithThousandsSeparator(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '-') return trimmed

  // Handle negative numbers
  const isNegative = trimmed.startsWith('-')
  const absValue = isNegative ? trimmed.slice(1) : trimmed

  // Split into integer and decimal parts
  const parts = absValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts.length > 1 ? parts[1] : null

  // If integer part is empty or not numeric, return original
  if (integerPart === '' || !/^\d+$/.test(integerPart)) {
    return value
  }

  // Format integer part with thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Reconstruct the number
  let result = isNegative ? '-' + formattedInteger : formattedInteger
  if (decimalPart !== null) {
    result += '.' + decimalPart
  }

  return result
}

/**
 * Remove thousands separators (commas) from a formatted number string.
 *
 * @param value - The formatted string value
 * @returns String with commas removed
 */
export function removeThousandsSeparator(value: string): string {
  return value.replace(/,/g, '')
}
