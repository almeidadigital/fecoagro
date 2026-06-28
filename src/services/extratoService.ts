import { supabase } from '@/lib/supabase/client'
import { ExtratoBancario } from '@/lib/types'

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
