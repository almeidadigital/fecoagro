import { supabase } from '@/lib/supabase/client'
import {
  PlanoConta,
  CentroCusto,
  Atividade,
  NotaFiscal,
  Filial,
} from '@/lib/types'

export const auxiliaryService = {
  async fetchPlanoContas(): Promise<PlanoConta[]> {
    const { data, error } = await supabase
      .from('plano_contas')
      .select('*')
      .order('classificacao', { ascending: true })
    if (error) throw error
    return (data || []) as PlanoConta[]
  },
  async fetchCentroCustos(): Promise<CentroCusto[]> {
    const { data, error } = await supabase
      .from('centro_custos')
      .select('*')
      .order('id', { ascending: true })
    if (error) throw error
    return (data || []) as CentroCusto[]
  },
  async fetchAtividades(): Promise<Atividade[]> {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .order('id', { ascending: true })
    if (error) throw error
    return (data || []) as Atividade[]
  },
  async fetchNotasFiscais(): Promise<NotaFiscal[]> {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('numero_nota', { ascending: false })
    if (error) throw error
    return (data || []) as NotaFiscal[]
  },
  async fetchFiliais(): Promise<Filial[]> {
    const { data, error } = await supabase
      .from('filiais')
      .select('*')
      .order('id', { ascending: true })
    if (error) throw error
    return (data || []) as Filial[]
  },
}
