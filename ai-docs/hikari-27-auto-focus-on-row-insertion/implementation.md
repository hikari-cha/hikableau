# Hikari-27: Auto Focus on Row Insertion

## Overview

When a new row is inserted by pressing the `Enter` key, the cursor now automatically moves to the **first column (Description)** of the newly created row, regardless of which column (Description or Value) the Enter key was pressed in. The input is immediately in a "ready-to-type" state.

## Problem

The previous implementation used a `useEffect` with `focusRowId` state to manage focus after row insertion. This had a timing issue: when text had been typed into a field before pressing Enter, the state batching and effect scheduling caused the focus to remain on the original input instead of moving to the new row.

**Root Cause:** `useEffect` runs asynchronously after render. When combined with React 18's automatic batching of state updates (both `setRows` and `setFocusRowId`), the focus call inside the effect could be unreliable — particularly when the input already had text and onChange events had recently fired.

## Solution

Replaced the `useEffect`-based focus mechanism with a **ref callback approach**. The focus is now applied directly inside the description input's `ref` callback during React's commit phase, which guarantees the DOM element exists and is ready to receive focus.

### Files Modified

- [src/renderer/src/components/ColumnSumTable.tsx](../../src/renderer/src/components/ColumnSumTable.tsx)
- [src/renderer/src/__tests__/ColumnSumTable.test.tsx](../../src/renderer/src/__tests__/ColumnSumTable.test.tsx)

### Changes Summary

#### 1. Replaced `focusRowId` State with a Ref

**Before:**
```tsx
import React, { useState, useCallback, useRef, useEffect } from 'react'

// Track row ID to focus on (first input of that row)
const [focusRowId, setFocusRowId] = useState<string | null>(null)
```

**After:**
```tsx
import React, { useState, useCallback, useRef } from 'react'

// Ref to track which row should receive focus after insertion
const pendingFocusRowIdRef = useRef<string | null>(null)
```

Using a ref instead of state avoids triggering unnecessary re-renders and eliminates the timing dependency on `useEffect`.

#### 2. Simplified `insertRowBelow` Function

**Before:**
```tsx
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
```

**After:**
```tsx
const insertRowBelow = useCallback((currentRowId: string) => {
  const newRowId = crypto.randomUUID()
  pendingFocusRowIdRef.current = newRowId
  setRows((prevRows) => {
    const currentIndex = prevRows.findIndex((row) => row.id === currentRowId)
    if (currentIndex === -1) return prevRows

    const newRows = [...prevRows]
    newRows.splice(currentIndex + 1, 0, { id: newRowId, description: '', value: '' })
    return newRows
  })
}, [])
```

Key improvements:
- UUID is generated **before** entering the `setRows` callback (cleaner)
- `pendingFocusRowIdRef.current` is set synchronously before `setRows`
- No `useEffect` or `setFocusRowId` needed

#### 3. Removed `useEffect` for Focus Management

**Removed:**
```tsx
useEffect(() => {
  if (focusRowId) {
    const inputElement = descriptionInputRefs.current.get(focusRowId)
    if (inputElement) {
      inputElement.focus()
    }
    setFocusRowId(null)
  }
}, [focusRowId, rows])
```

The `useEffect` was the source of the timing issue. Since `useEffect` runs asynchronously after paint, focus could be lost or applied to the wrong element.

#### 4. Updated Description Input Ref Callback

**Before:**
```tsx
<Input
  ref={(el) => {
    if (el) {
      descriptionInputRefs.current.set(row.id, el)
    } else {
      descriptionInputRefs.current.delete(row.id)
    }
  }}
  // ...
/>
```

**After:**
```tsx
<Input
  ref={(el) => {
    if (el) {
      descriptionInputRefs.current.set(row.id, el)
      if (pendingFocusRowIdRef.current === row.id) {
        el.focus()
        pendingFocusRowIdRef.current = null
      }
    } else {
      descriptionInputRefs.current.delete(row.id)
    }
  }}
  // ...
/>
```

The focus is now applied **during React's commit phase** via the ref callback. When the new row's description input mounts, the callback checks if this row matches the pending focus target. If so, it focuses the element immediately and clears the pending ref.

#### 5. Removed Unused `useEffect` Import

`useEffect` was removed from the React import since it is no longer used for focus management.

## Behavior

| Action | Result |
|--------|--------|
| Press `Enter` in Description column (empty) | New row inserted, focus moves to new row's Description |
| Press `Enter` in Description column (with text) | New row inserted, focus moves to new row's Description |
| Press `Enter` in Value column (empty) | New row inserted, focus moves to new row's Description |
| Press `Enter` in Value column (with text) | New row inserted, focus moves to new row's Description |
| Multiple rapid `Enter` presses | Each press inserts a new row, focus follows to each new row |
| Insert from middle row | New row inserted at correct position, focus on new row's Description |
| Insert from last row | New row appended, focus on new row's Description |

## Why Ref Callback is Better Than `useEffect`

1. **Timing guarantee:** Ref callbacks run during React's commit phase, after the DOM is updated but before effects. This ensures the element exists and is ready for `.focus()`.
2. **No extra re-renders:** Using a ref (not state) to track the pending focus avoids triggering additional renders.
3. **Synchronous flow:** The focus happens immediately when the element mounts, with no scheduling delay.
4. **Simpler code:** Eliminates the need for a separate state variable and an effect with cleanup logic.
