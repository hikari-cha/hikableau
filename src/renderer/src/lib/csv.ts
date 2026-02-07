/**
 * CSV Import/Export utilities
 * Encoding: UTF-8 (No BOM) - Fixed
 */

export interface CsvRow {
  description: string
  value: string
}

export interface ExportOptions {
  includeHeader: boolean
  includeTotal: boolean
}

export interface ImportOptions {
  skipHeader: boolean
  skipTotal: boolean
}

export class CsvImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Import Error'
  }
}

/**
 * Export data to CSV format
 * @param rows - Array of row data
 * @param total - Total value to include if option is enabled
 * @param options - Export options
 * @returns CSV string in UTF-8 format
 */
export function exportToCsv(
  rows: CsvRow[],
  total: number,
  options: ExportOptions
): string {
  const lines: string[] = []

  // Add header if option is enabled
  if (options.includeHeader) {
    lines.push(escapeCsvRow(['Description', 'Value']))
  }

  // Add data rows (skip rows where both columns are empty)
  for (const row of rows) {
    const descEmpty = row.description.trim() === ''
    const valueEmpty = row.value.trim() === ''
    if (descEmpty && valueEmpty) {
      continue
    }
    lines.push(escapeCsvRow([row.description, row.value]))
  }

  // Add total row if option is enabled
  if (options.includeTotal) {
    lines.push(escapeCsvRow(['Total', formatTotal(total)]))
  }

  return lines.join('\n')
}

/**
 * Import data from CSV format
 * @param csvContent - CSV string content
 * @param options - Import options
 * @returns Array of parsed row data
 * @throws CsvImportError if validation fails
 */
export function importFromCsv(
  csvContent: string,
  options: ImportOptions
): CsvRow[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '')

  if (lines.length === 0) {
    throw new CsvImportError('CSV file is empty')
  }

  let startIndex = 0
  let endIndex = lines.length

  // Skip header row if option is enabled
  if (options.skipHeader && lines.length > 0) {
    startIndex = 1
  }

  // Skip total (footer) row if option is enabled
  if (options.skipTotal && lines.length > startIndex) {
    endIndex = lines.length - 1
  }

  // Ensure we have at least some data rows
  if (startIndex >= endIndex) {
    throw new CsvImportError('No data rows found after applying skip options')
  }

  const dataLines = lines.slice(startIndex, endIndex)
  const result: CsvRow[] = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const columns = parseCsvLine(line)

    // Validation: Must be exactly 2 columns
    if (columns.length !== 2) {
      throw new CsvImportError(
        `Row ${startIndex + i + 1}: Expected 2 columns, found ${columns.length}`
      )
    }

    const [description, valueStr] = columns

    // Remove CSV injection prevention prefix (single quote) if present
    const sanitizedDescription = description.startsWith("'") ? description.slice(1) : description
    const sanitizedValue = valueStr.startsWith("'") ? valueStr.slice(1) : valueStr

    // Validation: Column 2 must be numeric
    const trimmedValue = sanitizedValue.trim()
    if (trimmedValue !== '' && !Number.isFinite(Number(trimmedValue))) {
      throw new CsvImportError(
        `Row ${startIndex + i + 1}: Column 2 must be a valid number, found "${sanitizedValue}"`
      )
    }

    result.push({
      description: sanitizedDescription,
      value: trimmedValue
    })
  }

  return result
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }

  result.push(current)
  return result
}

/**
 * Escape a row for CSV output
 */
function escapeCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(',')
}

/**
 * Escape a single field for CSV output
 * Quotes the field if it contains comma, quote, or newline
 * Sanitizes fields starting with formula characters to prevent CSV injection
 */
function escapeCsvField(field: string): string {
  let sanitized = field
  
  // CSV injection prevention: prefix dangerous starting characters with single quote
  // This prevents Excel/Sheets from interpreting the field as a formula
  if (field.length > 0) {
    const firstChar = field[0]
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      sanitized = "'" + field
    }
  }
  
  // Quote the field if it contains special characters
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n') || sanitized.includes('\r')) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }
  return sanitized
}

/**
 * Format total number for display
 */
function formatTotal(total: number): string {
  if (Number.isInteger(total)) {
    return total.toString()
  }
  const str = String(total)
  if (str.includes('e') || str.includes('E')) {
    return str
  }
  return str.replace(/\.?0+$/, '')
}

/**
 * Download CSV content as a file using the browser's file save dialog
 */
export async function downloadCsv(content: string, suggestedFilename: string): Promise<void> {
  // Use the File System Access API if available
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as WindowWithFileSystem).showSaveFilePicker({
        suggestedName: suggestedFilename,
        types: [
          {
            description: 'CSV Files',
            accept: { 'text/csv': ['.csv'] }
          }
        ]
      })
      const writable = await handle.createWritable()
      await writable.write(content)
      await writable.close()
      return
    } catch (err) {
      // User cancelled or API not supported, fall through to fallback
      if ((err as Error).name === 'AbortError') {
        return // User cancelled
      }
    }
  }

  // Fallback: create and trigger download
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = suggestedFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Defer revoking the object URL to avoid race conditions in some browsers
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

/**
 * Open file picker and read CSV content
 */
export async function readCsvFile(): Promise<string> {
  // Use the File System Access API if available
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as WindowWithFileSystem).showOpenFilePicker({
        types: [
          {
            description: 'CSV Files',
            accept: { 'text/csv': ['.csv'] }
          }
        ],
        multiple: false
      })
      const file = await handle.getFile()
      return await file.text()
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new CsvImportError('File selection cancelled')
      }
      throw err
    }
  }

  // Fallback: use file input
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new CsvImportError('No file selected'))
        return
      }
      try {
        const content = await file.text()
        resolve(content)
      } catch (err) {
        reject(new CsvImportError('Failed to read file'))
      }
    }

    input.oncancel = () => {
      reject(new CsvImportError('File selection cancelled'))
    }

    input.click()
  })
}

// Type definitions for File System Access API
interface FileSystemFileHandle {
  getFile(): Promise<File>
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>
  close(): Promise<void>
}

interface FilePickerOptions {
  suggestedName?: string
  types?: Array<{
    description: string
    accept: Record<string, string[]>
  }>
  multiple?: boolean
}

interface WindowWithFileSystem extends Window {
  showSaveFilePicker(options?: FilePickerOptions): Promise<FileSystemFileHandle>
  showOpenFilePicker(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
}
