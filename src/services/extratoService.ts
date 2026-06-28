import { supabase } from '@/lib/supabase/client'
import { ExtratoBancario, Razao } from '@/lib/types'
import { format, subDays, addDays } from 'date-fns'

export async function fetchExtratos(
  bancoId?: number,
): Promise<ExtratoBancario[]> {
  let query = supabase.from('extratos_bancarios').select('*')
  if (bancoId) {
    query = query.eq('banco_id', bancoId)
  }
  query = query.order('data', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  return (data || []) as ExtratoBancario[]
}

export async function createExtrato(
  record: Omit<ExtratoBancario, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
): Promise<ExtratoBancario> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  const { data, error } = await supabase
    .from('extratos_bancarios')
    .insert({ ...record, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as ExtratoBancario
}

export async function updateExtrato(
  id: number,
  updates: Partial<ExtratoBancario>,
): Promise<ExtratoBancario> {
  const { data, error } = await supabase
    .from('extratos_bancarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ExtratoBancario
}

export async function deleteExtrato(id: number): Promise<void> {
  const { error } = await supabase
    .from('extratos_bancarios')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function fetchRazaoSuggestions(
  valor: number,
  data: string,
): Promise<Razao[]> {
  const dateFrom = format(subDays(new Date(data), 3), 'yyyy-MM-dd')
  const dateTo = format(addDays(new Date(data), 3), 'yyyy-MM-dd')

  const { data: result, error } = await supabase
    .from('razao')
    .select('*')
    .gte('data', dateFrom)
    .lte('data', dateTo)
    .or(`debito.eq.${valor},credito.eq.${valor}`)
    .order('data', { ascending: false })

  if (error) throw error
  return (result || []) as Razao[]
}

export async function searchRazao(searchTerm: string): Promise<Razao[]> {
  const { data, error } = await supabase
    .from('razao')
    .select('*')
    .or(`descricao.ilike.%${searchTerm}%,conta.ilike.%${searchTerm}%`)
    .order('data', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data || []) as Razao[]
}

export async function linkExtrato(
  extratoId: number,
  razaoId: number,
): Promise<void> {
  const { error } = await supabase
    .from('extratos_bancarios')
    .update({ razao_id: razaoId, reconciled: true })
    .eq('id', extratoId)
  if (error) throw error
}

export async function unlinkExtrato(extratoId: number): Promise<void> {
  const { error } = await supabase
    .from('extratos_bancarios')
    .update({ razao_id: null, reconciled: false })
    .eq('id', extratoId)
  if (error) throw error
}
