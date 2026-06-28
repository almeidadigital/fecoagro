import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SupplierVolumeData } from '@/services/executiveDashboardService'
import { formatCurrency } from '@/lib/format'
import { Trophy, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SupplierRankingProps {
  data: SupplierVolumeData[]
  loading?: boolean
}

const RANK_STYLES = [
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-gray-100 text-gray-700 border-gray-300',
  'bg-orange-100 text-orange-700 border-orange-300',
]

export function SupplierRanking({ data, loading }: SupplierRankingProps) {
  const top10 = data.slice(0, 10)
  const maxValue = top10.length > 0 ? top10[0].total : 0

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
          <Trophy className="w-5 h-5" />
        </div>
        <CardTitle className="text-lg font-bold">
          Top 10 Fornecedores com maior volume financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : top10.length > 0 ? (
          <div className="flex flex-col gap-2">
            {top10.map((item, index) => {
              const barWidth = maxValue > 0 ? (item.total / maxValue) * 100 : 0
              return (
                <div
                  key={item.fornecedor}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border',
                      index < 3
                        ? RANK_STYLES[index]
                        : 'bg-blue-50 text-blue-600 border-blue-200',
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-sm font-medium text-gray-700 truncate"
                        title={item.fornecedor}
                      >
                        {item.fornecedor}
                      </span>
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs shrink-0 bg-gray-100 text-gray-600"
                      >
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
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
