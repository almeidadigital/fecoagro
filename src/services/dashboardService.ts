import { supabase } from '@/lib/supabase/client'
import {
  DashboardKPIs,
  Transacao,
  TipoTransacao,
  FormaPagamento,
} from '@/lib/types'
import { format } from 'date-fns'

export const dashboardService = {
  async getKPIs(): Promise<DashboardKPIs> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase.rpc('get_dashboard_kpi', {
      p_date_now: today,
    })
    if (error) throw error
    return data as DashboardKPIs
  },

  async getRecentTransactions(limit = 5): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('critica')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data.map((row) => ({
      id: row.id,
      data: new Date(row.date),
      descricao: row.description,
      valor: Number(row.amount),
      categoria_id: row.category,
      tipo_id: row.type as TipoTransacao,
      forma_pagamento_id: row.payment_method as FormaPagamento,
      observacoes: row.notes,
    }))
  },

  async getTransactionsForPeriod(start: Date, end: Date): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('critica')
      .select('*')
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (error) throw error

    return data.map((row) => ({
      id: row.id,
      data: new Date(row.date),
      descricao: row.description,
      valor: Number(row.amount),
      categoria_id: row.category,
      tipo_id: row.type as TipoTransacao,
      forma_pagamento_id: row.payment_method as FormaPagamento,
      observacoes: row.notes,
    }))
  },
}
