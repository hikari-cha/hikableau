import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, Download, Upload, Minus, Trash2 } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { cn, formatWithThousandsSeparator, removeThousandsSeparator } from '@renderer/lib/utils'
import {
  exportToCsv,
  importFromCsv,
  downloadCsv,
  readCsvFile,
  CsvImportError,
  type ExportOptions,
  type ImportOptions
} from '@renderer/lib/csv'

interface RowData {
  id: string
  description: string
  value: string
}

interface ValidationError {
  rowId: string
  field: 'description' | 'value'
  message: string
}

export function ColumnSumTable(): React.JSX.Element {
  const [rows, setRows] = useState<RowData[]>(() => [{ id: crypto.randomUUID(), description: '', value: '' }])
  const [errors, setErrors] = useState<ValidationError[]>([])

  // Track row ID to focus on (first input of that row)
  const [focusRowId, setFocusRowId] = useState<string | null>(null)

  // Ref map for description inputs (first column) keyed by row ID
  const descriptionInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  // Export options state (default: NO for both)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeHeader: false,
    includeTotal: false
  })

  // Import options state (default: NO for both)
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipHeader: false,
    skipTotal: false
  })

  // Import error state
  const [importError, setImportError] = useState<string | null>(null)

  const validateDescription = (value: string): string | null => {
    // Currently, all description inputs are strings; no additional validation needed.
    return null
  }

  const validateValue = (value: string): string | null => {
    const trimmed = value.trim()
    if (trimmed === '') return null
    const num = Number(trimmed)
    if (isNaN(num)) {
      return 'Value must be a valid number'
    }
    return null
  }

  const updateRow = useCallback((id: string, field: 'description' | 'value', newValue: string) => {
    setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, [field]: newValue } : row)))

    // Validate and update errors
    setErrors((prevErrors) => {
      const filteredErrors = prevErrors.filter((e) => !(e.rowId === id && e.field === field))

      let validationMessage: string | null = null
      if (field === 'description') {
        validationMessage = validateDescription(newValue)
      } else {
        validationMessage = validateValue(newValue)
      }

      if (validationMessage) {
        return [...filteredErrors, { rowId: id, field, message: validationMessage }]
      }
      return filteredErrors
    })
  }, [])

  const addRow = useCallback(() => {
    setRows((prevRows) => [...prevRows, { id: crypto.randomUUID(), description: '', value: '' }])
  }, [])

  const insertRowBelow = useCallback((currentRowId: string) => {
    let insertedRowId: string | null = null
    setRows((prevRows) => {
      const currentIndex = prevRows.findIndex((row) => row.id === currentRowId)
      if (currentIndex === -1) return prevRows

      const newRowId = crypto.randomUUID()
      insertedRowId = newRowId

      const newRows = [...prevRows]
      newRows.splice(currentIndex + 1, 0, { id: newRowId, description: '', value: '' })
      return newRows
    })
    if (insertedRowId) {
      setFocusRowId(insertedRowId)
    }
  }, [])

  // Effect to focus on the new row's first input
  useEffect(() => {
    if (focusRowId) {
      const inputElement = descriptionInputRefs.current.get(focusRowId)
      if (inputElement) {
        inputElement.focus()
      }
      setFocusRowId(null)
    }
  }, [focusRowId, rows])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, rowId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        insertRowBelow(rowId)
      }
    },
    [insertRowBelow]
  )

  const deleteRow = useCallback((id: string) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id))
    setErrors((prevErrors) => prevErrors.filter((e) => e.rowId !== id))
  }, [])

  const clearTable = useCallback(() => {
    setRows([{ id: crypto.randomUUID(), description: '', value: '' }])
    setErrors([])
    setImportError(null)
    setExportOptions({} as ExportOptions)
    setImportOptions({} as ImportOptions)
  }, [])

  const calculateTotal = useCallback((): number => {
    return rows.reduce((sum, row) => {
      const num = Number(row.value.trim())
      return sum + (isNaN(num) ? 0 : num)
    }, 0)
  }, [rows])

  const getError = (rowId: string, field: 'description' | 'value'): string | undefined => {
    return errors.find((e) => e.rowId === rowId && e.field === field)?.message
  }

  const formatTotal = (total: number): string => {
    // Format to remove unnecessary trailing zeros without imposing fixed rounding
    let str: string
    if (Number.isInteger(total)) {
      str = total.toString()
    } else {
      str = String(total)
      // If the number is in exponential form, return as-is to avoid corrupting the representation
      if (str.includes('e') || str.includes('E')) {
        return str
      }
      str = str.replace(/\.?0+$/, '')
    }
    // Apply thousands separator formatting
    return formatWithThousandsSeparator(str)
  }

  const handleExport = useCallback(async () => {
    const csvContent = exportToCsv(
      rows.map((r) => ({ description: r.description, value: r.value })),
      calculateTotal(),
      exportOptions
    )
    await downloadCsv(csvContent, 'export.csv')
  }, [rows, calculateTotal, exportOptions])

  const handleImport = useCallback(async () => {
    setImportError(null)
    try {
      const csvContent = await readCsvFile()
      const importedRows = importFromCsv(csvContent, importOptions)

      // Convert imported rows to RowData with new IDs
      const newRows: RowData[] = importedRows.map((row) => ({
        id: crypto.randomUUID(),
        description: row.description,
        value: row.value
      }))

      // Ensure at least one row
      if (newRows.length === 0) {
        newRows.push({ id: crypto.randomUUID(), description: '', value: '' })
      }

      setRows(newRows)
      setErrors([]) // Clear any existing validation errors
    } catch (err) {
      if (err instanceof CsvImportError) {
        if (err.message !== 'File selection cancelled') {
          setImportError(err.message)
        }
      } else {
        setImportError('An unexpected error occurred during import')
      }
    }
  }, [importOptions])

  return (
    <div className="relative w-full max-w-2xl">
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-300 px-4 py-2 text-left text-sm font-bold text-slate-900">
              Description
            </th>
            <th className="border border-slate-300 px-4 py-2 text-left text-sm font-bold text-slate-900">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="group">
              <td className="border border-slate-300 p-1">
                <div>
                  <Input
                    ref={(el) => {
                      if (el) {
                        descriptionInputRefs.current.set(row.id, el)
                      } else {
                        descriptionInputRefs.current.delete(row.id)
                      }
                    }}
                    type="text"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.id)}
                    placeholder={`Item ${index + 1}`}
                    className={cn(
                      'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                      getError(row.id, 'description') && 'border border-red-500'
                    )}
                    aria-label={`Description for row ${index + 1}`}
                  />
                  {getError(row.id, 'description') && (
                    <p className="mt-1 text-xs text-red-500">{getError(row.id, 'description')}</p>
                  )}
                </div>
              </td>
              <td className="relative border border-slate-300 p-1">
                <div>
                  <Input
                    type="text"
                    value={formatWithThousandsSeparator(row.value)}
                    onChange={(e) => updateRow(row.id, 'value', removeThousandsSeparator(e.target.value))}
                    onKeyDown={(e) => handleKeyDown(e, row.id)}
                    placeholder="0"
                    className={cn(
                      'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                      getError(row.id, 'value') && 'border border-red-500'
                    )}
                    aria-label={`Value for row ${index + 1}`}
                  />
                  {getError(row.id, 'value') && (
                    <p className="mt-1 text-xs text-red-500">{getError(row.id, 'value')}</p>
                  )}
                </div>
                {rows.length > 1 && (
                  <Button
                    onClick={() => deleteRow(row.id)}
                    variant="ghost"
                    size="sm"
                    className="absolute -right-8 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Delete row ${index + 1}`}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-slate-50">
            <td className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900">Total</td>
            <td className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900">
              {formatTotal(calculateTotal())}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={addRow} variant="default" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
          <Button onClick={clearTable} variant="outline" size="sm" className="gap-1">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleImport} variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Import Error Display */}
      {importError && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Import Error</p>
          <p className="mt-1 text-sm text-red-600">{importError}</p>
          <Button
            onClick={() => setImportError(null)}
            variant="ghost"
            size="sm"
            className="mt-2 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-sm font-medium text-slate-900">Export Options</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={exportOptions.includeHeader}
              onChange={(e) =>
                setExportOptions((prev) => ({ ...prev, includeHeader: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Include Header Row
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={exportOptions.includeTotal}
              onChange={(e) =>
                setExportOptions((prev) => ({ ...prev, includeTotal: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Include Total Row
          </label>
        </div>
      </div>

      {/* Import Options */}
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-sm font-medium text-slate-900">Import Options</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={importOptions.skipHeader}
              onChange={(e) =>
                setImportOptions((prev) => ({ ...prev, skipHeader: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Skip Header Row
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={importOptions.skipTotal}
              onChange={(e) =>
                setImportOptions((prev) => ({ ...prev, skipTotal: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Skip Total (Footer) Row
          </label>
        </div>
      </div>
    </div>
  )
}
