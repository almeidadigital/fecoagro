import { Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ColumnDef {
  key: string
  label: string
}

interface ColumnVisibilityProps {
  columns: ColumnDef[]
  visibleColumns: Record<string, boolean>
  onToggle: (key: string) => void
}

export function ColumnVisibility({
  columns,
  visibleColumns,
  onToggle,
}: ColumnVisibilityProps) {
  const visibleCount = columns.filter((c) => visibleColumns[c.key]).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 className="w-4 h-4 mr-2" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Visibilidade de Colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuItem
            key={col.key}
            onSelect={(e) => e.preventDefault()}
            onClick={() => {
              if (visibleColumns[col.key] && visibleCount <= 1) return
              onToggle(col.key)
            }}
            className="cursor-pointer"
          >
            <Checkbox
              checked={visibleColumns[col.key]}
              className="mr-2 pointer-events-none"
            />
            <span>{col.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
