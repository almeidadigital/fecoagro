import { useState, useEffect, useCallback } from 'react'
import { Loader2, Link2, Search, Unlink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { ExtratoBancario, Razao } from '@/lib/types'
import {
  fetchRazaoSuggestions,
  searchRazao,
  linkExtrato,
  unlinkExtrato,
} from '@/services/extratoService'
import { formatCurrency } from '@/lib/format'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  extrato: ExtratoBancario | null
  onSuccess: () => void
}

export function ReconciliationSheet({
  open,
  onOpenChange,
  extrato,
  onSuccess,
}: Props) {
  const [suggestions, setSuggestions] = useState<Razao[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Razao[]>([])
  const [selectedRazao, setSelectedRazao] = useState<Razao | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadSuggestions = useCallback(async () => {
    if (!extrato) return
    try {
      setLoading(true)
      const result = await fetchRazaoSuggestions(extrato.valor, extrato.data)
      setSuggestions(result)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [extrato])

  useEffect(() => {
    if (open && extrato) {
      loadSuggestions()
      setSearchTerm('')
      setSearchResults([])
      setSelectedRazao(null)
    }
  }, [open, extrato, loadSuggestions])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    try {
      setLoading(true)
      const result = await searchRazao(searchTerm)
      setSearchResults(result)
    } catch {
      toast.error('Erro ao buscar lançamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async () => {
    if (!extrato || !selectedRazao) return
    try {
      setSubmitting(true)
      await linkExtrato(extrato.id, selectedRazao.id)
      toast.success('Lançamento vinculado com sucesso')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao vincular lançamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlink = async () => {
    if (!extrato) return
    try {
      setSubmitting(true)
      await unlinkExtrato(extrato.id)
      toast.success('Lançamento desvinculado')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao desvincular')
    } finally {
      setSubmitting(false)
    }
  }

  if (!extrato) return null

  const renderRazaoItem = (r: Razao) => (
    <button
      key={r.id}
      onClick={() => setSelectedRazao(r)}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        selectedRazao?.id === r.id
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-mono text-gray-400">#{r.id}</span>
        <span className="text-xs text-gray-500">
          {format(new Date(r.data), 'dd/MM/yyyy')}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900 truncate">
        {r.descricao}
      </p>
      <div className="flex gap-3 mt-1">
        {r.debito > 0 && (
          <span className="text-xs font-bold text-red-600">
            D: {formatCurrency(r.debito)}
          </span>
        )}
        {r.credito > 0 && (
          <span className="text-xs font-bold text-green-600">
            C: {formatCurrency(r.credito)}
          </span>
        )}
      </div>
    </button>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>Reconciliação Bancária</SheetTitle>
          <SheetDescription>
            Vincule este extrato a um lançamento do razão
          </SheetDescription>
        </SheetHeader>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Extrato
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Data</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(extrato.data), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tipo</p>
              <p className="text-sm font-medium text-gray-900">
                {extrato.tipo === 'credit' ? 'Crédito' : 'Débito'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Descrição</p>
              <p className="text-sm font-medium text-gray-900">
                {extrato.descricao}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Valor</p>
              <p
                className={cn(
                  'text-sm font-bold',
                  extrato.tipo === 'credit' ? 'text-green-600' : 'text-red-600',
                )}
              >
                {formatCurrency(extrato.valor)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <Badge
                variant="secondary"
                className={cn(
                  extrato.reconciled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700',
                )}
              >
                {extrato.reconciled ? 'Reconciliado' : 'Pendente'}
              </Badge>
            </div>
          </div>
        </div>

        {extrato.reconciled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Este extrato já está reconciliado.
              </p>
            </div>
            <SheetFooter>
              <Button
                variant="outline"
                onClick={handleUnlink}
                disabled={submitting}
                className="w-full text-red-600 hover:bg-red-50"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="mr-2 h-4 w-4" />
                )}
                Desvincular Lançamento
              </Button>
            </SheetFooter>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Sugestões (±3 dias, valor compatível)
              </h3>
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map(renderRazaoItem)}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">
                  Nenhuma sugestão encontrada.
                </p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Busca Manual
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Buscar por descrição ou conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white"
                />
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(renderRazaoItem)}
                </div>
              )}
            </div>

            <SheetFooter>
              <Button
                onClick={handleLink}
                disabled={!selectedRazao || submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="mr-2 h-4 w-4" />
                )}
                Confirmar Vínculo
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
