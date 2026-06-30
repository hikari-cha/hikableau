import { invoke } from '@tauri-apps/api/core'

/**
 * Open a system file picker for CSV files and return the file content.
 * Returns null if the user cancels.
 */
export async function readCsvFile(): Promise<string | null> {
  return invoke<string | null>('open_csv_file')
}

/**
 * Open a system save dialog for CSV files and write the content.
 * Does nothing if the user cancels.
 */
export async function writeCsvFile(content: string, filename: string): Promise<void> {
  await invoke<boolean>('save_csv_file', { content, filename })
}
