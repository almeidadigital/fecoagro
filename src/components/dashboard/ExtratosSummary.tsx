import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ExtratoRow {
  id: number
  data: string
  descricao: string
  valor: number
  tipo: string
}

interface ExtratosSummaryProps {
  data: ExtratoRow[]
}

export function ExtratosSummary({ data }: ExtratosSummaryProps) {
  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Extratos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-900 pl-6">
                  Data
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900">
                  Descrição
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900 text-right pr-6">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e) => (
                <TableRow key={e.id} className="border-b-0 hover:bg-gray-50/50">
                  <TableCell className="pl-6 py-3 text-xs text-gray-500">
                    {format(new Date(e.data), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-900">
                    {e.descricao}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    <span
                      className={cn(
                        'font-bold text-sm',
                        e.tipo === 'credit' ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {e.tipo === 'credit' ? '+' : '-'}
                      {formatCurrency(e.valor)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 text-sm">Nenhum extrato recente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
