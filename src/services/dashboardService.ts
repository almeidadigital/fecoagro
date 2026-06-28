import { supabase } from '@/lib/supabase/client'
import {
  DashboardKPIs,
  Transacao,
  RazaoEvolutionPoint,
  DebitCreditTotals,
} from '@/lib/types'
import { format } from 'date-fns'

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPIs> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.rpc('get_dashboard_kpi', {
      p_date_now: today,
    })
    if (error) throw error
    const d = data as Record<string, number>
    return {
      totalCriticas: d.totalCriticas ?? 0,
      pendingCriticas: d.pendingCriticas ?? 0,
      completedCriticas: d.completedCriticas ?? 0,
      totalCriticasAmount: Number(d.totalCriticasAmount ?? 0),
      razaoBalance: Number(d.razaoBalance ?? 0),
      bankBalance: Number(d.bankBalance ?? 0),
    }
  },

  async getRecentTransactions(limit = 6): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('critica')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      amount: Number(row.amount),
    })) as unknown as Transacao[]
  },

  async getCriticaForDistributions(limit = 500): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('critica')
      .select(
        'id, amount, status, centro_custo_id, atividade_id, plano_conta_id',
      )
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      amount: Number(row.amount),
    })) as unknown as Transacao[]
  },

  async getRazaoEvolution(): Promise<RazaoEvolutionPoint[]> {
    const { data, error } = await supabase
      .from('razao')
      .select('data, saldo')
      .order('data', { ascending: true })
      .limit(30)
    if (error) throw error
    return (data || []).map((r: Record<string, unknown>) => ({
      date: r.data as string,
      saldo: Number(r.saldo),
    }))
  },

  async getDebitCreditTotals(): Promise<DebitCreditTotals> {
    const { data, error } = await supabase
      .from('razao')
      .select('debito, credito')
    if (error) throw error
    const rows = data || []
    return {
      debito: rows.reduce((s, r) => s + Number(r.debito), 0),
      credito: rows.reduce((s, r) => s + Number(r.credito), 0),
    }
  },

  async getRecentExtratos(
    limit = 6,
  ): Promise<
    {
      id: number
      data: string
      descricao: string
      valor: number
      tipo: string
    }[]
  > {
    const { data, error } = await supabase
      .from('extratos_bancarios')
      .select('id, data, descricao, valor, tipo')
      .order('data', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((r: Record<string, unknown>) => ({
      id: r.id as number,
      data: r.data as string,
      descricao: r.descricao as string,
      valor: Number(r.valor),
      tipo: r.tipo as string,
    }))
  },
}
