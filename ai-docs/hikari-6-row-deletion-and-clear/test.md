# Hikari-6: Row Deletion and Table Clear - Test Documentation

## Test Overview

This document describes the unit tests for the Row Deletion and Table Clear features implemented in the ColumnSumTable component.

## Test File

- `src/renderer/src/__tests__/ColumnSumTable.test.tsx`

## Test Results

**Status**: ✅ All tests passing

```
Test Files  2 passed (2)
     Tests  97 passed (97)
  Duration  10.71s
```

## New Test Suites

### Row Deletion Tests

| Test Name | Description | Status |
|-----------|-------------|--------|
| should not render delete button when only one row exists | Verifies delete button is hidden with 1 row | ✅ Pass |
| should render a delete button for each row when multiple rows exist | Verifies delete buttons appear with 2+ rows | ✅ Pass |
| should delete a row when delete button is clicked | Verifies row count decreases after deletion | ✅ Pass |
| should remove row data from sum calculation when deleted | Verifies sum is recalculated after row deletion | ✅ Pass |
| should hide delete button when deleting down to one row | Verifies button hides when only 1 row remains | ✅ Pass |
| should clear validation errors when row is deleted | Verifies associated errors are removed | ✅ Pass |
| should have delete button with minus icon | Verifies button contains SVG icon | ✅ Pass |

### Table Clear Tests

| Test Name | Description | Status |
|-----------|-------------|--------|
| should render a Clear button | Verifies Clear button exists | ✅ Pass |
| should position Clear button next to Add Row button | Verifies button placement | ✅ Pass |
| should reset table to initial state when Clear is clicked | Verifies full state reset | ✅ Pass |
| should clear validation errors when Clear is clicked | Verifies errors are cleared | ✅ Pass |
| should work correctly after multiple add/delete operations | Verifies clear works after complex operations | ✅ Pass |

## Modified Existing Tests

### Table Structure

| Test Name | Change | Reason |
|-----------|--------|--------|
| should have exactly 2 columns | Kept at 2 columns | Delete button floats outside table, not a column |

## Test Implementation Details

### Row Deletion Tests

```typescript
describe('Row Deletion', () => {
  it('should not render delete button when only one row exists', () => {
    // With only 1 row, no delete button should be visible
  })

  it('should render a delete button for each row when multiple rows exist', async () => {
    // Adds a second row, verifies 2 delete buttons exist
  })

  it('should delete a row when delete button is clicked', async () => {
    // Creates 3 rows, deletes middle one, verifies 2 remain
  })

  it('should remove row data from sum calculation when deleted', async () => {
    // Enters values in 2 rows (100 + 50 = 150)
    // Deletes first row (100), verifies total is 50
  })

  it('should hide delete button when deleting down to one row', async () => {
    // Starts with 2 rows, deletes 1, verifies no delete buttons visible
  })

  it('should clear validation errors when row is deleted', async () => {
    // Adds a row (need 2 to have delete button)
    // Enters invalid value, verifies error appears
    // Deletes row, verifies error is gone
  })

  it('should have delete button with minus icon', async () => {
    // Adds a row to make delete buttons visible
    // Verifies button contains SVG element
  })
})
```

### Table Clear Tests

```typescript
describe('Table Clear', () => {
  it('should render a Clear button', () => {
    // Verifies Clear button exists
  })

  it('should position Clear button next to Add Row button', () => {
    // Verifies both buttons share same parent container
  })

  it('should reset table to initial state when Clear is clicked', async () => {
    // Adds 2 rows, enters data in 3 rows
    // Clicks Clear, verifies:
    //   - Only 1 empty row remains
    //   - Description and Value fields are empty
    //   - Total is 0
  })

  it('should clear validation errors when Clear is clicked', async () => {
    // Enters invalid value, verifies error appears
    // Clicks Clear, verifies error is gone
  })

  it('should work correctly after multiple add/delete operations', async () => {
    // Adds 2 rows (total 3), deletes 1 (total 2)
    // Clicks Clear, verifies reset to 1 empty row
  })
})
```

## Testing Approach

### User Interaction Simulation

Tests use `@testing-library/user-event` for realistic user interaction simulation:
- `user.click()` for button clicks
- `user.type()` for text input
- `user.clear()` for clearing inputs

### Accessibility Testing

Delete buttons are found using accessible queries:
```typescript
screen.getByRole('button', { name: /delete row 1/i })
screen.getAllByRole('button', { name: /delete row/i })
```

### State Verification

Each test verifies:
1. **DOM state**: Number of elements, text content
2. **Component state**: Via observable UI changes (row count, total value)
3. **Error state**: Validation error visibility

## Coverage

The new tests cover:
- ✅ Delete button rendering
- ✅ Row deletion functionality
- ✅ Sum recalculation after deletion
- ✅ Validation error cleanup on deletion
- ✅ Clear button rendering
- ✅ Clear button positioning
- ✅ Full table reset on clear
- ✅ Error cleanup on clear
- ✅ Edge cases (empty table, multiple operations)
