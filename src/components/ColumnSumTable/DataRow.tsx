import React from 'react'
import { Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatWithThousandsSeparator, removeThousandsSeparator } from '@/lib/utils'
import type { RowData } from '@/hooks/useTableRows'

interface DataRowProps {
  row: RowData
  index: number
  hasDeleteButton: boolean
  descriptionRef: (el: HTMLInputElement | null) => void
  getError: (field: 'description' | 'value') => string | undefined
  onUpdate: (id: string, field: 'description' | 'value', value: string) => void
  onDelete: (id: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, rowId: string) => void
}

export function DataRow({
  row,
  index,
  hasDeleteButton,
  descriptionRef,
  getError,
  onUpdate,
  onDelete,
  onKeyDown
}: DataRowProps): React.JSX.Element {
  const descError = getError('description')
  const valueError = getError('value')

  return (
    <tr className="group">
      <td className="border border-slate-300 p-1">
        <div>
          <Input
            ref={descriptionRef}
            type="text"
            value={row.description}
            onChange={(e) => onUpdate(row.id, 'description', e.target.value)}
            onKeyDown={(e) => onKeyDown(e, row.id)}
            placeholder={`Item ${index + 1}`}
            className={cn(
              'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              descError && 'border border-red-500'
            )}
            aria-label={`Description for row ${index + 1}`}
          />
          {descError && <p className="mt-1 text-xs text-red-500">{descError}</p>}
        </div>
      </td>
      <td className="relative border border-slate-300 p-1">
        <div>
          <Input
            type="text"
            value={formatWithThousandsSeparator(row.value)}
            onChange={(e) => onUpdate(row.id, 'value', removeThousandsSeparator(e.target.value))}
            onKeyDown={(e) => onKeyDown(e, row.id)}
            placeholder="0"
            className={cn(
              'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              valueError && 'border border-red-500'
            )}
            aria-label={`Value for row ${index + 1}`}
          />
          {valueError && <p className="mt-1 text-xs text-red-500">{valueError}</p>}
        </div>
        {hasDeleteButton && (
          <Button
            onClick={() => onDelete(row.id)}
            variant="ghost"
            size="sm"
            className="absolute -right-8 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-red-100 hover:text-red-600"
            aria-label={`Delete row ${index + 1}`}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
      </td>
    </tr>
  )
}
