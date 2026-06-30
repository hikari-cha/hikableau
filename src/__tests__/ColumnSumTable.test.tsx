import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnSumTable } from '../components/ColumnSumTable'

describe('ColumnSumTable', () => {
  beforeEach(() => {
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

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()

      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(1)

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

      const descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  describe('Sum Calculation', () => {
    it('should calculate sum of positive integers', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

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

      const errorMessage = screen.getByText(/value must be a valid number/i)
      expect(errorMessage).toHaveClass('text-red-500')
    })

    it('should treat whitespace-only input as empty (no error)', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '   ')

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should trim whitespace from numeric input and accept it', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '  123  ')

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('123')
    })

    it('should show error for text with leading/trailing whitespace that is not a number', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '  abc  ')

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

      const deleteButtons = screen.queryAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('should render a delete button for each row when multiple rows exist', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(2)
    })

    it('should delete a row when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      let descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(3)

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[1])

      descriptionInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descriptionInputs).toHaveLength(2)
    })

    it('should remove row data from sum calculation when deleted', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      await user.type(valueInputs[0], '100')
      await user.type(valueInputs[1], '50')

      let totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('150')

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[0])

      totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('50')
    })

    it('should hide delete button when deleting down to one row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      let deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(2)

      await user.click(deleteButtons[0])

      deleteButtons = screen.queryAllByRole('button', { name: /delete row/i })
      expect(deleteButtons).toHaveLength(0)
    })

    it('should clear validation errors when row is deleted', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'invalid')

      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[0])

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should have delete button with minus icon', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      const deleteButton = screen.getByRole('button', { name: /delete row 1/i })
      expect(deleteButton).toBeInTheDocument()

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

      expect(addButton.parentElement).toBe(clearButton.parentElement)
    })

    it('should reset table to initial state when Clear is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      await user.type(descInputs[0], 'Item A')
      await user.type(valueInputs[0], '100')
      await user.type(descInputs[1], 'Item B')
      await user.type(valueInputs[1], '200')

      expect(screen.getAllByRole('textbox', { name: /description/i })).toHaveLength(3)
      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('300')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      const newDescInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(newDescInputs).toHaveLength(1)
      expect(newDescInputs[0]).toHaveValue('')

      const newValueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(newValueInputs[0]).toHaveValue('')

      const newTotalRow = screen.getByText('Total').closest('tr')
      expect(newTotalRow).toHaveTextContent('0')
    })

    it('should clear validation errors when Clear is clicked', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, 'invalid')

      expect(screen.getByText(/value must be a valid number/i)).toBeInTheDocument()

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      expect(screen.queryByText(/value must be a valid number/i)).not.toBeInTheDocument()
    })

    it('should work correctly after multiple add/delete operations', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      const deleteButtons = screen.getAllByRole('button', { name: /delete row/i })
      await user.click(deleteButtons[1])

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(1)
      expect(descInputs[0]).toHaveValue('')
    })
  })

  describe('Enter Key Row Insertion', () => {
    it('should insert a new row below when Enter is pressed in description column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(1)

      await user.type(descInputs[0], '{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)
    })

    it('should insert a new row below when Enter is pressed in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      let valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(valueInputs).toHaveLength(1)

      await user.type(valueInputs[0], '{Enter}')

      valueInputs = screen.getAllByRole('textbox', { name: /value/i })
      expect(valueInputs).toHaveLength(2)
    })

    it('should focus the first input (description) of the newly created row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })

      await user.type(descInputs[0], '{Enter}')

      const newDescInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(newDescInputs).toHaveLength(2)

      expect(newDescInputs[1]).toHaveFocus()
    })

    it('should focus description input of new row when Enter is pressed in value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      await user.type(valueInputs[0], '{Enter}')

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)

      expect(descInputs[1]).toHaveFocus()
    })

    it('should insert row at correct position when Enter is pressed from middle row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      await user.type(descInputs[0], 'First')
      await user.type(descInputs[1], 'Second')
      await user.type(descInputs[2], 'Third')

      await user.click(descInputs[1])
      await user.keyboard('{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)

      expect(descInputs[0]).toHaveValue('First')
      expect(descInputs[1]).toHaveValue('Second')
      expect(descInputs[2]).toHaveValue('')
      expect(descInputs[3]).toHaveValue('Third')
    })

    it('should preserve existing data when inserting a new row via Enter key', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      let valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      await user.type(descInputs[0], 'Item A')
      await user.type(valueInputs[0], '100')
      await user.type(descInputs[1], 'Item B')
      await user.type(valueInputs[1], '200')

      await user.click(descInputs[0])
      await user.keyboard('{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      expect(descInputs).toHaveLength(3)
      expect(descInputs[0]).toHaveValue('Item A')
      expect(valueInputs[0]).toHaveValue('100')
      expect(descInputs[1]).toHaveValue('')
      expect(valueInputs[1]).toHaveValue('')
      expect(descInputs[2]).toHaveValue('Item B')
      expect(valueInputs[2]).toHaveValue('200')

      const totalRow = screen.getByText('Total').closest('tr')
      expect(totalRow).toHaveTextContent('300')
    })

    it('should allow multiple consecutive Enter presses to insert multiple rows', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      await user.type(descInput, '{Enter}')

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(2)

      await user.keyboard('{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(3)

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

      await user.keyboard('{Enter}')

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      await user.keyboard('Second Item')

      expect(descInputs[1]).toHaveValue('Second Item')
      expect(descInputs[0]).toHaveValue('First Item')
    })

    it('should be in ready-to-type state after Enter key inserts a new row from value column', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.type(valueInput, '100')

      await user.keyboard('{Enter}')

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      await user.keyboard('New Item')

      expect(descInputs[1]).toHaveValue('New Item')
    })

    it('should focus description (not value) column of new row regardless of which column Enter was pressed in', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const valueInput = screen.getByRole('textbox', { name: /value for row 1/i })
      await user.click(valueInput)
      await user.keyboard('{Enter}')

      const descInputs = screen.getAllByRole('textbox', { name: /description/i })
      const valueInputs = screen.getAllByRole('textbox', { name: /value/i })

      expect(descInputs[1]).toHaveFocus()
      expect(valueInputs[1]).not.toHaveFocus()
    })

    it('should auto-focus when inserting from the last row of the table', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const addButton = screen.getByRole('button', { name: /add row/i })
      await user.click(addButton)
      await user.click(addButton)

      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      await user.click(descInputs[2])
      await user.keyboard('{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)
      expect(descInputs[3]).toHaveFocus()
    })

    it('should auto-focus when inserting from a middle row with data', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

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

      await user.click(valueInputs[1])
      await user.keyboard('{Enter}')

      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs).toHaveLength(4)
      expect(descInputs[2]).toHaveFocus()
      expect(descInputs[2]).toHaveValue('')

      expect(descInputs[0]).toHaveValue('Alpha')
      expect(descInputs[1]).toHaveValue('Beta')
      expect(descInputs[3]).toHaveValue('Gamma')
    })

    it('should support rapid sequential Enter presses with auto-focus on each new row', async () => {
      const user = userEvent.setup()
      render(<ColumnSumTable />)

      const descInput = screen.getByRole('textbox', { name: /description for row 1/i })
      await user.click(descInput)

      await user.keyboard('{Enter}')
      let descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[1]).toHaveFocus()

      await user.keyboard('Row 2{Enter}')
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[2]).toHaveFocus()

      await user.keyboard('Row 3{Enter}')
      descInputs = screen.getAllByRole('textbox', { name: /description/i })
      expect(descInputs[3]).toHaveFocus()

      expect(descInputs[0]).toHaveValue('')
      expect(descInputs[1]).toHaveValue('Row 2')
      expect(descInputs[2]).toHaveValue('Row 3')
      expect(descInputs[3]).toHaveValue('')
    })
  })
})
