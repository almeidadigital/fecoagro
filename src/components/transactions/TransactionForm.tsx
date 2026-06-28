import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Transacao, PlanoConta, CentroCusto, Atividade } from '@/lib/types'
import { createRecord, updateRecord } from '@/services/crudService'
import { auxiliaryService } from '@/services/auxiliaryService'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionToEdit?: Transacao | null
  onSuccess: () => void
}

export function TransactionForm({
  open,
  onOpenChange,
  transactionToEdit,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [planoContas, setPlanoContas] = useState<PlanoConta[]>([])
  const [centroCustos, setCentroCustos] = useState<CentroCusto[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [lote, setLote] = useState('')
  const [status, setStatus] = useState('pendente')
  const [historico, setHistorico] = useState('')
  const [amount, setAmount] = useState('0')
  const [planoContaId, setPlanoContaId] = useState('')
  const [atividadeId, setAtividadeId] = useState('')
  const [centroCustoId, setCentroCustoId] = useState('')

  useEffect(() => {
    Promise.all([
      auxiliaryService.fetchPlanoContas(),
      auxiliaryService.fetchCentroCustos(),
      auxiliaryService.fetchAtividades(),
    ])
      .then(([pc, cc, at]) => {
        setPlanoContas(pc)
        setCentroCustos(cc)
        setAtividades(at)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (transactionToEdit) {
      setDate(transactionToEdit.date)
      setLote(transactionToEdit.lote?.toString() || '')
      setStatus(transactionToEdit.status || 'pendente')
      setHistorico(transactionToEdit.description || '')
      setAmount(String(transactionToEdit.amount || 0))
      setPlanoContaId(transactionToEdit.plano_conta_id?.toString() || '')
      setAtividadeId(transactionToEdit.atividade_id?.toString() || '')
      setCentroCustoId(transactionToEdit.centro_custo_id?.toString() || '')
    } else {
      setDate(new Date().toISOString().split('T')[0])
      setLote('')
      setStatus('pendente')
      setHistorico('')
      setAmount('0')
      setPlanoContaId('')
      setAtividadeId('')
      setCentroCustoId('')
      supabase.rpc('get_next_lote').then(({ data }) => {
        if (data !== null && data !== undefined) setLote(String(data))
      })
    }
  }, [transactionToEdit, open])

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      if (!historico || !date) {
        toast.error('Preencha os campos obrigatórios')
        return
      }

      const payload = {
        date,
        description: historico,
        lote: lote ? Number(lote) : null,
        status,
        amount: Number(amount) || 0,
        plano_conta_id: planoContaId ? Number(planoContaId) : null,
        atividade_id: atividadeId ? Number(atividadeId) : null,
        centro_custo_id: centroCustoId ? Number(centroCustoId) : null,
      }

      if (transactionToEdit) {
        await updateRecord('critica', transactionToEdit.id, payload)
        toast.success('Crítica atualizada com sucesso')
      } else {
        await createRecord('critica', payload)
        toast.success('Crítica criada com sucesso')
      }
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao salvar crítica')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {transactionToEdit ? 'Editar Crítica' : 'Nova Crítica'}
          </SheetTitle>
          <SheetDescription>
            {transactionToEdit
              ? 'Edite os dados da crítica contábil.'
              : 'Adicione uma nova crítica contábil.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Lote</Label>
              <Input
                type="number"
                placeholder="0"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              Histórico
            </Label>
            <Input
              placeholder="Descrição..."
              value={historico}
              onChange={(e) => setHistorico(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              Plano de Contas
            </Label>
            <Select value={planoContaId} onValueChange={setPlanoContaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {planoContas.map((pc) => (
                  <SelectItem key={pc.id} value={pc.id.toString()}>
                    {pc.id} - {pc.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">
                Atividade
              </Label>
              <Select value={atividadeId} onValueChange={setAtividadeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {atividades.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.id} - {a.atividade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">
                Centro de Custos
              </Label>
              <Select value={centroCustoId} onValueChange={setCentroCustoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {centroCustos.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.id} - {c.centro_de_custos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : transactionToEdit ? (
                'Salvar Alterações'
              ) : (
                'Criar Crítica'
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
