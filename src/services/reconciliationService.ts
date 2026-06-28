import { supabase } from '@/lib/supabase/client'

export const reconciliationService = {
  async autoReconcile(): Promise<{ matched: number; total: number }> {
    const { data: unreconciled, error } = await supabase
      .from('critica')
      .select('*')
      .eq('reconciled', false)
      .order('date', { ascending: false })

    if (error) throw error

    let matched = 0
    const total = unreconciled?.length || 0

    for (const tx of unreconciled || []) {
      const { data: matches } = await supabase
        .from('razao')
        .select('id')
        .eq('data', tx.date)
        .or(`debito.eq.${tx.amount},credito.eq.${tx.amount}`)
        .limit(1)

      if (matches && matches.length > 0) {
        const { error: updateError } = await supabase
          .from('critica')
          .update({ reconciled: true })
          .eq('id', tx.id)

        if (!updateError) matched++
      }
    }

    return { matched, total }
  },
}
