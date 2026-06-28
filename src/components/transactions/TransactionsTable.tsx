import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Transacao } from '@/lib/types'
import { format } from 'date-fns'
import { Edit, Trash2 } from 'lucide-react'
import useTransactionStore from '@/stores/useTransactionStore'

interface TransactionsTableProps {
  data: Transacao[]
  onEdit: (transaction: Transacao) => void
}

export function TransactionsTable({ data, onEdit }: TransactionsTableProps) {
  const { centroCustos, atividades, planoContas, deleteTransaction } =
    useTransactionStore()

  const getCentroCustoName = (id?: string) => {
    if (!id) return '-'
    const cc = centroCustos.find((c) => c.id === id)
    return cc ? cc.centro_de_custos : '-'
  }

  const getAtividadeName = (id?: string) => {
    if (!id) return '-'
    const atv = atividades.find((a) => a.id === id)
    return atv ? atv.atividade : '-'
  }

  const getPlanoContaName = (id?: string) => {
    if (!id) return '-'
    const pc = planoContas.find((p) => p.id === id)
    return pc ? pc.descricao : '-'
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-white shadow-sm">
        <p className="text-gray-500 mb-2">Nenhuma crítica encontrada.</p>
        <p className="text-sm text-gray-400">
          Ajuste os filtros ou adicione uma nova crítica.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-[120px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Centro de Custo</TableHead>
            <TableHead>Atividade</TableHead>
            <TableHead>Descrição da Conta</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Forma de Pagamento</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium text-gray-600">
                {format(new Date(transaction.data), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="font-semibold text-gray-900">
                {transaction.descricao}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="font-normal text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {getCentroCustoName(transaction.centro_custo_id)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {getAtividadeName(transaction.atividade_id)}
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {getPlanoContaName(transaction.plano_conta_id)}
              </TableCell>
              <TableCell className="text-right font-bold text-gray-900">
                {formatCurrency(transaction.valor)}
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {transaction.forma_pagamento_id}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá
                          permanentemente o registro da crítica.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
