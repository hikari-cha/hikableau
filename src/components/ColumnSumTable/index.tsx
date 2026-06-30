import React, { useCallback } from 'react'
import { Plus, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTableRows } from '@/hooks/useTableRows'
import { useCsvIO } from '@/hooks/useCsvIO'
import { formatTotal } from '@/lib/utils'
import { DataRow } from './DataRow'
import { OptionsPanel } from './OptionsPanel'

export function ColumnSumTable(): React.JSX.Element {
  const {
    rows,
    updateRow,
    addRow,
    deleteRow,
    clearRows,
    importRows,
    calculateTotal,
    getError,
    handleKeyDown,
    getDescriptionRef
  } = useTableRows()

  const total = calculateTotal()

  const { exportOptions, setExportOptions, importOptions, setImportOptions, importError, dismissImportError, handleExport, handleImport, reset: resetCsvIO } =
    useCsvIO(rows, total, importRows)

  const handleClear = useCallback(() => {
    clearRows()
    resetCsvIO()
  }, [clearRows, resetCsvIO])

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
            <DataRow
              key={row.id}
              row={row}
              index={index}
              hasDeleteButton={rows.length > 1}
              descriptionRef={getDescriptionRef(row.id)}
              getError={(field) => getError(row.id, field)}
              onUpdate={updateRow}
              onDelete={deleteRow}
              onKeyDown={handleKeyDown}
            />
          ))}
          <tr className="bg-slate-50">
            <td className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900">
              Total
            </td>
            <td className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900">
              {formatTotal(total)}
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
          <Button onClick={handleClear} variant="outline" size="sm" className="gap-1">
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

      <OptionsPanel
        exportOptions={exportOptions}
        setExportOptions={setExportOptions}
        importOptions={importOptions}
        setImportOptions={setImportOptions}
        importError={importError}
        onDismissError={dismissImportError}
      />
    </div>
  )
}
