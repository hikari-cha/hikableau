# Hikari-6: Row Deletion and Table Clear Implementation

## Overview

This feature implements row deletion functionality and a table clear function for the ColumnSumTable component, allowing users to remove individual rows or reset the entire table to its initial state.

## Features Implemented

### 1. Row Deletion

- **UI**: A circular "minus" (−) delete button appears floating on the right side of each row
- **Visibility**: Button is hidden by default and becomes visible on row hover (using CSS `opacity` and `group-hover`)
- **Design**: Button floats over the Value cell using absolute positioning, does not create a separate column
- **Behavior**: Clicking the button immediately removes the row without confirmation
- **Data Handling**: Associated validation errors are also cleared when a row is deleted

### 2. Table Clear

- **UI**: A "Clear" button positioned to the right of the "Add Row" button
- **Icon**: Uses Trash2 icon from Lucide React
- **Behavior**: Resets the table to its initial state:
  - 1 empty data row
  - All validation errors cleared
  - Import errors cleared

## Files Modified

### Modified Files

- `src/renderer/src/components/ColumnSumTable.tsx` - Added row deletion and clear functionality

## Implementation Details

### ColumnSumTable Component Updates

#### New Imports

```typescript
import { Plus, Download, Upload, Minus, Trash2 } from 'lucide-react'
```

#### New Functions

```typescript
const deleteRow = useCallback((id: string) => {
  setRows((prevRows) => prevRows.filter((row) => row.id !== id))
  setErrors((prevErrors) => prevErrors.filter((e) => e.rowId !== id))
}, [])

const clearTable = useCallback(() => {
  setRows([{ id: crypto.randomUUID(), description: '', value: '' }])
  setErrors([])
  setImportError(null)
}, [])
```

#### Table Structure Changes

1. **Table remains 2 columns** (Description, Value) - delete button does not add a column
2. **Each data row** now includes:
   - CSS class `group` for hover state detection
   - Value cell has `relative` positioning to anchor the delete button
   - Delete button positioned absolutely to appear **outside** the table (to the right)
   - Accessible aria-label: `Delete row {index + 1}`

3. **Delete Button Visibility**:
   - **Hidden when only 1 row exists** - prevents users from having 0 data rows
   - Conditionally rendered: `{rows.length > 1 && <Button>...`

4. **Delete Button Styling**:
   - Circular shape: `rounded-full`
   - Ghost variant for minimal visual footprint
   - Compact sizing: `h-6 w-6 p-0` with smaller icon `h-3 w-3`
   - Absolute positioning: `absolute -right-8 top-1/2 -translate-y-1/2` (positioned outside table)
   - `opacity-0` by default, `group-hover:opacity-100` on row hover
   - Red hover state (`hover:bg-red-100 hover:text-red-600`)

5. **Button Layout Update**:
   - "Add Row" and "Clear" buttons grouped together on the left
   - "Export" and "Import" buttons remain on the right

### UI Design Compliance

Following `ai-docs/design.md` guidelines:
- Uses shadcn/ui `Button` component
- Uses Lucide React icons (`Minus`, `Trash2`)
- Tailwind utility classes only (no custom CSS)
- Focus states supported via shadcn/ui defaults
- Proper spacing with `gap-2` between buttons

## Component State Flow

### Row Deletion Flow
1. User hovers over a row → Delete button becomes visible
2. User clicks delete button → `deleteRow(id)` is called
3. Row is filtered out from `rows` state
4. Associated validation errors are filtered out from `errors` state
5. Sum is automatically recalculated (reactive)

### Table Clear Flow
1. User clicks "Clear" button → `clearTable()` is called
2. `rows` state is reset to single empty row with new UUID
3. `errors` state is cleared
4. `importError` state is cleared
5. Table renders in initial state

## Accessibility

- Delete buttons have descriptive `aria-label`: `Delete row {n}`
- Clear button uses standard button semantics
- Keyboard navigation works as expected (Tab to focus, Enter/Space to activate)

## Edge Cases Handled

1. **Single row protection**: Delete button is hidden when only 1 row exists (minimum 1 data row always)
2. **Validation errors**: Automatically cleared when associated row is deleted
3. **Import errors**: Cleared when table is cleared
4. **Multiple operations**: Clear works correctly after any combination of add/delete operations
