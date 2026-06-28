import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/format'
import { RazaoEvolutionPoint } from '@/lib/types'

interface FinancialEvolutionChartProps {
  data: RazaoEvolutionPoint[]
}

export function FinancialEvolutionChart({
  data,
}: FinancialEvolutionChartProps) {
  const hasData = data.length > 0
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: format(new Date(d.date), 'dd/MM', { locale: ptBR }),
  }))

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Entradas vs Saídas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative">
        {hasData ? (
          <ChartContainer
            config={{
              credito: { label: 'Entradas', color: '#10B981' },
              debito: { label: 'Saídas', color: '#EF4444' },
            }}
            className="w-full h-full"
          >
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="dateLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                dy={10}
                minTickGap={20}
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
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="credito"
                name="Entradas"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="debito"
                name="Saídas"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Sem dados de evolução
          </div>
        )}
      </CardContent>
    </Card>
  )
}
