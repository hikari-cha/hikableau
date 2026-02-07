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
      expect(totalRow).toHaveTextContent('999999999999')
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
})
