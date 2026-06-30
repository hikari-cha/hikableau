import React from 'react'
import { Button } from '@/components/ui/button'
import type { ExportOptions, ImportOptions } from '@/lib/csv'

interface OptionsPanelProps {
  exportOptions: ExportOptions
  setExportOptions: React.Dispatch<React.SetStateAction<ExportOptions>>
  importOptions: ImportOptions
  setImportOptions: React.Dispatch<React.SetStateAction<ImportOptions>>
  importError: string | null
  onDismissError: () => void
}

export function OptionsPanel({
  exportOptions,
  setExportOptions,
  importOptions,
  setImportOptions,
  importError,
  onDismissError
}: OptionsPanelProps): React.JSX.Element {
  return (
    <>
      {importError && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Import Error</p>
          <p className="mt-1 text-sm text-red-600">{importError}</p>
          <Button
            onClick={onDismissError}
            variant="ghost"
            size="sm"
            className="mt-2 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

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
    </>
  )
}
