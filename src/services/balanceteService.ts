import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import {
  buildAccountTree,
  filterTreeWithMovement,
  FinancialTreeNode,
} from '@/lib/account-utils'

export interface BalanceteData {
  tree: FinancialTreeNode[]
  totalDebito: number
  totalCredito: number
  totalSaldo: number
}

export const balanceteService = {
  async getTrialBalance(
    dateFrom?: Date,
    dateTo?: Date,
    filialId?: string,
  ): Promise<BalanceteData> {
    let query = supabase
      .from('razao')
      .select('conta, historico, debito, credito, saldo, plano_conta_id, data')

    if (filialId) query = query.eq('filial_id', filialId)
    if (dateFrom) query = query.gte('data', format(dateFrom, 'yyyy-MM-dd'))
    if (dateTo) query = query.lte('data', format(dateTo, 'yyyy-MM-dd'))

    const { data: razaoData, error } = await query
    if (error) throw error

    const { data: planoData, error: planoError } = await supabase
      .from('plano_contas')
      .select('id, classificacao, descricao, natureza')
    if (planoError) throw planoError

    const accountMap = new Map<
      number,
      {
        id: number
        classificacao: string
        descricao: string
        natureza: string | null
        debito: number
        credito: number
        saldo: number
      }
    >()

    for (const p of planoData || []) {
      accountMap.set(p.id, {
        id: p.id,
        classificacao: p.classificacao || '',
        descricao: p.descricao || p.classificacao || '',
        natureza: p.natureza,
        debito: 0,
        credito: 0,
        saldo: 0,
      })
    }

    for (const r of razaoData || []) {
      if (!r.plano_conta_id) continue
      const acc = accountMap.get(r.plano_conta_id)
      if (!acc) continue
      acc.debito += Number(r.debito)
      acc.credito += Number(r.credito)
      acc.saldo += Number(r.credito) - Number(r.debito)
    }

    const tree = filterTreeWithMovement(
      buildAccountTree(Array.from(accountMap.values())),
    )

    return {
      tree,
      totalDebito: tree.reduce((s, n) => s + n.debito, 0),
      totalCredito: tree.reduce((s, n) => s + n.credito, 0),
      totalSaldo: tree.reduce((s, n) => s + n.saldo, 0),
    }
  },
}
