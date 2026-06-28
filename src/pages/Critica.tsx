import { useState, useEffect } from 'react'
import { Plus, FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { deleteRecord } from '@/services/crudService'
import { TransactionViewDialog } from '@/components/transactions/TransactionViewDialog'
import { Button } from '@/components/ui/button'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import {
  ComboboxFilter,
  ComboboxFilterState,
  ComboboxFilterColumn,
} from '@/components/ComboboxFilter'
import { TransactionsTable } from '@/components/transactions/TransactionsTable'
import { PdfImportModal } from '@/components/pdf/PdfImportModal'
import useTransactionStore from '@/stores/useTransactionStore'
import { Transacao, Atividade, CentroCusto, PlanoConta } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { auxiliaryService } from '@/services/auxiliaryService'
import AccessDenied from '@/pages/AccessDenied'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const filterColumns: ComboboxFilterColumn[] = [
  { value: 'historico', label: 'Histórico' },
  {
    value: 'status',
    label: 'Status',
    options: [
      { value: 'pendente', label: 'Pendente' },
      { value: 'concluido', label: 'Concluído' },
      { value: 'cancelado', label: 'Cancelado' },
    ],
  },
]

const Critica = () => {
  const { transactions, fetchTransactions, loading, initialized } =
    useTransactionStore()
  const { role } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transacao | null>(null)
  const [viewingTransaction, setViewingTransaction] =
    useState<Transacao | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transacao | null>(null)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [centroCustos, setCentroCustos] = useState<CentroCusto[]>([])
  const [planoContas, setPlanoContas] = useState<PlanoConta[]>([])

  const [filters, setFilters] = useState<ComboboxFilterState>({
    column: '',
    value: '',
    dateRange: undefined,
  })

  useEffect(() => {
    auxiliaryService
      .fetchAtividades()
      .then(setAtividades)
      .catch(() => {})
    auxiliaryService
      .fetchCentroCustos()
      .then(setCentroCustos)
      .catch(() => {})
    auxiliaryService
      .fetchPlanoContas()
      .then(setPlanoContas)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(filters)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters, fetchTransactions])

  const handleCreate = () => {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  const handleEdit = (transaction: Transacao) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleView = (transaction: Transacao) => {
    setViewingTransaction(transaction)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteRecord('critica', deleteTarget.id)
      toast.success('Crítica excluída com sucesso')
      fetchTransactions(filters)
    } catch {
      toast.error('Erro ao excluir crítica')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (role === 'visitante') {
    return <AccessDenied />
  }

  const showLoading = loading || !initialized

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Críticas Contábeis
          </h1>
          <p className="text-gray-500">
            Gerencie seus registros financeiros e histórico.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPdfOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" />
            Importar PDF
          </Button>
          <Button
            onClick={handleCreate}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Crítica
          </Button>
        </div>
      </div>
      <ComboboxFilter
        columns={filterColumns}
        filters={filters}
        setFilters={setFilters}
      />
      {showLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TransactionsTable
          data={transactions}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={(t) => setDeleteTarget(t)}
          atividades={atividades}
          centroCustos={centroCustos}
          planoContas={planoContas}
        />
      )}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        transactionToEdit={editingTransaction}
        onSuccess={() => fetchTransactions(filters)}
      />
      <PdfImportModal
        open={isPdfOpen}
        onOpenChange={setIsPdfOpen}
        entityType="transactions"
        onSuccess={() => fetchTransactions(filters)}
      />
      <TransactionViewDialog
        transaction={viewingTransaction}
        open={!!viewingTransaction}
        onOpenChange={(open) => !open && setViewingTransaction(null)}
        atividades={atividades}
        centroCustos={centroCustos}
        planoContas={planoContas}
      />
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta crítica? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Critica
