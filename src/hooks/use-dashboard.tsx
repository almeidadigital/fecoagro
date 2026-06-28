import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '@/services/dashboardService'
import {
  DashboardKPIs,
  Transacao,
  CategoryDistribution,
  StatusDistribution,
  RazaoEvolutionPoint,
  DebitCreditTotals,
  CentroCusto,
  Atividade,
  PlanoConta,
} from '@/lib/types'
import { auxiliaryService } from '@/services/auxiliaryService'
import { summaryService, SummaryData } from '@/services/summaryService'
import { toast } from 'sonner'
import useTransactionStore from '@/stores/useTransactionStore'
import { useAuth } from '@/hooks/use-auth'

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
]

const STATUS_COLORS: Record<string, string> = {
  pendente: '#F59E0B',
  concluido: '#10B981',
  cancelado: '#EF4444',
}

function processDistribution(
  transactions: Transacao[],
  fkField: keyof Transacao,
  labels: { id: number; name: string }[],
): CategoryDistribution[] {
  const groupMap = new Map<number, number>()
  transactions.forEach((t) => {
    const fk = t[fkField] as number | null
    if (fk !== null && fk !== undefined) {
      groupMap.set(fk, (groupMap.get(fk) || 0) + t.amount)
    }
  })
  const total = Array.from(groupMap.values()).reduce((a, b) => a + b, 0)
  return Array.from(groupMap.entries())
    .map(([id, value], index) => ({
      name: labels.find((l) => l.id === id)?.name || 'Sem vínculo',
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)
}

function processStatusDistribution(
  transactions: Transacao[],
): StatusDistribution[] {
  const statusMap = new Map<string, number>()
  transactions.forEach((t) => {
    const status = t.status || 'pendente'
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  return Array.from(statusMap.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name] || '#6B7280',
  }))
}

export const useDashboard = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transacao[]>([])
  const [razaoEvolution, setRazaoEvolution] = useState<RazaoEvolutionPoint[]>(
    [],
  )
  const [debitCreditTotals, setDebitCreditTotals] = useState<DebitCreditTotals>(
    {
      debito: 0,
      credito: 0,
    },
  )
  const [recentExtratos, setRecentExtratos] = useState<
    {
      id: number
      data: string
      descricao: string
      valor: number
      tipo: string
    }[]
  >([])
  const [centroCustoDistribution, setCentroCustoDistribution] = useState<
    CategoryDistribution[]
  >([])
  const [atividadeDistribution, setAtividadeDistribution] = useState<
    CategoryDistribution[]
  >([])
  const [planoContasDistribution, setPlanoContasDistribution] = useState<
    CategoryDistribution[]
  >([])
  const [statusDistribution, setStatusDistribution] = useState<
    StatusDistribution[]
  >([])
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const { transactions: storeTransactions } = useTransactionStore()
  const { role } = useAuth()

  const fetchData = useCallback(async () => {
    if (role === 'visitante') {
      setLoading(false)
      setSummaryLoading(false)
      setKpis(null)
      setRecentTransactions([])
      setRazaoEvolution([])
      setDebitCreditTotals({ debito: 0, credito: 0 })
      setRecentExtratos([])
      setCentroCustoDistribution([])
      setAtividadeDistribution([])
      setPlanoContasDistribution([])
      setStatusDistribution([])
      setSummaryData(null)
      return
    }

    try {
      setLoading(true)
      const [
        kpiData,
        recentData,
        allCritica,
        razaoData,
        debitCredit,
        extratos,
        summary,
        centroCustos,
        atividades,
        planoContas,
      ] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRecentTransactions(6),
        dashboardService.getCriticaForDistributions(),
        dashboardService.getRazaoEvolution(),
        dashboardService.getDebitCreditTotals(),
        dashboardService.getRecentExtratos(6),
        summaryService.getSummary(),
        auxiliaryService.fetchCentroCustos(),
        auxiliaryService.fetchAtividades(),
        auxiliaryService.fetchPlanoContas(),
      ])

      setKpis(kpiData)
      setRecentTransactions(recentData)
      setRazaoEvolution(razaoData)
      setDebitCreditTotals(debitCredit)
      setRecentExtratos(extratos)
      setSummaryData(summary)

      const ccLabels = (centroCustos as CentroCusto[]).map((c) => ({
        id: c.id,
        name: c.centro_de_custos,
      }))
      const atLabels = (atividades as Atividade[]).map((a) => ({
        id: a.id,
        name: a.atividade,
      }))
      const pcLabels = (planoContas as PlanoConta[]).map((p) => ({
        id: p.id,
        name: p.descricao || 'Sem nome',
      }))

      setCentroCustoDistribution(
        processDistribution(allCritica, 'centro_custo_id', ccLabels),
      )
      setAtividadeDistribution(
        processDistribution(allCritica, 'atividade_id', atLabels),
      )
      setPlanoContasDistribution(
        processDistribution(allCritica, 'plano_conta_id', pcLabels),
      )
      setStatusDistribution(processStatusDistribution(allCritica))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
      setSummaryLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchData()
  }, [fetchData, storeTransactions])

  return {
    kpis,
    recentTransactions,
    razaoEvolution,
    debitCreditTotals,
    recentExtratos,
    centroCustoDistribution,
    atividadeDistribution,
    planoContasDistribution,
    statusDistribution,
    loading,
    summaryData,
    summaryLoading,
    refresh: fetchData,
  }
}
