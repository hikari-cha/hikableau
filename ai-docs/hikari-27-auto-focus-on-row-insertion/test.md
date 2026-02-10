# Hikari-27: Auto Focus on Row Insertion — Test Results

## Test Summary

- **Test File:** [src/renderer/src/__tests__/ColumnSumTable.test.tsx](../../src/renderer/src/__tests__/ColumnSumTable.test.tsx)
- **Total Tests:** 60 (all ColumnSumTable tests)
- **Passed:** 60
- **Failed:** 0
- **Duration:** ~12s

## Full Suite Results

```
 Test Files  3 passed (3)
      Tests  137 passed (137)
```

No regressions in any test file.

## New Tests Added: `Auto Focus on Row Insertion` (6 tests)

### 1. should be in ready-to-type state after Enter key inserts a new row from description column ✅

**Scenario:** User types text ("First Item") in description, then presses Enter.
**Verifies:**
- Focus moves to the new row's description input
- Typing immediately enters text in the new row (not the original)
- Original row retains its value

### 2. should be in ready-to-type state after Enter key inserts a new row from value column ✅

**Scenario:** User types a value ("100") in the value column, then presses Enter.
**Verifies:**
- Focus moves to the new row's **description** input (not value)
- Typing immediately enters text in the new row's description

### 3. should focus description (not value) column of new row regardless of which column Enter was pressed in ✅

**Scenario:** User clicks on the value column and presses Enter.
**Verifies:**
- Focus is on the new row's description input
- Focus is NOT on the new row's value input

### 4. should auto-focus when inserting from the last row of the table ✅

**Scenario:** Table has 3 rows (via Add Row button). User clicks the last row's description and presses Enter.
**Verifies:**
- New (4th) row is created
- Focus is on the 4th row's description input

### 5. should auto-focus when inserting from a middle row with data ✅

**Scenario:** Table has 3 rows with data (Alpha/10, Beta/20, Gamma/30). User clicks the middle row's value column and presses Enter.
**Verifies:**
- New row is inserted between Beta and Gamma
- Focus is on the new row's description input
- Row order is preserved: Alpha, Beta, (new empty), Gamma

### 6. should support rapid sequential Enter presses with auto-focus on each new row ✅

**Scenario:** User clicks the first row, presses Enter, types "Row 2", presses Enter, types "Row 3", presses Enter.
**Verifies:**
- After each Enter, focus moves to the newly created row
- Text typed after Enter goes into the correct (new) row
- All rows have correct data after the sequence

## Existing Tests: `Enter Key Row Insertion` (7 tests — all still pass)

| # | Test | Status |
|---|------|--------|
| 1 | should insert a new row below when Enter is pressed in description column | ✅ |
| 2 | should insert a new row below when Enter is pressed in value column | ✅ |
| 3 | should focus the first input (description) of the newly created row | ✅ |
| 4 | should focus description input of new row when Enter is pressed in value column | ✅ |
| 5 | should insert row at correct position when Enter is pressed from middle row | ✅ |
| 6 | should preserve existing data when inserting a new row via Enter key | ✅ |
| 7 | should allow multiple consecutive Enter key presses to insert multiple rows | ✅ |

## Bug Found and Fixed

The previous implementation used `useEffect` with a `focusRowId` state for focus management. This worked only in the simplest case (empty input + Enter) but **failed** when:

- Text was typed before pressing Enter (focus stayed on original input)
- Enter was pressed from a row added via the "Add Row" button
- Rapid sequential Enter presses with typing between them

**5 of the 6 new tests initially failed** with the old `useEffect` approach, confirming the bug. After switching to the ref callback approach, **all 60 tests pass**.
