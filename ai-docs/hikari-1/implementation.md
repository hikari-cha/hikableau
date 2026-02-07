# Column Sum Table - Implementation Documentation

## Overview

This document describes the implementation of a minimal column sum table feature. The table allows users to input descriptive strings and numerical values, automatically calculating the sum of all values in the final "Total" row.

## Features Implemented

### Core Functionality

1. **Two-Column Table Structure**
   - Column 1: Description (string input)
   - Column 2: Value (numerical input supporting integers, negative numbers, and decimals)

2. **Automatic Sum Calculation**
   - The final row displays "Total" with the sum of all values from rows 1 to n-1
   - Sum updates in real-time as values change
   - Invalid values (non-numeric) are treated as 0 in the sum calculation

3. **Dynamic Row Management**
   - Default: 2 rows (1 data row + 1 total row)
   - Minimum: 2 rows (enforced by design - no delete functionality)
   - Users can add rows one by one using the "+" button

4. **Data Validation**
   - Column 1: Accepts any string input
   - Column 2: Validates numeric input (integers, negatives, decimals)
   - Validation messages displayed inline below invalid inputs

## File Structure

```
src/renderer/src/
├── components/
│   ├── ColumnSumTable.tsx      # Main component
│   └── ui/
│       ├── button.tsx          # shadcn/ui Button component
│       └── input.tsx           # shadcn/ui Input component
├── lib/
│   └── utils.ts                # Utility functions (cn helper)
├── assets/
│   ├── base.css                # Base styles
│   └── main.css                # Tailwind CSS entry point
└── App.tsx                     # Root application component
```

## Technical Stack

- **Framework**: React (via Vite + Electron)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Button, Input)
- **Icons**: Lucide React (Plus icon)
- **Testing**: Vitest + React Testing Library

## Implementation Details

### ColumnSumTable Component

Located at `src/renderer/src/components/ColumnSumTable.tsx`

#### State Management

```typescript
interface RowData {
  id: string          // Unique identifier (UUID)
  description: string // Column 1 value
  value: string       // Column 2 value (stored as string for input handling)
}

interface ValidationError {
  rowId: string
  field: 'description' | 'value'
  message: string
}
```

#### Key Functions

1. **`updateRow(id, field, newValue)`**: Updates a specific cell and validates the input
2. **`addRow()`**: Adds a new empty row to the table
3. **`calculateTotal()`**: Computes the sum of all valid numeric values
4. **`validateValue(value)`**: Validates that a value is a valid number
5. **`formatTotal(total)`**: Formats the total, removing unnecessary trailing zeros

### Tailwind CSS Configuration

The project uses Tailwind CSS v4 with the new `@import "tailwindcss"` syntax. Key configuration in `main.css`:

```css
@import "tailwindcss";
@import "./base.css";

@source "../**/*.{ts,tsx}";

@theme {
  --radius-md: 0.5rem;
  --color-primary: var(--color-slate-900);
  --color-accent: var(--color-indigo-600);
}
```

**Critical**: Tailwind CSS v4 requires the `@tailwindcss/vite` plugin to be added to the Vite configuration. This is configured in `electron.vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // ...
  renderer: {
    plugins: [react(), tailwindcss()]
  }
})
```

Without this plugin, Tailwind CSS classes will not be processed and styles will not be applied.

### shadcn/ui Setup

Components were manually created following shadcn/ui patterns:

1. **Button Component**: Uses `class-variance-authority` for variant management
2. **Input Component**: Styled input with focus states and validation support
3. **Utility Function**: `cn()` helper combining `clsx` and `tailwind-merge`

## Design Compliance

Following the design guidelines from `ai-docs/design.md`:

- **Color Palette**: Uses Slate-900 for text, Indigo-600 for accents
- **Radius**: 0.5rem (rounded-md) for components
- **Spacing**: Relaxed spacing with p-4, gap-4 defaults
- **Focus States**: All interactive elements have focus-visible:ring-2
- **Grid Lines**: Table borders visible using border-collapse with slate-300

## UI Specifications

- No title above the table
- Column headers: "Description" and "Value" (left-aligned)
- Grid lines visible on all cells
- Total row has subtle background highlight (bg-slate-50)
- Add Row button uses primary (indigo) styling with Plus icon

## Dependencies Added

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.563.0",
    "tailwind-merge": "^3.4.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/react": "^16.x",
    "@testing-library/user-event": "^14.x",
    "@vitest/coverage-v8": "^4.x",
    "jsdom": "^26.x",
    "vitest": "^4.x"
  }
}
```

## Usage

The component is rendered in `App.tsx`:

```tsx
import { ColumnSumTable } from './components/ColumnSumTable'

function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white p-4">
      <ColumnSumTable />
    </div>
  )
}
```

## Running the Application

```bash
# Development mode
npm run dev

# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```