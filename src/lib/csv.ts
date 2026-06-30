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
 * Export data to CSV format (pure function, no I/O).
 */
export function exportToCsv(rows: CsvRow[], total: number, options: ExportOptions): string {
  const lines: string[] = []

  if (options.includeHeader) {
    lines.push(escapeCsvRow(['Description', 'Value']))
  }

  for (const row of rows) {
    const descEmpty = row.description.trim() === ''
    const valueEmpty = row.value.trim() === ''
    if (descEmpty && valueEmpty) continue
    lines.push(escapeCsvRow([row.description, row.value]))
  }

  if (options.includeTotal) {
    lines.push(escapeCsvRow(['Total', formatTotalForCsv(total)]))
  }

  return lines.join('\n')
}

/**
 * Import data from CSV format (pure function, no I/O).
 * @throws CsvImportError if validation fails
 */
export function importFromCsv(csvContent: string, options: ImportOptions): CsvRow[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '')

  if (lines.length === 0) {
    throw new CsvImportError('CSV file is empty')
  }

  let startIndex = 0
  let endIndex = lines.length

  if (options.skipHeader && lines.length > 0) {
    startIndex = 1
  }

  if (options.skipTotal && lines.length > startIndex) {
    endIndex = lines.length - 1
  }

  if (startIndex >= endIndex) {
    throw new CsvImportError('No data rows found after applying skip options')
  }

  const dataLines = lines.slice(startIndex, endIndex)
  const result: CsvRow[] = []

  for (let i = 0; i < dataLines.length; i++) {
    const columns = parseCsvLine(dataLines[i])

    if (columns.length !== 2) {
      throw new CsvImportError(
        `Row ${startIndex + i + 1}: Expected 2 columns, found ${columns.length}`
      )
    }

    const [description, valueStr] = columns
    const sanitizedDescription = description.startsWith("'") ? description.slice(1) : description
    const sanitizedValue = valueStr.startsWith("'") ? valueStr.slice(1) : valueStr

    const trimmedValue = sanitizedValue.trim()
    if (trimmedValue !== '' && !Number.isFinite(Number(trimmedValue))) {
      throw new CsvImportError(
        `Row ${startIndex + i + 1}: Column 2 must be a valid number, found "${sanitizedValue}"`
      )
    }

    result.push({ description: sanitizedDescription, value: trimmedValue })
  }

  return result
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
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

function escapeCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(',')
}

function escapeCsvField(field: string): string {
  let sanitized = field

  if (field.length > 0) {
    const firstChar = field[0]
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      sanitized = "'" + field
    }
  }

  if (
    sanitized.includes(',') ||
    sanitized.includes('"') ||
    sanitized.includes('\n') ||
    sanitized.includes('\r')
  ) {
    return `"${sanitized.replace(/"/g, '""')}"`
  }
  return sanitized
}

function formatTotalForCsv(total: number): string {
  if (Number.isInteger(total)) return total.toString()
  const str = String(total)
  if (str.includes('e') || str.includes('E')) return str
  return str.replace(/\.?0+$/, '')
}
