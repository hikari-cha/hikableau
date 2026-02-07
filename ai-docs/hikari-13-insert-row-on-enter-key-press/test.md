# Hikari-13: Insert Row on Enter Key Press - Test Documentation

## Test File

- [src/renderer/src/__tests__/ColumnSumTable.test.tsx](../../src/renderer/src/__tests__/ColumnSumTable.test.tsx)

## Test Suite: Enter Key Row Insertion

### Tests Added

| Test | Description | Status |
|------|-------------|--------|
| should insert a new row below when Enter is pressed in description column | Verifies that pressing Enter in the description column creates a new row | ✅ Pass |
| should insert a new row below when Enter is pressed in value column | Verifies that pressing Enter in the value column creates a new row | ✅ Pass |
| should focus the first input (description) of the newly created row | Confirms focus moves to the new row's description input after pressing Enter in description | ✅ Pass |
| should focus description input of new row when Enter is pressed in value column | Confirms focus moves to the new row's description input after pressing Enter in value column | ✅ Pass |
| should insert row at correct position when Enter is pressed from middle row | Verifies row is inserted below the current row, not at the end | ✅ Pass |
| should preserve existing data when inserting a new row via Enter key | Confirms existing row data and sum calculation remain intact | ✅ Pass |
| should allow multiple consecutive Enter key presses to insert multiple rows | Tests rapid insertion of multiple rows via consecutive Enter presses | ✅ Pass |

### Test Implementation Details

#### Test 1: Insert Row from Description Column
```tsx
it('should insert a new row below when Enter is pressed in description column', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  let descInputs = screen.getAllByRole('textbox', { name: /description/i })
  expect(descInputs).toHaveLength(1)

  await user.type(descInputs[0], '{Enter}')

  descInputs = screen.getAllByRole('textbox', { name: /description/i })
  expect(descInputs).toHaveLength(2)
})
```

#### Test 2: Insert Row from Value Column
```tsx
it('should insert a new row below when Enter is pressed in value column', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  let valueInputs = screen.getAllByRole('textbox', { name: /value/i })
  expect(valueInputs).toHaveLength(1)

  await user.type(valueInputs[0], '{Enter}')

  valueInputs = screen.getAllByRole('textbox', { name: /value/i })
  expect(valueInputs).toHaveLength(2)
})
```

#### Test 3: Focus Management (Description Column)
```tsx
it('should focus the first input (description) of the newly created row', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  const descInputs = screen.getAllByRole('textbox', { name: /description/i })
  await user.type(descInputs[0], '{Enter}')

  const newDescInputs = screen.getAllByRole('textbox', { name: /description/i })
  expect(newDescInputs).toHaveLength(2)
  expect(newDescInputs[1]).toHaveFocus()
})
```

#### Test 4: Focus Management (Value Column)
```tsx
it('should focus description input of new row when Enter is pressed in value column', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
  await user.type(valueInputs[0], '{Enter}')

  const descInputs = screen.getAllByRole('textbox', { name: /description/i })
  expect(descInputs).toHaveLength(2)
  expect(descInputs[1]).toHaveFocus()
})
```

#### Test 5: Correct Insertion Position
```tsx
it('should insert row at correct position when Enter is pressed from middle row', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  // Setup: Create 3 rows with identifiable content
  const addButton = screen.getByRole('button', { name: /add row/i })
  await user.click(addButton)
  await user.click(addButton)

  let descInputs = screen.getAllByRole('textbox', { name: /description/i })
  await user.type(descInputs[0], 'First')
  await user.type(descInputs[1], 'Second')
  await user.type(descInputs[2], 'Third')

  // Press Enter in middle row
  await user.click(descInputs[1])
  await user.keyboard('{Enter}')

  descInputs = screen.getAllByRole('textbox', { name: /description/i })
  expect(descInputs).toHaveLength(4)
  expect(descInputs[0]).toHaveValue('First')
  expect(descInputs[1]).toHaveValue('Second')
  expect(descInputs[2]).toHaveValue('') // New row
  expect(descInputs[3]).toHaveValue('Third')
})
```

#### Test 6: Data Preservation
```tsx
it('should preserve existing data when inserting a new row via Enter key', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  // Setup data
  const addButton = screen.getByRole('button', { name: /add row/i })
  await user.click(addButton)

  let descInputs = screen.getAllByRole('textbox', { name: /description/i })
  let valueInputs = screen.getAllByRole('textbox', { name: /value/i })
  
  await user.type(descInputs[0], 'Item A')
  await user.type(valueInputs[0], '100')
  await user.type(descInputs[1], 'Item B')
  await user.type(valueInputs[1], '200')

  // Insert row via Enter
  await user.click(descInputs[0])
  await user.keyboard('{Enter}')

  // Verify data integrity
  descInputs = screen.getAllByRole('textbox', { name: /description/i })
  valueInputs = screen.getAllByRole('textbox', { name: /value/i })

  expect(descInputs).toHaveLength(3)
  expect(descInputs[0]).toHaveValue('Item A')
  expect(valueInputs[0]).toHaveValue('100')
  expect(descInputs[1]).toHaveValue('') // New row
  expect(valueInputs[1]).toHaveValue('') // New row
  expect(descInputs[2]).toHaveValue('Item B')
  expect(valueInputs[2]).toHaveValue('200')

  const totalRow = screen.getByText('Total').closest('tr')
  expect(totalRow).toHaveTextContent('300')
})
```

#### Test 7: Multiple Consecutive Insertions
```tsx
it('should allow multiple consecutive Enter key presses to insert multiple rows', async () => {
  const user = userEvent.setup()
  render(<ColumnSumTable />)

  const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
  
  await user.type(descInput, '{Enter}')
  expect(screen.getAllByRole('textbox', { name: /description/i })).toHaveLength(2)
  
  await user.keyboard('{Enter}')
  expect(screen.getAllByRole('textbox', { name: /description/i })).toHaveLength(3)
  
  await user.keyboard('{Enter}')
  expect(screen.getAllByRole('textbox', { name: /description/i })).toHaveLength(4)
})
```

## Test Execution Results

```
 Test Files  2 passed (2)
      Tests  105 passed (105)
   Start at  17:51:42
   Duration  14.95s
```

All 105 tests pass, including:
- 51 CSV utility tests
- 47 existing ColumnSumTable tests
- 7 new Enter key row insertion tests

## Test Coverage

The new tests cover:

1. **Basic functionality** - Row insertion from both columns
2. **Focus management** - Automatic focus on new row's description input
3. **Position accuracy** - Insertion at correct position (below current row)
4. **Data integrity** - Existing data and calculations preserved
5. **Rapid input** - Multiple consecutive Enter key presses handled correctly