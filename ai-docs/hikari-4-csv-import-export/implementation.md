# Hikari-4: CSV Import/Export Implementation

## Overview

This feature implements CSV import and export functionality for the ColumnSumTable component, allowing users to save their data to files and load data from existing CSV files.

## Files Modified/Created

### New Files

- `src/renderer/src/lib/csv.ts` - Core CSV utility functions
- `src/renderer/src/__tests__/csv.test.ts` - Unit tests for CSV utilities

### Modified Files

- `src/renderer/src/components/ColumnSumTable.tsx` - Added Import/Export UI and handlers

## Implementation Details

### 1. CSV Utility Module (`src/renderer/src/lib/csv.ts`)

#### Types

```typescript
interface CsvRow {
  description: string
  value: string
}

interface ExportOptions {
  includeHeader: boolean
  includeTotal: boolean
}

interface ImportOptions {
  skipHeader: boolean
  skipTotal: boolean
}

class CsvImportError extends Error {
  name: 'Import Error'
}
```

#### Export Functionality

- **`exportToCsv(rows, total, options)`**: Converts row data to CSV string format
  - Encoding: UTF-8 (No BOM) - Fixed as per spec
  - Properly escapes fields containing commas, quotes, or newlines
  - Skips rows where both description and value are empty
  - Optionally includes header row ("Description,Value")
  - Optionally includes total row

- **`downloadCsv(content, suggestedFilename)`**: Triggers file download
  - Uses File System Access API (`showSaveFilePicker`) when available for native file dialog
  - Falls back to blob download with anchor element for unsupported browsers

#### Import Functionality

- **`importFromCsv(csvContent, options)`**: Parses CSV string to row data
  - Handles both Unix (LF) and Windows (CRLF) line endings
  - Parses quoted fields correctly (handles escaped quotes)
  - Optionally skips header row
  - Optionally skips total (footer) row
  - Ignores empty lines

- **`readCsvFile()`**: Opens file picker and reads selected file
  - Uses File System Access API (`showOpenFilePicker`) when available
  - Falls back to hidden file input for unsupported browsers
  - Only accepts `.csv` files

#### Validation Rules

The import function validates:
1. **Non-empty file**: Throws if CSV content is empty
2. **Column count**: Each row must have exactly 2 columns
3. **Numeric values**: Column 2 must contain valid numbers (empty strings allowed)
4. **Data availability**: Must have at least one data row after applying skip options

Error messages include row numbers for easy debugging.

### 2. ColumnSumTable Component Updates

#### New State Variables

```typescript
// Export options (default: NO for both)
const [exportOptions, setExportOptions] = useState<ExportOptions>({
  includeHeader: false,
  includeTotal: false
})

// Import options (default: NO for both)
const [importOptions, setImportOptions] = useState<ImportOptions>({
  skipHeader: false,
  skipTotal: false
})

// Import error display
const [importError, setImportError] = useState<string | null>(null)
```

#### Event Handlers

- **`handleExport`**: Triggers CSV export with current data and options
- **`handleImport`**: Opens file picker, validates, and loads CSV data

#### UI Components Added

1. **Button Bar**: Flexbox container with "Add Row" on left, "Export"/"Import" buttons on right
2. **Import Error Display**: Red-styled alert box when import fails, with dismiss button
3. **Export Options Panel**: Checkboxes for "Include Header Row" and "Include Total Row"
4. **Import Options Panel**: Checkboxes for "Skip Header Row" and "Skip Total (Footer) Row"

### 3. Design Compliance

Following `ai-docs/design.md`:

- **Buttons**: Using shadcn Button component with 'outline' variant for Export/Import (secondary actions)
- **Icons**: Using Lucide React icons (Upload for export, Download for import)
- **Layout**: Flexbox for button positioning (`flex items-center justify-between`)
- **Colors**: 
  - Error state: Red-50 background, red-300 border, red-600/800 text
  - Options panels: Slate-50 background, slate-200 border
- **Spacing**: Standard p-3, gap-2/4 for relaxed breathing room
- **Focus states**: Using Tailwind's focus:ring-indigo-600 for checkboxes

## API Reference

### Save Flow

```
User clicks Save button
    ↓
exportToCsv() generates CSV string
    ↓
downloadCsv() opens save dialog
    ↓
User selects location and filename
    ↓
File saved as UTF-8 (No BOM)
```

### Import Flow

```
User clicks Import button
    ↓
readCsvFile() opens file picker (.csv only)
    ↓
User selects file
    ↓
importFromCsv() parses and validates
    ↓
On success: Table rows replaced with imported data
On failure: Error message displayed
```

## Error Handling

| Error Condition | Message |
|-----------------|---------|
| Empty file | "CSV file is empty" |
| No data after skipping | "No data rows found after applying skip options" |
| Wrong column count | "Row X: Expected 2 columns, found Y" |
| Non-numeric value | "Row X: Column 2 must be a valid number, found 'value'" |
| User cancels | No error shown (silent) |

## Browser Compatibility

- **File System Access API**: Chrome 86+, Edge 86+, Opera 72+
- **Fallback (Blob + anchor)**: All modern browsers
- **File input fallback**: All browsers with JavaScript support
