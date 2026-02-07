import { describe, it, expect } from 'vitest'
import {
  exportToCsv,
  importFromCsv,
  CsvImportError,
  type CsvRow,
  type ExportOptions,
  type ImportOptions
} from '@renderer/lib/csv'

describe('CSV Export', () => {
  const sampleRows: CsvRow[] = [
    { description: 'Item 1', value: '100' },
    { description: 'Item 2', value: '200' },
    { description: 'Item 3', value: '50.5' }
  ]

  describe('exportToCsv', () => {
    it('should export data rows only when no options are enabled', () => {
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(sampleRows, 350.5, options)

      expect(result).toBe('Item 1,100\nItem 2,200\nItem 3,50.5')
    })

    it('should include header row when includeHeader is true', () => {
      const options: ExportOptions = { includeHeader: true, includeTotal: false }
      const result = exportToCsv(sampleRows, 350.5, options)

      expect(result).toBe('Description,Value\nItem 1,100\nItem 2,200\nItem 3,50.5')
    })

    it('should include total row when includeTotal is true', () => {
      const options: ExportOptions = { includeHeader: false, includeTotal: true }
      const result = exportToCsv(sampleRows, 350.5, options)

      expect(result).toBe('Item 1,100\nItem 2,200\nItem 3,50.5\nTotal,350.5')
    })

    it('should include both header and total when both options are true', () => {
      const options: ExportOptions = { includeHeader: true, includeTotal: true }
      const result = exportToCsv(sampleRows, 350.5, options)

      expect(result).toBe('Description,Value\nItem 1,100\nItem 2,200\nItem 3,50.5\nTotal,350.5')
    })

    it('should handle empty rows array', () => {
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv([], 0, options)

      expect(result).toBe('')
    })

    it('should handle empty rows with header and total', () => {
      const options: ExportOptions = { includeHeader: true, includeTotal: true }
      const result = exportToCsv([], 0, options)

      expect(result).toBe('Description,Value\nTotal,0')
    })

    it('should escape fields containing commas', () => {
      const rows: CsvRow[] = [{ description: 'Item, with comma', value: '100' }]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 100, options)

      expect(result).toBe('"Item, with comma",100')
    })

    it('should escape fields containing quotes', () => {
      const rows: CsvRow[] = [{ description: 'Item "quoted"', value: '100' }]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 100, options)

      expect(result).toBe('"Item ""quoted""",100')
    })

    it('should escape fields containing newlines', () => {
      const rows: CsvRow[] = [{ description: 'Item\nwith newline', value: '100' }]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 100, options)

      expect(result).toBe('"Item\nwith newline",100')
    })

    it('should format integer totals without decimal', () => {
      const options: ExportOptions = { includeHeader: false, includeTotal: true }
      const result = exportToCsv([{ description: 'Item', value: '100' }], 100, options)

      expect(result).toBe('Item,100\nTotal,100')
    })

    it('should format decimal totals correctly', () => {
      const options: ExportOptions = { includeHeader: false, includeTotal: true }
      const result = exportToCsv([{ description: 'Item', value: '99.99' }], 99.99, options)

      expect(result).toBe('Item,99.99\nTotal,99.99')
    })

    it('should skip rows where both description and value are empty', () => {
      const rows: CsvRow[] = [
        { description: 'Item 1', value: '100' },
        { description: '', value: '' },
        { description: '  ', value: '  ' },
        { description: 'Item 2', value: '200' }
      ]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 300, options)

      expect(result).toBe('Item 1,100\nItem 2,200')
    })

    it('should include rows where only description is empty', () => {
      const rows: CsvRow[] = [{ description: '', value: '100' }]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 100, options)

      expect(result).toBe(',100')
    })

    it('should include rows where only value is empty', () => {
      const rows: CsvRow[] = [{ description: 'Item 1', value: '' }]
      const options: ExportOptions = { includeHeader: false, includeTotal: false }
      const result = exportToCsv(rows, 0, options)

      expect(result).toBe('Item 1,')
    })

    describe('CSV Injection Prevention', () => {
      it('should sanitize fields starting with equals sign', () => {
        const rows: CsvRow[] = [{ description: '=1+1', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe("'=1+1,100")
      })

      it('should sanitize fields starting with plus sign', () => {
        const rows: CsvRow[] = [{ description: '+1+1', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe("'+1+1,100")
      })

      it('should sanitize fields starting with minus sign', () => {
        const rows: CsvRow[] = [{ description: '-1+1', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe("'-1+1,100")
      })

      it('should sanitize fields starting with at sign', () => {
        const rows: CsvRow[] = [{ description: '@SUM(A1:A10)', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe("'@SUM(A1:A10),100")
      })

      it('should sanitize and quote fields with formula and comma', () => {
        const rows: CsvRow[] = [{ description: '=1+1, test', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe('"\'=1+1, test",100')
      })

      it('should sanitize and quote fields with formula and quotes', () => {
        const rows: CsvRow[] = [{ description: '=1+"test"', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe('"\'=1+""test""",100')
      })

      it('should sanitize and quote fields with formula and newline', () => {
        const rows: CsvRow[] = [{ description: '=1+1\ntest', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe('"\'=1+1\ntest",100')
      })

      it('should sanitize value field starting with formula character', () => {
        const rows: CsvRow[] = [{ description: 'Item 1', value: '=SUM(A1:A10)' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 0, options)

        expect(result).toBe("Item 1,'=SUM(A1:A10)")
      })

      it('should not sanitize negative numbers in value field', () => {
        const rows: CsvRow[] = [{ description: 'Item 1', value: '-100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, -100, options)

        expect(result).toBe("Item 1,'-100")
      })

      it('should handle empty fields correctly', () => {
        const rows: CsvRow[] = [{ description: '', value: '100' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 100, options)

        expect(result).toBe(',100')
      })

      it('should sanitize multiple dangerous fields in same row', () => {
        const rows: CsvRow[] = [{ description: '=1+1', value: '@SUM(A1)' }]
        const options: ExportOptions = { includeHeader: false, includeTotal: false }
        const result = exportToCsv(rows, 0, options)

        expect(result).toBe("'=1+1,'@SUM(A1)")
      })
    })
  })
})

describe('CSV Import', () => {
  describe('importFromCsv', () => {
    it('should import basic CSV data', () => {
      const csvContent = 'Item 1,100\nItem 2,200'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })

    it('should skip header row when skipHeader is true', () => {
      const csvContent = 'Description,Value\nItem 1,100\nItem 2,200'
      const options: ImportOptions = { skipHeader: true, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })

    it('should skip total row when skipTotal is true', () => {
      const csvContent = 'Item 1,100\nItem 2,200\nTotal,300'
      const options: ImportOptions = { skipHeader: false, skipTotal: true }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })

    it('should skip both header and total when both options are true', () => {
      const csvContent = 'Description,Value\nItem 1,100\nItem 2,200\nTotal,300'
      const options: ImportOptions = { skipHeader: true, skipTotal: true }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })

    it('should handle Windows line endings (CRLF)', () => {
      const csvContent = 'Item 1,100\r\nItem 2,200'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })

    it('should handle quoted fields', () => {
      const csvContent = '"Item, with comma",100\n"Item ""quoted""",200'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item, with comma', value: '100' },
        { description: 'Item "quoted"', value: '200' }
      ])
    })

    it('should handle empty values', () => {
      const csvContent = 'Item 1,\n,200'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '' },
        { description: '', value: '200' }
      ])
    })

    it('should handle decimal values', () => {
      const csvContent = 'Item 1,100.50\nItem 2,200.75'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100.50' },
        { description: 'Item 2', value: '200.75' }
      ])
    })

    it('should handle negative values', () => {
      const csvContent = 'Item 1,-100\nItem 2,-200.5'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '-100' },
        { description: 'Item 2', value: '-200.5' }
      ])
    })

    it('should ignore empty lines', () => {
      const csvContent = 'Item 1,100\n\nItem 2,200\n'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }
      const result = importFromCsv(csvContent, options)

      expect(result).toEqual([
        { description: 'Item 1', value: '100' },
        { description: 'Item 2', value: '200' }
      ])
    })
  })

  describe('Validation Errors', () => {
    it('should throw error for empty CSV file', () => {
      const csvContent = ''
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('CSV file is empty')
    })

    it('should throw error for file with only whitespace', () => {
      const csvContent = '   \n   \n   '
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('CSV file is empty')
    })

    it('should throw error when no data rows after skipping header and total', () => {
      const csvContent = 'Header\nTotal'
      const options: ImportOptions = { skipHeader: true, skipTotal: true }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('No data rows found')
    })

    it('should throw error for row with wrong column count (too few)', () => {
      const csvContent = 'Item 1,100\nItem 2'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('Expected 2 columns, found 1')
    })

    it('should throw error for row with wrong column count (too many)', () => {
      const csvContent = 'Item 1,100\nItem 2,200,extra'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('Expected 2 columns, found 3')
    })

    it('should throw error for non-numeric value in column 2', () => {
      const csvContent = 'Item 1,100\nItem 2,not-a-number'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('Column 2 must be a valid number')
    })

    it('should throw error for Infinity in column 2', () => {
      const csvContent = 'Item 1,100\nItem 2,Infinity'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('Column 2 must be a valid number')
    })

    it('should throw error for -Infinity in column 2', () => {
      const csvContent = 'Item 1,100\nItem 2,-Infinity'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow(CsvImportError)
      expect(() => importFromCsv(csvContent, options)).toThrow('Column 2 must be a valid number')
    })

    it('should include row number in error message', () => {
      const csvContent = 'Item 1,100\nItem 2,invalid'
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow('Row 2:')
    })

    it('should account for skipped header in row number', () => {
      const csvContent = 'Header,Value\nItem 1,100\nItem 2,invalid'
      const options: ImportOptions = { skipHeader: true, skipTotal: false }

      expect(() => importFromCsv(csvContent, options)).toThrow('Row 3:')
    })

    it('should have correct error name', () => {
      const csvContent = ''
      const options: ImportOptions = { skipHeader: false, skipTotal: false }

      try {
        importFromCsv(csvContent, options)
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(CsvImportError)
        expect((err as CsvImportError).name).toBe('Import Error')
      }
    })
  })
})

describe('Round-trip Export/Import', () => {
  it('should round-trip data correctly with header and total', () => {
    const originalRows: CsvRow[] = [
      { description: 'Item 1', value: '100' },
      { description: 'Item 2', value: '200' }
    ]
    const total = 300

    const exportOptions: ExportOptions = { includeHeader: true, includeTotal: true }
    const importOptions: ImportOptions = { skipHeader: true, skipTotal: true }

    const csvContent = exportToCsv(originalRows, total, exportOptions)
    const importedRows = importFromCsv(csvContent, importOptions)

    expect(importedRows).toEqual(originalRows)
  })

  it('should round-trip data correctly without header and total', () => {
    const originalRows: CsvRow[] = [
      { description: 'Item 1', value: '100' },
      { description: 'Item 2', value: '200' }
    ]
    const total = 300

    const exportOptions: ExportOptions = { includeHeader: false, includeTotal: false }
    const importOptions: ImportOptions = { skipHeader: false, skipTotal: false }

    const csvContent = exportToCsv(originalRows, total, exportOptions)
    const importedRows = importFromCsv(csvContent, importOptions)

    expect(importedRows).toEqual(originalRows)
  })

  it('should round-trip data with special characters', () => {
    const originalRows: CsvRow[] = [
      { description: 'Item, with comma', value: '100' },
      { description: 'Item "quoted"', value: '200' }
    ]
    const total = 300

    const exportOptions: ExportOptions = { includeHeader: false, includeTotal: false }
    const importOptions: ImportOptions = { skipHeader: false, skipTotal: false }

    const csvContent = exportToCsv(originalRows, total, exportOptions)
    const importedRows = importFromCsv(csvContent, importOptions)

    expect(importedRows).toEqual(originalRows)
  })

  it('should round-trip data with formula characters', () => {
    const originalRows: CsvRow[] = [
      { description: '=1+1', value: '100' },
      { description: '+test', value: '200' },
      { description: '-test', value: '300' },
      { description: '@SUM(A1:A10)', value: '400' }
    ]
    const total = 1000

    const exportOptions: ExportOptions = { includeHeader: false, includeTotal: false }
    const importOptions: ImportOptions = { skipHeader: false, skipTotal: false }

    const csvContent = exportToCsv(originalRows, total, exportOptions)
    const importedRows = importFromCsv(csvContent, importOptions)

    expect(importedRows).toEqual(originalRows)
  })

  it('should round-trip data with formula characters and special CSV characters', () => {
    const originalRows: CsvRow[] = [
      { description: '=1+1, test', value: '100' },
      { description: '+test "quoted"', value: '200' }
    ]
    const total = 300

    const exportOptions: ExportOptions = { includeHeader: false, includeTotal: false }
    const importOptions: ImportOptions = { skipHeader: false, skipTotal: false }

    const csvContent = exportToCsv(originalRows, total, exportOptions)
    const importedRows = importFromCsv(csvContent, importOptions)

    expect(importedRows).toEqual(originalRows)
  })
})
