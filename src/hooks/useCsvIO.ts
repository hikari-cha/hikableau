import { useState, useCallback } from 'react'
import { exportToCsv, importFromCsv, CsvImportError } from '@/lib/csv'
import type { ExportOptions, ImportOptions, CsvRow } from '@/lib/csv'
import { readCsvFile, writeCsvFile } from '@/lib/file-system'
import type { RowData } from './useTableRows'

export function useCsvIO(
  rows: RowData[],
  total: number,
  onImport: (rows: CsvRow[]) => void
) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeHeader: false,
    includeTotal: false
  })
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipHeader: false,
    skipTotal: false
  })
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    const csvContent = exportToCsv(
      rows.map((r) => ({ description: r.description, value: r.value })),
      total,
      exportOptions
    )
    await writeCsvFile(csvContent, 'export.csv')
  }, [rows, total, exportOptions])

  const handleImport = useCallback(async () => {
    setImportError(null)
    try {
      const csvContent = await readCsvFile()
      if (csvContent === null) return
      const importedRows = importFromCsv(csvContent, importOptions)
      onImport(importedRows)
    } catch (err) {
      if (err instanceof CsvImportError) {
        setImportError(err.message)
      } else {
        setImportError('An unexpected error occurred during import')
      }
    }
  }, [importOptions, onImport])

  const dismissImportError = useCallback(() => setImportError(null), [])

  const reset = useCallback(() => {
    setImportError(null)
    setExportOptions({ includeHeader: false, includeTotal: false })
    setImportOptions({ skipHeader: false, skipTotal: false })
  }, [])

  return {
    exportOptions,
    setExportOptions,
    importOptions,
    setImportOptions,
    importError,
    dismissImportError,
    handleExport,
    handleImport,
    reset
  }
}
