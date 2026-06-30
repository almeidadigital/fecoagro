import { supabase } from '@/lib/supabase/client'

export interface AIReconcileSummary {
  autoReconciled: number
  suggested: number
  manualReview: number
  total: number
}

export interface AIReconcileSuggestion {
  extrato_id: number
  critica_id: string
  confidence: number
  reasoning: string
  extrato_descricao: string
  extrato_valor: number
  extrato_data: string
  critica_historico: string | null
  critica_amount: number
  critica_date: string
}

export interface AIReconcileResult {
  status: string
  message?: string
  summary: AIReconcileSummary
  suggestions: AIReconcileSuggestion[]
}

export async function triggerAIReconcile(
  bancoId: number | null,
  dateFrom?: string,
  dateTo?: string,
): Promise<AIReconcileResult> {
  const { data, error } = await supabase.functions.invoke('ai-reconcile', {
    body: { bank_id: bancoId, date_from: dateFrom, date_to: dateTo },
  })
  if (error) throw error
  return data as AIReconcileResult
}

export async function approveSuggestion(
  extratoId: number,
  criticaId: string,
): Promise<void> {
  const reconciliationId = crypto.randomUUID()
  const { error: extratoError } = await supabase
    .from('extratos_bancarios')
    .update({
      reconciled: true,
      ai_confidence: 1,
      ai_reconciliation_id: reconciliationId,
    })
    .eq('id', extratoId)
  if (extratoError) throw extratoError

  const { error: criticaError } = await supabase
    .from('critica')
    .update({
      reconciled: true,
      ai_confidence: 1,
      ai_reconciliation_id: reconciliationId,
    })
    .eq('id', criticaId)
  if (criticaError) throw criticaError
}

export async function rejectSuggestion(extratoId: number): Promise<void> {
  const { error } = await supabase
    .from('extratos_bancarios')
    .update({
      ai_confidence: null,
      ai_reasoning: null,
      ai_reconciliation_id: null,
    })
    .eq('id', extratoId)
  if (error) throw error
}

export async function fetchPendingSuggestions(
  bancoId: number | null,
): Promise<AIReconcileSuggestion[]> {
  let query = supabase
    .from('extratos_bancarios')
    .select('*')
    .eq('reconciled', false)
    .not('ai_confidence', 'is', null)
    .gte('ai_confidence', 0.6)
    .lt('ai_confidence', 0.9)
  if (bancoId) query = query.eq('banco_id', bancoId)

  const { data: extratos, error } = await query.order('ai_confidence', {
    ascending: false,
  })
  if (error) throw error
  if (!extratos || extratos.length === 0) return []

  const reconIds = extratos
    .filter((e) => e.ai_reconciliation_id)
    .map((e) => e.ai_reconciliation_id)
  if (reconIds.length === 0) return []

  const { data: criticas } = await supabase
    .from('critica')
    .select('*')
    .in('ai_reconciliation_id', reconIds)

  const criticaMap = new Map(
    (criticas || []).map((c) => [c.ai_reconciliation_id, c]),
  )

  return extratos.map((e) => {
    const critica = criticaMap.get(e.ai_reconciliation_id)
    return {
      extrato_id: e.id,
      critica_id: critica?.id || '',
      confidence: e.ai_confidence,
      reasoning: e.ai_reasoning || '',
      extrato_descricao: e.descricao,
      extrato_valor: e.valor,
      extrato_data: e.data,
      critica_historico: critica?.historico || null,
      critica_amount: critica?.amount || 0,
      critica_date: critica?.date || '',
    }
  })
}
