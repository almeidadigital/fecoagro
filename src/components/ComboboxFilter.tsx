import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ComboboxFilterColumn {
  value: string
  label: string
  options?: { value: string; label: string }[]
}

export interface ComboboxFilterState {
  column: string
  value: string
  dateRange: DateRange | undefined
}

interface ComboboxFilterProps {
  columns: ComboboxFilterColumn[]
  filters: ComboboxFilterState
  setFilters: React.Dispatch<React.SetStateAction<ComboboxFilterState>>
  showDateRange?: boolean
}

export function ComboboxFilter({
  columns,
  filters,
  setFilters,
  showDateRange = true,
}: ComboboxFilterProps) {
  const selectedColumn = columns.find((c) => c.value === filters.column)

  const clearFilters = () => {
    setFilters({ column: '', value: '', dateRange: undefined })
  }

  const hasActiveFilters =
    filters.column !== '' ||
    filters.value !== '' ||
    filters.dateRange !== undefined

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={filters.column}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, column: val, value: '' }))
          }
        >
          <SelectTrigger className="w-full md:w-[200px] bg-white">
            <SelectValue placeholder="Selecionar campo..." />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col.value} value={col.value}>
                {col.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.column &&
          (selectedColumn?.options ? (
            <Select
              value={filters.value}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, value: val }))
              }
            >
              <SelectTrigger className="w-full md:w-[220px] bg-white">
                <SelectValue placeholder="Selecionar valor..." />
              </SelectTrigger>
              <SelectContent>
                {selectedColumn.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Digite o valor..."
              value={filters.value}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, value: e.target.value }))
              }
              className="flex-1 bg-white"
            />
          ))}

        {showDateRange && (
          <div className="w-full md:w-[260px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-white',
                    !filters.dateRange && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, 'dd/MM/yyyy')} -{' '}
                        {format(filters.dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(filters.dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Filtrar por data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) =>
                    setFilters((prev) => ({ ...prev, dateRange: range }))
                  }
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-3 w-3" /> Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
