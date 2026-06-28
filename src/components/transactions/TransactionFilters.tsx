import * as React from 'react'
import {
  ComboboxFilter,
  type ComboboxFilterColumn,
  type ComboboxFilterState,
} from '@/components/ComboboxFilter'
import { FormaPagamento } from '@/lib/types'
import useTransactionStore from '@/stores/useTransactionStore'

export type FilterState = ComboboxFilterState

interface TransactionFiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

export function TransactionFilters({
  filters,
  setFilters,
}: TransactionFiltersProps) {
  const { categories } = useTransactionStore()

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
    {
      value: 'category',
      label: 'Categoria',
      options: categories.map((c) => ({ value: c.id, label: c.nome })),
    },
    {
      value: 'payment_method',
      label: 'Forma de Pagamento',
      options: Object.values(FormaPagamento).map((m) => ({
        value: m,
        label: m,
      })),
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
