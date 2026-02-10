import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnSumTable } from '../components/ColumnSumTable'

describe('ColumnSumTable', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    let counter = 0
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => `test-uuid-${counter++}`
      },
      writable: true
    })
  })

  describe('Initial Rendering', () => {
    it('should render with 2 rows by default (1 data row + 1 total row)', () => {
      render(<ColumnSumTable />)

      // Check table headers
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()

      // Check for 1 data row input
      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(1)

      // Check Total row exists
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('should display Total as 0 when all values are empty', () => {
      render(<ColumnSumTable />)

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('0')
    })

    it('should have left-aligned column headers', () => {
      render(<ColumnSumTable />)

      const descHeader = screen.getByText('Description')
      const valueHeader = screen.getByText('Value')

      expect(descHeader).toHaveClass('text-left')
      expect(valueHeader).toHaveClass('text-left')
    })

    it('should display grid lines (borders)', () => {
      render(<ColumnSumTable />)

      const table = document.querySelector('table')
      expect(table).toHaveClass('border')
    })
  })

  describe('Adding Rows', () => {
    it('should add a new row when clicking the "+" button', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(2)
    })

    it('should allow adding multiple rows', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })

      await user.click(addButton)
      await user.click(addButton)
      await user.click(addButton)

      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(4)
    })

    it('should maintain minimum of 2 rows (1 data + total)', () => {
      render(<ColumnSumTable />)

      // Verify we can't go below 2 rows (no delete functionality by design)
      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  describe('Sum Calculation', () => {
    it('should calculate sum of positive integers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add rows and input values
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '10')
      await user.type(valueInputs[1], '20')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('30')
    })

    it('should calculate sum with negative numbers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '100')
      await user.type(valueInputs[1], '-30')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('70')
    })

    it('should calculate sum with floating-point numbers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '10.5')
      await user.type(valueInputs[1], '20.3')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('30.8')
    })

    it('should handle mixed positive, negative, and decimal values', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '100.5')
      await user.type(valueInputs[1], '-50.25')
      await user.type(valueInputs[2], '25.75')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('76')
    })

    it('should ignore invalid values in sum calculation', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '50')
      await user.type(valueInputs[1], 'abc')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('50')
    })

    it('should update sum when values change', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '100')

      let totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('100')

      await user.clear(valueInput)
      await user.type(valueInput, '200')

      totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('200')
    })
  })

  describe('Data Validation', () => {
    it('should accept string input in description column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      await user.type(descInput, 'Test Item')

      expect(descInput).toHaveValue('Test Item')
      // No error should be shown
      expect(screen.queryByText(/must be a string/i)).not.toBeInTheDocument()
    })

    it('should show error for non-numeric value in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'abc')

      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()
    })

    it('should clear error when valid number is entered', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'abc')

      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()

      await user.clear(valueInput)
      await user.type(valueInput, '123')

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should accept negative numbers in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '-50')

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
      expect(valueInput).toHaveValue('-50')
    })

    it('should accept decimal numbers in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '3.14159')

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
      expect(valueInput).toHaveValue('3.14159')
    })

    it('should show validation error styling on invalid input', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'invalid')

      // Error message should be visible
      const errorMessage = screen.getByText(/value must be a valid number/i)
      expect(errorMessage).toHaveClass('text-red-500')
    })

    it('should treat whitespace-only input as empty (no error)', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '   ')

      // No error should be shown for whitespace-only input
      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should trim whitespace from numeric input and accept it', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '  123  ')

      // No error should be shown
      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()

      // Total should be 123 (trimmed value)
      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('123')
    })

    it('should show error for text with leading/trailing whitespace that is not a number', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '  abc  ')

      // Error should be shown after trimming
      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()
    })
  })

  describe('Table Structure', () => {
    it('should have exactly 2 columns', () => {
      render(<ColumnSumTable />)

      const headerCells = document.querySelectorAll('thead th')
      expect(headerCells).toHaveLength(2)
    })

    it('should not display any title above the table', () => {
      render(<ColumnSumTable />)

      // No h1, h2, etc. should exist with table-related titles
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should use Description and Value as column headers (not Column 1/2)', () => {
      render(<ColumnSumTable />)

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()
      expect(screen.queryByText(/column 1/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/column 2/i)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      render(<ColumnSumTable />)

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('0')
    })

    it('should handle very large numbers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '999999999999')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('999,999,999,999')
    })

    it('should handle very small decimal numbers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '0.000001')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('0.000001')
    })

    it('should handle zero values', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '0')
      await user.type(valueInputs[1], '0')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('0')
    })
  })

  describe('Import/Export UI', () => {
    it('should render Import and Export buttons', () => {
      render(<ColumnSumTable />)

      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    })

    it('should position Export and Import buttons on the right side', () => {
      render(<ColumnSumTable />)

      const importButton = screen.getByRole('button', { name: /import/i })

      // Both buttons should be in a flex container on the right
      const buttonContainer = importButton.parentElement
      expect(buttonContainer).toHaveClass('flex', 'gap-2')
    })

    it('should render export options with defaults unchecked', () => {
      render(<ColumnSumTable />)

      const includeHeaderCheckbox = screen.getByRole('checkbox', { name: /include header row/i })
      const includeTotalCheckbox = screen.getByRole('checkbox', { name: /include total row/i })

      expect(includeHeaderCheckbox).not.toBeChecked()
      expect(includeTotalCheckbox).not.toBeChecked()
    })

    it('should render import options with defaults unchecked', () => {
      render(<ColumnSumTable />)

      const skipHeaderCheckbox = screen.getByRole('checkbox', { name: /skip header row/i })
      const skipTotalCheckbox = screen.getByRole('checkbox', { name: /skip total.*row/i })

      expect(skipHeaderCheckbox).not.toBeChecked()
      expect(skipTotalCheckbox).not.toBeChecked()
    })

    it('should toggle export options when clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const includeHeaderCheckbox = screen.getByRole('checkbox', { name: /include header row/i })
      const includeTotalCheckbox = screen.getByRole('checkbox', { name: /include total row/i })

      await user.click(includeHeaderCheckbox)
      await user.click(includeTotalCheckbox)

      expect(includeHeaderCheckbox).toBeChecked()
      expect(includeTotalCheckbox).toBeChecked()
    })

    it('should toggle import options when clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const skipHeaderCheckbox = screen.getByRole('checkbox', { name: /skip header row/i })
      const skipTotalCheckbox = screen.getByRole('checkbox', { name: /skip total.*row/i })

      await user.click(skipHeaderCheckbox)
      await user.click(skipTotalCheckbox)

      expect(skipHeaderCheckbox).toBeChecked()
      expect(skipTotalCheckbox).toBeChecked()
    })
  })

  describe('Row Deletion', () => {
    it('should not render delete button when only one row exists', () => {
      render(<ColumnSumTable />)

      // With only 1 row, no delete button should be visible
      const deleteButtons = screen.queryAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('should render a delete button for each row when multiple rows exist', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a second row
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      // Should have 2 delete buttons (one per row)
      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(2)
    })

    it('should delete a row when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add two more rows
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      // Should have 3 rows
      let descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(3)

      // Delete the second row
      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[1])

      // Should now have 2 rows
      descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(2)
    })

    it('should remove row data from sum calculation when deleted', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a row
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      // Enter values
      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '100')
      await user.type(valueInputs[1], '50')

      let totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('150')

      // Delete the first row (with value 100)
      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[0])

      // Total should now be 50
      totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('50')
    })

    it('should hide delete button when deleting down to one row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a row (now we have 2)
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      // Should have 2 delete buttons
      let deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(2)

      // Delete one row
      await user.click(deleteButtons[0])

      // Now only 1 row remains, so no delete buttons should be visible
      deleteButtons = screen.queryAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('should clear validation errors when row is deleted', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a row (need 2 rows to have delete button)
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      // Enter an invalid value in row 1
      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'invalid')

      // Error should be visible
      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()

      // Delete row 1
      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[0])

      // Error should be gone
      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should have delete button with minus icon', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a row to make delete buttons visible
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const deleteButton = screen.getByRole('button', { name: /delete row 1/i })
      expect(deleteButton).toBeInTheDocument()

      // The button should contain an SVG (the Minus icon)
      const svg = deleteButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Table Clear', () => {
    it('should render a Clear button', () => {
      render(<ColumnSumTable />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should position Clear button next to Add Row button', () => {
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      const clearButton = screen.getByRole('button', { name: /clear/i })

      // Both should be in the same parent container
      expect(addButton.parentElement).toBe(clearButton.parentElement)
    })

    it('should reset table to initial state when Clear is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add rows and enter data
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      await user.type(descInputs[0], 'Item A')
      await user.type(valueInputs[0], '100')
      await user.type(descInputs[1], 'Item B')
      await user.type(valueInputs[1], '200')

      // Verify data is entered
      expect(screen.getAllByRole('textbox', { name: /description/i })).toHaveLength(3)
      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('300')

      // Click Clear
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      // Should reset to initial state (1 empty row)
      const newDescInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(newDescInputs).toHaveLength(1)
      expect(newDescInputs[0]).toHaveValue('')

      const newValueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(newValueInputs[0]).toHaveValue('')

      // Total should be 0
      const newTotalRow = screen.getByText('Total').closest('tr')
      expect(newTotalRow).toHaveTextContent('0')
    })

    it('should clear validation errors when Clear is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Enter an invalid value
      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'invalid')

      // Error should be visible
      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()

      // Click Clear
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      // Error should be gone
      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should work correctly after multiple add/delete operations', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add and delete some rows
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[1])

      // Now clear
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      // Should be back to initial state
      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(1)
      expect(descInputs[0]).toHaveValue('')
    })
  })

  describe('Enter Key Row Insertion', () => {
    it('should insert a new row below when Enter is pressed in description column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Initially 1 data row
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(1)

      // Press Enter in the description input
      await user.type(descInputs[0], '{Enter}')

      // Should now have 2 data rows
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)
    })

    it('should insert a new row below when Enter is pressed in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Initially 1 data row
      let valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(valueInputs).toHaveLength(1)

      // Press Enter in the value input
      await user.type(valueInputs[0], '{Enter}')

      // Should now have 2 data rows
      valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(valueInputs).toHaveLength(2)
    })

    it('should focus the first input (description) of the newly created row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      
      // Press Enter in the first row's description
      await user.type(descInputs[0], '{Enter}')

      // Get the new description inputs
      const newDescInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(newDescInputs).toHaveLength(2)

      // The second row's description input should be focused
      expect(newDescInputs[1]).toHaveFocus()
    })

    it('should focus description input of new row when Enter is pressed in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      
      // Press Enter in the value column
      await user.type(valueInputs[0], '{Enter}')

      // Get the new description inputs
      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)

      // The second row's description input should be focused
      expect(descInputs[1]).toHaveFocus()
    })

    it('should insert row at correct position when Enter is pressed from middle row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add two rows first (total 3 rows)
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      // Type in each row to identify them
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      await user.type(descInputs[0], 'First')
      await user.type(descInputs[1], 'Second')
      await user.type(descInputs[2], 'Third')

      // Press Enter in the second row's description
      await user.click(descInputs[1])
      await user.keyboard('{Enter}')

      // Should now have 4 rows
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)

      // Order should be: First, Second, (empty new row), Third
      expect(descInputs[0]).toHaveValue('First')
      expect(descInputs[1]).toHaveValue('Second')
      expect(descInputs[2]).toHaveValue('') // Newly inserted row
      expect(descInputs[3]).toHaveValue('Third')
    })

    it('should preserve existing data when inserting a new row via Enter key', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add a row and enter data
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      let valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      
      await user.type(descInputs[0], 'Item A')
      await user.type(valueInputs[0], '100')
      await user.type(descInputs[1], 'Item B')
      await user.type(valueInputs[1], '200')

      // Press Enter in first row
      await user.click(descInputs[0])
      await user.keyboard('{Enter}')

      // Check that all data is preserved
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      expect(descInputs).toHaveLength(3)
      expect(descInputs[0]).toHaveValue('Item A')
      expect(valueInputs[0]).toHaveValue('100')
      expect(descInputs[1]).toHaveValue('') // New row
      expect(valueInputs[1]).toHaveValue('') // New row
      expect(descInputs[2]).toHaveValue('Item B')
      expect(valueInputs[2]).toHaveValue('200')

      // Total should still be 300
      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('300')
    })

    it('should allow multiple consecutive Enter key presses to insert multiple rows', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      
      // Press Enter 3 times
      await user.type(descInput, '{Enter}')
      
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)
      
      // Focus should now be on row 2, press Enter again
      await user.keyboard('{Enter}')
      
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(3)
      
      // Focus should now be on row 3, press Enter again
      await user.keyboard('{Enter}')
      
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)
    })
  })

  describe('Auto Focus on Row Insertion', () => {
    it('should be in ready-to-type state after Enter key inserts a new row from description column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      await user.type(descInput, 'First Item')

      // Press Enter to insert a new row
      await user.keyboard('{Enter}')

      // The new row's description input should be focused
      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      // Type immediately into the new row to verify ready-to-type state
      await user.keyboard('Second Item')

      // Verify the text was entered into the new row
      expect(descInputs[1]).toHaveValue('Second Item')
      // Original row should still have its value
      expect(descInputs[0]).toHaveValue('First Item')
    })

    it('should be in ready-to-type state after Enter key inserts a new row from value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '100')

      // Press Enter in value column to insert a new row
      await user.keyboard('{Enter}')

      // Focus should move to the DESCRIPTION column (first column) of the new row
      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      // Type immediately to verify ready-to-type state
      await user.keyboard('New Item')

      expect(descInputs[1]).toHaveValue('New Item')
    })

    it('should focus description (not value) column of new row regardless of which column Enter was pressed in', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Press Enter from the value column
      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.click(valueInput)
      await user.keyboard('{Enter}')

      // Focus should be on the description input of the new row, NOT the value input
      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      expect(descInputs[1]).toHaveFocus()
      expect(valueInputs[1]).not.toHaveFocus()
    })

    it('should auto-focus when inserting from the last row of the table', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add two more rows via Add Row button
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      // Press Enter in the last row's description
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      await user.click(descInputs[2]) // last row (index 2)
      await user.keyboard('{Enter}')

      // Should now have 4 rows, and the new row at index 3 should be focused
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)
      expect(descInputs[3]).toHaveFocus()
    })

    it('should auto-focus when inserting from a middle row with data', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      // Add rows and enter data
      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      let valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      await user.type(descInputs[0], 'Alpha')
      await user.type(valueInputs[0], '10')
      await user.type(descInputs[1], 'Beta')
      await user.type(valueInputs[1], '20')
      await user.type(descInputs[2], 'Gamma')
      await user.type(valueInputs[2], '30')

      // Press Enter in the middle row's value column
      await user.click(valueInputs[1])
      await user.keyboard('{Enter}')

      // New row should be inserted after Beta, and its description should be focused
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)
      expect(descInputs[2]).toHaveFocus() // new row at index 2
      expect(descInputs[2]).toHaveValue('') // should be empty

      // Verify order: Alpha, Beta, (new empty), Gamma
      expect(descInputs[0]).toHaveValue('Alpha')
      expect(descInputs[1]).toHaveValue('Beta')
      expect(descInputs[3]).toHaveValue('Gamma')
    })

    it('should support rapid sequential Enter presses with auto-focus on each new row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      await user.click(descInput)

      // Press Enter 3 times rapidly; each press should focus the new row
      await user.keyboard('{Enter}')
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      // Type something and press Enter again
      await user.keyboard('Row 2{Enter}')
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[2]).toHaveFocus()

      await user.keyboard('Row 3{Enter}')
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[3]).toHaveFocus()

      // Verify all rows have correct data
      expect(descInputs[0]).toHaveValue('')
      expect(descInputs[1]).toHaveValue('Row 2')
      expect(descInputs[2]).toHaveValue('Row 3')
      expect(descInputs[3]).toHaveValue('') // latest new row
    })
  })
})
