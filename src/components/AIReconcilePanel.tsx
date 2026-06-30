import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Loader2, Check, X, Info, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  triggerAIReconcile,
  approveSuggestion,
  rejectSuggestion,
  fetchPendingSuggestions,
  AIReconcileSuggestion,
  AIReconcileSummary,
} from '@/services/aiReconcileService'
import { cn } from '@/lib/utils'

interface Props {
  bancoId: number | null
  onReconciled: () => void
}

export function AIReconcilePanel({ bancoId, onReconciled }: Props) {
  const [processing, setProcessing] = useState(false)
  const [summary, setSummary] = useState<AIReconcileSummary | null>(null)
  const [suggestions, setSuggestions] = useState<AIReconcileSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  const loadSuggestions = useCallback(async () => {
    try {
      const result = await fetchPendingSuggestions(bancoId)
      setSuggestions(result)
    } catch {
      /* silent */
    } finally {
      setLoadingSuggestions(false)
    }
  }, [bancoId])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const handleReconcile = async () => {
    setProcessing(true)
    setSummary(null)
    try {
      const result = await triggerAIReconcile(bancoId)
      setSummary(result.summary)
      if (result.suggestions.length > 0) {
        setSuggestions((prev) => [...result.suggestions, ...prev])
      }
      if (result.status === 'already_processing') {
        toast.warning('Processamento ja em andamento. Aguarde.')
      } else {
        if (result.summary.autoReconciled > 0) {
          toast.success(
            `${result.summary.autoReconciled} item(s) conciliado(s) automaticamente!`,
          )
          onReconciled()
        }
        if (result.summary.suggested > 0) {
          toast.info(
            `${result.summary.suggested} sugestao(oes) aguardando confirmacao`,
          )
        }
        if (result.summary.manualReview > 0) {
          toast.info(
            `${result.summary.manualReview} item(s) marcados para revisao manual`,
          )
        }
      }
    } catch {
      toast.error('Erro ao processar reconciliacao com IA')
    } finally {
      setProcessing(false)
    }
  }

  const handleApprove = async (s: AIReconcileSuggestion) => {
    try {
      await approveSuggestion(s.extrato_id, s.critica_id)
      toast.success('Sugestao aprovada e conciliada!')
      setSuggestions((prev) =>
        prev.filter((x) => x.extrato_id !== s.extrato_id),
      )
      onReconciled()
    } catch {
      toast.error('Erro ao aprovar sugestao')
    }
  }

  const handleReject = async (s: AIReconcileSuggestion) => {
    try {
      await rejectSuggestion(s.extrato_id)
      toast.success('Sugestao rejeitada')
      setSuggestions((prev) =>
        prev.filter((x) => x.extrato_id !== s.extrato_id),
      )
    } catch {
      toast.error('Erro ao rejeitar sugestao')
    }
  }

  return (
    <Card className="rounded-xl border shadow-sm border-purple-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Reconciliacao com IA
          </span>
          <Button
            onClick={handleReconcile}
            disabled={processing || !bancoId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Conciliar com IA
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <p className="text-sm text-gray-500">
              Analisando extratos com inteligencia artificial...
            </p>
          </div>
        )}
        {summary && !processing && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {summary.autoReconciled}
              </p>
              <p className="text-xs text-gray-500">Auto-conciliado</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {summary.suggested}
              </p>
              <p className="text-xs text-gray-500">Sugestoes</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {summary.manualReview}
              </p>
              <p className="text-xs text-gray-500">Revisao manual</p>
            </div>
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Sugestoes da IA
            </h3>
            {suggestions.map((s) => (
              <div
                key={s.extrato_id}
                className="border rounded-lg p-3 space-y-2 bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.extrato_descricao}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(s.extrato_data), 'dd/MM/yyyy')} ·{' '}
                      {formatCurrency(s.extrato_valor)}
                    </p>
                    {s.critica_historico && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        ↔ {s.critica_historico} ·{' '}
                        {formatCurrency(s.critica_amount)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      className={cn(
                        'text-xs',
                        s.confidence >= 0.8
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {Math.round(s.confidence * 100)}%
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{s.reasoning}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(s)}
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" /> Confiar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(s)}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" /> Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!processing &&
          !summary &&
          suggestions.length === 0 &&
          !loadingSuggestions && (
            <p className="text-sm text-gray-400 text-center py-4">
              Clique em "Conciliar com IA" para iniciar a analise automatica.
            </p>
          )}
      </CardContent>
    </Card>
  )
}
