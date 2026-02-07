# Column Sum Table - Test Documentation

## Test Overview

This document describes the unit tests for the ColumnSumTable component. All tests are written using Vitest and React Testing Library.

## Test Configuration

- **Test Framework**: Vitest v4.0.18
- **Testing Library**: @testing-library/react, @testing-library/user-event
- **Environment**: jsdom
- **Configuration File**: `vitest.config.ts`

## Test File Location

`src/renderer/src/__tests__/ColumnSumTable.test.tsx`

## Test Results Summary

**Execution Date**: February 7, 2026

| Metric | Value |
|--------|-------|
| Total Tests | 26 |
| Passed | 26 |
| Failed | 0 |
| Duration | ~6.14s |

## Test Suites

### 1. Initial Rendering (4 tests)

| Test | Status | Description |
|------|--------|-------------|
| should render with 2 rows by default | ✅ PASS | Verifies 1 data row + 1 total row are rendered initially |
| should display Total as 0 when all values are empty | ✅ PASS | Confirms total shows 0 with empty inputs |
| should have left-aligned column headers | ✅ PASS | Checks that headers use `text-left` class |
| should display grid lines (borders) | ✅ PASS | Verifies table has `border` class for grid lines |

### 2. Adding Rows (3 tests)

| Test | Status | Description |
|------|--------|-------------|
| should add a new row when clicking the "+" button | ✅ PASS | Confirms clicking Add Row increases row count |
| should allow adding multiple rows | ✅ PASS | Tests adding 3 additional rows |
| should maintain minimum of 2 rows | ✅ PASS | Ensures minimum structure is maintained |

### 3. Sum Calculation (6 tests)

| Test | Status | Description |
|------|--------|-------------|
| should calculate sum of positive integers | ✅ PASS | Tests 10 + 20 = 30 |
| should calculate sum with negative numbers | ✅ PASS | Tests 100 + (-30) = 70 |
| should calculate sum with floating-point numbers | ✅ PASS | Tests 10.5 + 20.3 = 30.8 |
| should handle mixed positive, negative, and decimal values | ✅ PASS | Tests 100.5 + (-50.25) + 25.75 = 76 |
| should ignore invalid values in sum calculation | ✅ PASS | Tests that "abc" is treated as 0 |
| should update sum when values change | ✅ PASS | Tests real-time sum updates |

### 4. Data Validation (6 tests)

| Test | Status | Description |
|------|--------|-------------|
| should accept string input in description column | ✅ PASS | Confirms strings are accepted without error |
| should show error for non-numeric value in value column | ✅ PASS | Validates error message appears for "abc" |
| should clear error when valid number is entered | ✅ PASS | Confirms error clears after valid input |
| should accept negative numbers in value column | ✅ PASS | Tests "-50" is accepted |
| should accept decimal numbers in value column | ✅ PASS | Tests "3.14159" is accepted |
| should show validation error styling on invalid input | ✅ PASS | Verifies error message has `text-red-500` class |

### 5. Table Structure (3 tests)

| Test | Status | Description |
|------|--------|-------------|
| should have exactly 2 columns | ✅ PASS | Verifies 2 header cells exist |
| should not display any title above the table | ✅ PASS | Confirms no heading element exists |
| should use Description and Value as column headers | ✅ PASS | Verifies correct header text, not "Column 1/2" |

### 6. Edge Cases (4 tests)

| Test | Status | Description |
|------|--------|-------------|
| should handle empty input gracefully | ✅ PASS | Empty inputs result in total of 0 |
| should handle very large numbers | ✅ PASS | Tests 999999999999 |
| should handle very small decimal numbers | ✅ PASS | Tests 0.000001 |
| should handle zero values | ✅ PASS | Tests 0 + 0 = 0 |

## Full Test Output

```
 RUN  v4.0.18 C:/develop/hikableau

 ✓ src/renderer/src/__tests__/ColumnSumTable.test.tsx (26 tests) 3996ms
   ✓ ColumnSumTable (26)
     ✓ Initial Rendering (4)
       ✓ should render with 2 rows by default (1 data row + 1 total row) 160ms
       ✓ should display Total as 0 when all values are empty 6ms
       ✓ should have left-aligned column headers 5ms
       ✓ should display grid lines (borders) 4ms
     ✓ Adding Rows (3)
       ✓ should add a new row when clicking the "+" button 122ms
       ✓ should allow adding multiple rows 171ms
       ✓ should maintain minimum of 2 rows (1 data + total) 15ms
     ✓ Sum Calculation (6)
       ✓ should calculate sum of positive integers 214ms
       ✓ should calculate sum with negative numbers 318ms
       ✓ should calculate sum with floating-point numbers 283ms
       ✓ should handle mixed positive, negative, and decimal values 566ms
       ✓ should ignore invalid values in sum calculation 283ms
       ✓ should update sum when values change 183ms
     ✓ Data Validation (6)
       ✓ should accept string input in description column 184ms
       ✓ should show error for non-numeric value in value column 114ms
       ✓ should clear error when valid number is entered 204ms
       ✓ should accept negative numbers in value column 113ms
       ✓ should accept decimal numbers in value column 147ms
       ✓ should show validation error styling on invalid input 187ms
     ✓ Table Structure (3)
       ✓ should have exactly 2 columns 9ms
       ✓ should not display any title above the table 8ms
       ✓ should use Description and Value as column headers (not Column 1/2) 8ms
     ✓ Edge Cases (4)
       ✓ should handle empty input gracefully 5ms
       ✓ should handle very large numbers 245ms
       ✓ should handle very small decimal numbers 175ms
       ✓ should handle zero values 264ms

 Test Files  1 passed (1)
      Tests  26 passed (26)
   Start at  15:12:21
   Duration  6.14s (transform 166ms, setup 218ms, import 433ms, tests 4.00s, environment 1.25s)
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage Areas

### Requirements Coverage

| Requirement | Test Coverage |
|-------------|---------------|
| 2 columns (Description, Value) | ✅ Covered |
| Default 2 rows (including Total) | ✅ Covered |
| Minimum 2 rows | ✅ Covered |
| Add rows with "+" button | ✅ Covered |
| Sum calculation | ✅ Covered |
| Negative number support | ✅ Covered |
| Decimal number support | ✅ Covered |
| Validation error display | ✅ Covered |
| No title above table | ✅ Covered |
| Left-aligned headers | ✅ Covered |
| Grid lines visible | ✅ Covered |

### Edge Cases Coverage

| Edge Case | Test Coverage |
|-----------|---------------|
| Empty values | ✅ Covered |
| Invalid (non-numeric) input | ✅ Covered |
| Very large numbers | ✅ Covered |
| Very small decimals | ✅ Covered |
| Zero values | ✅ Covered |
| Mixed value types | ✅ Covered |

## Notes

- Tests mock `crypto.randomUUID()` for consistent row IDs in test environment
- User interactions are simulated using `@testing-library/user-event` for realistic behavior
- All tests are isolated and do not depend on each other