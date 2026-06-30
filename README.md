# Hikableau

A desktop spreadsheet application for calculating column sums, built with Tauri, React, and TypeScript.

![Tech Stack](https://img.shields.io/badge/Tauri-React-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC)

## Features

### Column Sum Table

A two-column spreadsheet table with automatic sum calculation:

- **Description Column**: Accepts any text input
- **Value Column**: Accepts numeric values (integers, negative numbers, decimals)
- **Automatic Total**: Real-time sum calculation displayed in the final row
- **Validation**: Inline validation messages for invalid numeric inputs

### Row Management

- **Add Row**: Click the "+" button to add new rows
- **Delete Row**: Hover over a row to reveal the delete button (hidden when only 1 row exists)
- **Clear Table**: Reset the entire table to its initial state (1 empty row)
- **Insert Row on Enter**: Press `Enter` in any cell to insert a new row below and automatically focus on it

### CSV Import/Export

- **Export**: Save table data to a CSV file (UTF-8 encoding, no BOM)
  - Options: Include header row, include total row
- **Import**: Load data from a CSV file
  - Options: Skip header row, skip total (footer) row
  - Validation: Checks column count and numeric values with detailed error messages

## Tech Stack

- **Framework**: Tauri v2 + React (Vite)
- **Language**: TypeScript (frontend), Rust (backend)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Button, Input)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Rust toolchain (install via [rustup](https://rustup.rs/))

### Installation

```bash
npm install
```

### Development

Start the full application (Tauri + frontend) in development mode with hot-reload:

```bash
npm run dev
```

To run only the frontend (Vite dev server):

```bash
npm run dev:frontend
```

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Build

Build the application for distribution:

```bash
npm run build
```

Tauri automatically targets the current platform and produces the appropriate installer.

## Usage

### Basic Workflow

1. Enter descriptions and values in the table cells
2. The total is automatically calculated and displayed in the last row
3. Press `Enter` to quickly insert a new row below the current cell
4. Use the "+" button to add rows at the end
5. Hover over a row and click the "−" button to delete it

### Export Data

1. Configure export options (header row, total row) using the checkboxes
2. Click the **Export** button
3. Choose a save location and filename
4. Data is saved as a UTF-8 CSV file

### Import Data

1. Configure import options (skip header, skip total) using the checkboxes
2. Click the **Import** button
3. Select a `.csv` file
4. The table is populated with the imported data

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Insert a new row below the current cell |
| `Tab` | Navigate between cells |

## Project Structure

```
src/                        # React frontend (Vite)
├── __tests__/              # Unit tests
├── assets/
├── components/
│   ├── ColumnSumTable/     # Main table component
│   │   ├── index.tsx
│   │   ├── DataRow.tsx
│   │   └── OptionsPanel.tsx
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── useCsvIO.ts         # CSV import/export logic
│   └── useTableRows.ts     # Table row state management
├── lib/
│   ├── csv.ts              # CSV parsing utilities
│   ├── file-system.ts      # Tauri file dialog wrappers
│   └── utils.ts
├── App.tsx
└── main.tsx
src-tauri/                  # Tauri/Rust backend
├── src/
│   ├── lib.rs
│   └── main.rs
├── capabilities/
│   └── default.json
├── icons/
├── Cargo.toml
└── tauri.conf.json
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
