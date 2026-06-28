import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/format'
import { DebitCreditTotals } from '@/lib/types'

interface DebitCreditChartProps {
  data: DebitCreditTotals
}

export function DebitCreditChart({ data }: DebitCreditChartProps) {
  const hasData = data.debito > 0 || data.credito > 0
  const chartData = [
    { name: 'Débito', value: data.debito, fill: '#EF4444' },
    { name: 'Crédito', value: data.credito, fill: '#10B981' },
  ]

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Débito vs Crédito (Razão)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative">
        {hasData ? (
          <ChartContainer config={{}} className="w-full h-full">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickFormatter={(v) => `R$${v}`}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Sem dados
          </div>
        )}
      </CardContent>
    </Card>
  )
}
