import React, { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'

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
    if (Number.isInteger(total)) {
      return total.toString()
    }
    const str = String(total)
    // If the number is in exponential form, return as-is to avoid corrupting the representation
    if (str.includes('e') || str.includes('E')) {
      return str
    }
    return str.replace(/\.?0+$/, '')
  }

  return (
    <div className="w-full max-w-2xl">
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
            <tr key={row.id}>
              <td className="border border-slate-300 p-1">
                <div>
                  <Input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, 'description', e.target.value)}
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
              <td className="border border-slate-300 p-1">
                <div>
                  <Input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, 'value', e.target.value)}
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

      <div className="mt-4">
        <Button onClick={addRow} variant="default" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>
    </div>
  )
}
