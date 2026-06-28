import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { Transacao } from '@/lib/types'
import { CriticaFilterState } from '@/components/critica/CriticaFilters'
import { fetchTransactions } from '@/services/transactionService'

interface TransactionStoreType {
  transactions: Transacao[]
  fetchTransactions: (filters: CriticaFilterState) => Promise<void>
  loading: boolean
  initialized: boolean
}

const TransactionContext = createContext<TransactionStoreType | undefined>(
  undefined,
)

export function useTransactionStore() {
  const context = useContext(TransactionContext)
  if (!context)
    throw new Error(
      'useTransactionStore must be used within TransactionProvider',
    )
  return context
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const fetchTransactionsData = useCallback(
    async (filters: CriticaFilterState) => {
      try {
        setLoading(true)
        const data = await fetchTransactions(filters)
        setTransactions(data)
      } catch {
        setTransactions([])
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    },
    [],
  )

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fetchTransactions: fetchTransactionsData,
        loading,
        initialized,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export default useTransactionStore
