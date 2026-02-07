# Hikari-18: Thousands Separators - Test Documentation

## Test Overview

This document describes the unit tests for the thousands separators feature. Tests cover both the utility functions and their integration in the ColumnSumTable component.

## Test Files

- `src/renderer/src/__tests__/utils.test.ts` - Utility function unit tests
- `src/renderer/src/__tests__/ColumnSumTable.test.tsx` - Component integration tests

## Test Results

**Status**: ✅ All tests passing

## New Test File: utils.test.ts

### formatWithThousandsSeparator Tests

#### Basic Formatting

| Test Name | Description | Status |
|-----------|-------------|--------|
| should format integers with commas | `'1234567'` → `'1,234,567'` | ✅ Pass |
| should format number with decimal part | `'1234567.89'` → `'1,234,567.89'` | ✅ Pass |
| should not add comma for numbers less than 1000 | `'999'` → `'999'` | ✅ Pass |
| should format exactly 1000 | `'1000'` → `'1,000'` | ✅ Pass |
| should handle very large numbers | `'999999999999'` → `'999,999,999,999'` | ✅ Pass |

#### Edge Cases

| Test Name | Description | Status |
|-----------|-------------|--------|
| should return empty string for empty input | `''` → `''` | ✅ Pass |
| should return "-" for just a minus sign | `'-'` → `'-'` | ✅ Pass |
| should handle single digit | `'5'` → `'5'` | ✅ Pass |
| should handle zero | `'0'` → `'0'` | ✅ Pass |
| should preserve decimal point with trailing zeros | `'1234.00'` → `'1,234.00'` | ✅ Pass |
| should handle decimal with long fractional part | `'1234567.123456789'` → `'1,234,567.123456789'` | ✅ Pass |

#### Negative Numbers

| Test Name | Description | Status |
|-----------|-------------|--------|
| should format negative integers | `'-1234567'` → `'-1,234,567'` | ✅ Pass |
| should format negative decimals | `'-1234567.89'` → `'-1,234,567.89'` | ✅ Pass |
| should handle small negative numbers | `'-999'` → `'-999'` | ✅ Pass |

#### Decimal-only Values

| Test Name | Description | Status |
|-----------|-------------|--------|
| should handle values less than 1 | `'0.123456'` → `'0.123456'` | ✅ Pass |
| should handle very small decimals | `'0.000001'` → `'0.000001'` | ✅ Pass |

#### Invalid Inputs

| Test Name | Description | Status |
|-----------|-------------|--------|
| should return original string for non-numeric input | `'abc'` → `'abc'` | ✅ Pass |

#### Whitespace Handling

| Test Name | Description | Status |
|-----------|-------------|--------|
| should trim whitespace before formatting | `'  1234567  '` → `'1,234,567'` | ✅ Pass |

### removeThousandsSeparator Tests

| Test Name | Description | Status |
|-----------|-------------|--------|
| should remove commas from formatted number | `'1,234,567'` → `'1234567'` | ✅ Pass |
| should remove commas from formatted decimal | `'1,234,567.89'` → `'1234567.89'` | ✅ Pass |
| should handle string without commas | `'12345'` → `'12345'` | ✅ Pass |
| should handle empty string | `''` → `''` | ✅ Pass |
| should handle negative formatted numbers | `'-1,234,567'` → `'-1234567'` | ✅ Pass |
| should remove multiple commas | `'1,234,567,890'` → `'1234567890'` | ✅ Pass |

## Modified Existing Tests

### ColumnSumTable.test.tsx

| Test Name | Change | Reason |
|-----------|--------|--------|
| should handle very large numbers | Expected value changed from `'999999999999'` to `'999,999,999,999'` | Total now displays with formatting |

## Test Implementation Examples

### formatWithThousandsSeparator Tests

```typescript
describe('formatWithThousandsSeparator', () => {
  describe('basic formatting', () => {
    it('should format integers with commas', () => {
      expect(formatWithThousandsSeparator('1234567')).toBe('1,234,567')
    })

    it('should format number with decimal part (only integer part gets commas)', () => {
      expect(formatWithThousandsSeparator('1234567.89')).toBe('1,234,567.89')
    })
  })

  describe('negative numbers', () => {
    it('should format negative integers', () => {
      expect(formatWithThousandsSeparator('-1234567')).toBe('-1,234,567')
    })
  })
})
```

### removeThousandsSeparator Tests

```typescript
describe('removeThousandsSeparator', () => {
  it('should remove commas from formatted number', () => {
    expect(removeThousandsSeparator('1,234,567')).toBe('1234567')
  })

  it('should handle negative formatted numbers', () => {
    expect(removeThousandsSeparator('-1,234,567')).toBe('-1234567')
  })
})
```

## Testing Approach

### Unit Test Strategy

The utility functions are tested independently from the component to ensure:
- **Isolation**: Each function's behavior is verified in isolation
- **Comprehensive Coverage**: Edge cases (empty strings, negatives, decimals) are all covered
- **Regression Prevention**: Any changes to formatting logic will be caught

### Integration Test Update

The existing component test for large numbers was updated to expect formatted output, verifying that the utilities are correctly integrated into the component.

## Test Coverage Summary

- ✅ Formatting integers with thousands separators
- ✅ Decimal preservation (no formatting in decimal part)
- ✅ Negative number handling
- ✅ Edge cases (empty, single digit, zero)
- ✅ Invalid input handling
- ✅ Comma removal for internal storage
- ✅ Component integration (Total display)