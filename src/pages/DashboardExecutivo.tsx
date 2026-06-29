import { useState, useMemo, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import {
  Calendar as CalendarIcon,
  X,
  FileText,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  executiveDashboardService,
  ExecutiveKPIs,
  SupplierVolumeData,
} from '@/services/executiveDashboardService'
import { auxiliaryService } from '@/services/auxiliaryService'
import { SupplierRanking } from '@/components/dashboard/SupplierRanking'
import { SupplierVolumeList } from '@/components/dashboard/SupplierVolumeList'
import { toast } from 'sonner'
import { Filial } from '@/lib/types'
import { filialOptions } from '@/lib/filial-format'

const DashboardExecutivo = () => {
  const now = new Date()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: now,
  })
  const [filialId, setFilialId] = useState<string>('all')
  const [filiais, setFiliais] = useState<Filial[]>([])
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null)
  const [supplierData, setSupplierData] = useState<SupplierVolumeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auxiliaryService
      .fetchFiliais()
      .then(setFiliais)
      .catch(() => {})
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)

    const effectiveFilialId = filialId !== 'all' ? filialId : undefined

    const safeFetch = async <T,>(
      fn: () => Promise<T>,
      fallback: T,
      label: string,
    ): Promise<T> => {
      try {
        return await fn()
      } catch (err) {
        console.error(`Erro ao carregar ${label}:`, err)
        toast.error(`Falha ao carregar: ${label}`)
        return fallback
      }
    }

    const [kpiData, suppliers] = await Promise.all([
      safeFetch(
        () =>
          executiveDashboardService.getKPIs(
            dateRange?.from,
            dateRange?.to,
            effectiveFilialId,
          ),
        null,
        'KPIs',
      ),
      safeFetch(
        () =>
          executiveDashboardService.getSupplierVolumes(
            dateRange?.from,
            dateRange?.to,
            effectiveFilialId,
          ),
        [],
        'Fornecedores',
      ),
    ])

    setKpis(kpiData)
    setSupplierData(suppliers)
    setLoading(false)
  }, [dateRange?.from?.getTime(), dateRange?.to?.getTime(), filialId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const clearFilters = () => {
    setDateRange({
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    })
    setFilialId('all')
  }

  const hasActiveFilters = dateRange !== undefined || filialId !== 'all'

  const cards = useMemo(() => {
    if (!kpis) return []
    return [
      {
        label: 'Total de Notas Fiscais',
        value: formatCurrency(kpis.totalNotasFiscais),
        sub: `${kpis.countNotasFiscais} notas no período`,
        icon: FileText,
        color: 'text-green-600 bg-green-50',
      },
      {
        label: 'Total de Críticas',
        value: formatCurrency(kpis.totalCriticas),
        sub: `${kpis.countCriticas} críticas no período`,
        icon: AlertCircle,
        color: 'text-yellow-600 bg-yellow-50',
      },
      {
        label: 'Total Débitos (Razão)',
        value: formatCurrency(kpis.totalDebito),
        sub: `${kpis.countRazao} lançamentos`,
        icon: ArrowDownCircle,
        color: 'text-red-600 bg-red-50',
      },
      {
        label: 'Total Créditos (Razão)',
        value: formatCurrency(kpis.totalCredito),
        sub: `${kpis.countRazao} lançamentos`,
        icon: ArrowUpCircle,
        color: 'text-blue-600 bg-blue-50',
      },
      {
        label: 'Saldo Bancário',
        value: formatCurrency(kpis.saldoBancario),
        sub: `${kpis.countBancos} contas`,
        icon: Landmark,
        color: 'text-purple-600 bg-purple-50',
      },
    ]
  }, [kpis])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[130px] rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Executivo
          </h1>
          <p className="text-gray-500">
            Visão executiva dos totais financeiros
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filialId} onValueChange={setFilialId}>
            <SelectTrigger className="w-full md:w-[220px] bg-white">
              <SelectValue placeholder="Todas as Filiais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Filiais</SelectItem>
              {filialOptions(filiais).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full md:w-[300px] justify-start text-left font-normal bg-white',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Filtrar por data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-xs"
            >
              <X className="mr-2 h-3 w-3" /> Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="rounded-3xl border-none shadow-sm">
              <CardContent className="p-5 flex flex-col gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    card.color,
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {card.label}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {card.value}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {card.sub}
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupplierVolumeList data={supplierData} loading={loading} />
        <SupplierRanking data={supplierData} loading={loading} />
      </div>
    </div>
  )
}

export default DashboardExecutivo
