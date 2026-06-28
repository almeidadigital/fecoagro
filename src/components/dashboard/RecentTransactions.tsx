import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Transacao } from '@/lib/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transacao[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Críticas Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-900 pl-6">
                  Descrição
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900">
                  Data
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900 text-right pr-6">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const status =
                  statusConfig[t.status || 'pendente'] || statusConfig.pendente
                return (
                  <TableRow
                    key={t.id}
                    className="border-b-0 hover:bg-gray-50/50"
                  >
                    <TableCell className="pl-6 py-3">
                      <span className="font-medium text-gray-900 text-sm">
                        {t.description}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-gray-500">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          status.color,
                        )}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-3">
                      <span className="font-bold text-sm text-gray-900">
                        R$ {t.amount.toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 text-sm">Nenhuma crítica recente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
