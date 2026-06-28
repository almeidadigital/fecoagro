import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { Transacao } from '@/lib/types'
import { CriticaFilterState } from '@/components/critica/CriticaFilters'
import { fetchTransactions as fetchTransactionsService } from '@/services/transactionService'

interface TransactionContextType {
  transactions: Transacao[]
  fetchTransactions: (filters: CriticaFilterState) => Promise<void>
  loading: boolean
  initialized: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
)

export const useTransactionStore = () => {
  const context = useContext(TransactionContext)
  if (!context)
    throw new Error(
      'useTransactionStore must be used within TransactionProvider',
    )
  return context
}

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const fetchTransactions = useCallback(async (filters: CriticaFilterState) => {
    try {
      setLoading(true)
      const data = await fetchTransactionsService(filters)
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  return (
    <TransactionContext.Provider
      value={{ transactions, fetchTransactions, loading, initialized }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export default useTransactionStore
