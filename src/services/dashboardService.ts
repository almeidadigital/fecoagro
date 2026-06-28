import { supabase } from '@/lib/supabase/client'
import {
  DashboardKPIs,
  Transacao,
  RazaoEvolutionPoint,
  DebitCreditTotals,
} from '@/lib/types'
import { format } from 'date-fns'

export const dashboardService = {
  async getKPIs(dateNow?: string): Promise<DashboardKPIs> {
    const date = dateNow || format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.rpc('get_dashboard_kpi', {
      p_date_now: date,
    })
    if (error) throw error
    const d = data as Record<string, number>
    return {
      totalCriticas: d.totalCriticas ?? 0,
      pendingCriticas: d.pendingCriticas ?? 0,
      unreconciledCriticas: d.unreconciledCriticas ?? 0,
      completedCriticas: d.completedCriticas ?? 0,
      totalCriticasAmount: Number(d.totalCriticasAmount ?? 0),
      razaoBalance: Number(d.razaoBalance ?? 0),
      bankBalance: Number(d.bankBalance ?? 0),
      monthlyMovement: Number(d.monthlyMovement ?? 0),
    }
  },

  async getRecentTransactions(
    limit = 6,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Transacao[]> {
    let query = supabase
      .from('critica')
      .select('*')
      .order('created_at', { ascending: false })
    if (dateFrom && dateTo) {
      query = query
        .gte('date', format(dateFrom, 'yyyy-MM-dd'))
        .lte('date', format(dateTo, 'yyyy-MM-dd'))
    }
    const { data, error } = await query.limit(limit)
    if (error) throw error
    return (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      amount: Number(row.amount),
    })) as unknown as Transacao[]
  },

  async getCriticaForDistributions(
    limit = 500,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Transacao[]> {
    let query = supabase
      .from('critica')
      .select(
        'id, amount, status, centro_custo_id, atividade_id, plano_conta_id, date, reconciled',
      )
      .order('created_at', { ascending: false })
    if (dateFrom && dateTo) {
      query = query
        .gte('date', format(dateFrom, 'yyyy-MM-dd'))
        .lte('date', format(dateTo, 'yyyy-MM-dd'))
    }
    const { data, error } = await query.limit(limit)
    if (error) throw error
    return (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      amount: Number(row.amount),
    })) as unknown as Transacao[]
  },

  async getRazaoEvolution(
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<RazaoEvolutionPoint[]> {
    let query = supabase
      .from('razao')
      .select('data, debito, credito, saldo')
      .order('data', { ascending: true })
    if (dateFrom && dateTo) {
      query = query
        .gte('data', format(dateFrom, 'yyyy-MM-dd'))
        .lte('data', format(dateTo, 'yyyy-MM-dd'))
    } else {
      query = query.limit(30)
    }
    const { data, error } = await query
    if (error) throw error
    const map = new Map<
      string,
      { debito: number; credito: number; saldo: number }
    >()
    for (const r of data || []) {
      const existing = map.get(r.data) || { debito: 0, credito: 0, saldo: 0 }
      existing.debito += Number(r.debito)
      existing.credito += Number(r.credito)
      existing.saldo = Number(r.saldo)
      map.set(r.data, existing)
    }
    return Array.from(map.entries()).map(([date, vals]) => ({
      date,
      debito: vals.debito,
      credito: vals.credito,
      saldo: vals.saldo,
    }))
  },

  async getDebitCreditTotals(
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<DebitCreditTotals> {
    let query = supabase.from('razao').select('debito, credito')
    if (dateFrom && dateTo) {
      query = query
        .gte('data', format(dateFrom, 'yyyy-MM-dd'))
        .lte('data', format(dateTo, 'yyyy-MM-dd'))
    }
    const { data, error } = await query
    if (error) throw error
    const rows = data || []
    return {
      debito: rows.reduce((s, r) => s + Number(r.debito), 0),
      credito: rows.reduce((s, r) => s + Number(r.credito), 0),
    }
  },

  async getRecentExtratos(
    limit = 6,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<
    {
      id: number
      data: string
      descricao: string
      valor: number
      tipo: string
    }[]
  > {
    let query = supabase
      .from('extratos_bancarios')
      .select('id, data, descricao, valor, tipo')
      .order('data', { ascending: false })
    if (dateFrom && dateTo) {
      query = query
        .gte('data', format(dateFrom, 'yyyy-MM-dd'))
        .lte('data', format(dateTo, 'yyyy-MM-dd'))
    }
    const { data, error } = await query.limit(limit)
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
