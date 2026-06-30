import { useState, useCallback, useRef } from 'react'
import type React from 'react'

export interface RowData {
  id: string
  description: string
  value: string
}

interface ValidationError {
  rowId: string
  field: 'description' | 'value'
  message: string
}

function validateValue(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  return isNaN(Number(trimmed)) ? 'Value must be a valid number' : null
}

export function useTableRows() {
  const [rows, setRows] = useState<RowData[]>(() => [
    { id: crypto.randomUUID(), description: '', value: '' }
  ])
  const [errors, setErrors] = useState<ValidationError[]>([])

  const pendingFocusRowIdRef = useRef<string | null>(null)
  const descriptionInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const updateRow = useCallback(
    (id: string, field: 'description' | 'value', newValue: string) => {
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: newValue } : row)))
      setErrors((prev) => {
        const filtered = prev.filter((e) => !(e.rowId === id && e.field === field))
        const msg = field === 'value' ? validateValue(newValue) : null
        return msg ? [...filtered, { rowId: id, field, message: msg }] : filtered
      })
    },
    []
  )

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), description: '', value: '' }])
  }, [])

  const insertRowBelow = useCallback((currentRowId: string) => {
    const newRowId = crypto.randomUUID()
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === currentRowId)
      if (idx === -1) {
        pendingFocusRowIdRef.current = null
        return prev
      }
      pendingFocusRowIdRef.current = newRowId
      const next = [...prev]
      next.splice(idx + 1, 0, { id: newRowId, description: '', value: '' })
      return next
    })
  }, [])

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    setErrors((prev) => prev.filter((e) => e.rowId !== id))
  }, [])

  const clearRows = useCallback(() => {
    setRows([{ id: crypto.randomUUID(), description: '', value: '' }])
    setErrors([])
  }, [])

  const importRows = useCallback((newRows: { description: string; value: string }[]) => {
    const mapped: RowData[] = newRows.map((r) => ({
      id: crypto.randomUUID(),
      description: r.description,
      value: r.value
    }))
    if (mapped.length === 0) {
      mapped.push({ id: crypto.randomUUID(), description: '', value: '' })
    }
    setRows(mapped)
    setErrors([])
  }, [])

  const calculateTotal = useCallback((): number => {
    return rows.reduce((sum, row) => {
      const num = Number(row.value.trim())
      return sum + (isNaN(num) ? 0 : num)
    }, 0)
  }, [rows])

  const getError = useCallback(
    (rowId: string, field: 'description' | 'value'): string | undefined => {
      return errors.find((e) => e.rowId === rowId && e.field === field)?.message
    },
    [errors]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, rowId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        insertRowBelow(rowId)
      }
    },
    [insertRowBelow]
  )

  // Returns a stable ref callback factory — the factory itself is stable,
  // but each call returns a fresh closure that captures the current rowId.
  const getDescriptionRef = useCallback((rowId: string) => {
    return (el: HTMLInputElement | null) => {
      if (el) {
        descriptionInputRefs.current.set(rowId, el)
        if (pendingFocusRowIdRef.current === rowId) {
          el.focus()
          pendingFocusRowIdRef.current = null
        }
      } else {
        descriptionInputRefs.current.delete(rowId)
      }
    }
  }, [])

  return {
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
  }
}
