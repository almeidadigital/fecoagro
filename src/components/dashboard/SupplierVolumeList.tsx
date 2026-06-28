import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SupplierVolumeData } from '@/services/executiveDashboardService'
import { formatCurrency } from '@/lib/format'
import { Building2, ScrollText } from 'lucide-react'

interface SupplierVolumeListProps {
  data: SupplierVolumeData[]
  loading?: boolean
}

export function SupplierVolumeList({ data, loading }: SupplierVolumeListProps) {
  const allSuppliers = data

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600">
          <ScrollText className="w-5 h-5" />
        </div>
        <CardTitle className="text-lg font-bold">
          Total por Fornecedor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : allSuppliers.length > 0 ? (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fornecedor
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                    Notas
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    % do Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSuppliers.map((item, index) => (
                  <TableRow
                    key={item.fornecedor}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <TableCell className="text-sm font-medium text-gray-700 max-w-[200px] truncate">
                      {item.fornecedor}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 text-center">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 text-right">
                      {item.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center text-gray-400 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Building2 className="w-8 h-8 text-gray-300" />
              Nenhum dado de fornecedor disponível para o período.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
