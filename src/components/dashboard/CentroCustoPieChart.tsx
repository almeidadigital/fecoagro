import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { CategoryDistribution } from '@/lib/types'

interface CentroCustoPieChartProps {
  data: CategoryDistribution[]
}

const COLOR_MAP: Record<string, string> = {
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#10B981',
  'bg-yellow-500': '#EAB308',
  'bg-purple-500': '#8B5CF6',
  'bg-pink-500': '#EC4899',
  'bg-indigo-500': '#6366F1',
  'bg-red-500': '#EF4444',
}

export function CentroCustoPieChart({ data }: CentroCustoPieChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0)

  const chartData = data.map((d) => ({
    name: d.name,
    value: d.value,
    fill: COLOR_MAP[d.color] || '#6B7280',
  }))

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Despesas por Centro de Custo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative">
        {hasData ? (
          <ChartContainer config={{}} className="w-full h-full">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString('pt-BR')}`
                }
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              />
            </PieChart>
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
