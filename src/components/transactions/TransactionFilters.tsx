import * as React from 'react'
import {
  ComboboxFilter,
  type ComboboxFilterColumn,
  type ComboboxFilterState,
} from '@/components/ComboboxFilter'

export type FilterState = ComboboxFilterState

interface TransactionFiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

export function TransactionFilters({
  filters,
  setFilters,
}: TransactionFiltersProps) {
  const columns: ComboboxFilterColumn[] = [
    { value: 'description', label: 'Descrição' },
    {
      value: 'type',
      label: 'Tipo',
      options: [
        { value: 'Receita', label: 'Receita' },
        { value: 'Despesa', label: 'Despesa' },
      ],
    },
  ]

  return (
    <ComboboxFilter
      columns={columns}
      filters={filters}
      setFilters={setFilters}
    />
  )
}
