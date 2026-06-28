import { useEffect, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
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
import {
  Transacao,
  PlanoConta,
  CentroCusto,
  Atividade,
  FormaPagamento,
} from '@/lib/types'
import { createBatch, updateRecord } from '@/services/crudService'
import { auxiliaryService } from '@/services/auxiliaryService'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface EntryLine {
  description: string
  amount: string
  plano_conta_id: string
  atividade_id: string
  centro_custo_id: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionToEdit?: Transacao | null
  onSuccess: () => void
}

const paymentMethods = Object.values(FormaPagamento)

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
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [entries, setEntries] = useState<EntryLine[]>([
    {
      description: '',
      amount: '0',
      plano_conta_id: '',
      atividade_id: '',
      centro_custo_id: '',
    },
  ])

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
      setCategory(transactionToEdit.category)
      setPaymentMethod(transactionToEdit.payment_method)
      setEntries([
        {
          description: transactionToEdit.description,
          amount: String(transactionToEdit.amount),
          plano_conta_id: transactionToEdit.plano_conta_id?.toString() || '',
          atividade_id: transactionToEdit.atividade_id?.toString() || '',
          centro_custo_id: transactionToEdit.centro_custo_id?.toString() || '',
        },
      ])
    } else {
      setDate(new Date().toISOString().split('T')[0])
      setCategory('')
      setPaymentMethod('')
      setEntries([
        {
          description: '',
          amount: '0',
          plano_conta_id: '',
          atividade_id: '',
          centro_custo_id: '',
        },
      ])
    }
  }, [transactionToEdit, open])

  const addContraPartida = () => {
    setEntries([
      ...entries,
      {
        description: '',
        amount: '0',
        plano_conta_id: '',
        atividade_id: '',
        centro_custo_id: '',
      },
    ])
  }

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index))
    }
  }

  const updateEntry = (
    index: number,
    field: keyof EntryLine,
    value: string,
  ) => {
    setEntries(
      entries.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    )
  }

  const totalAmount = entries.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  )

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      if (!category || !paymentMethod || !date) {
        toast.error('Preencha os campos obrigatórios')
        return
      }
      const validEntries = entries.filter(
        (e) => e.description && Number(e.amount) > 0,
      )
      if (validEntries.length === 0) {
        toast.error('Adicione pelo menos uma entrada válida')
        return
      }

      if (transactionToEdit) {
        const e = validEntries[0]
        await updateRecord('critica', transactionToEdit.id, {
          date,
          description: e.description,
          category,
          amount: Number(e.amount),
          payment_method: paymentMethod,
          plano_conta_id: e.plano_conta_id ? Number(e.plano_conta_id) : null,
          atividade_id: e.atividade_id ? Number(e.atividade_id) : null,
          centro_custo_id: e.centro_custo_id ? Number(e.centro_custo_id) : null,
        })
        toast.success('Crítica atualizada com sucesso')
      } else {
        const { data: loteValue, error: loteError } =
          await supabase.rpc('get_next_lote')
        if (loteError) throw loteError

        const records = validEntries.map((e) => ({
          date,
          description: e.description,
          category,
          amount: Number(e.amount),
          payment_method: paymentMethod,
          lote: loteValue,
          reconciled: false,
          plano_conta_id: e.plano_conta_id ? Number(e.plano_conta_id) : null,
          atividade_id: e.atividade_id ? Number(e.atividade_id) : null,
          centro_custo_id: e.centro_custo_id ? Number(e.centro_custo_id) : null,
        }))
        await createBatch('critica', records)
        toast.success(`${validEntries.length} crítica(s) criada(s) com sucesso`)
      }
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao salvar crítica')
    } finally {
      setSubmitting(false)
    }
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v)

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
              <Label className="mb-1.5 block text-sm font-medium">
                Categoria
              </Label>
              <Input
                placeholder="Categoria..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              Forma de Pagamento
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Lançamentos</h3>
              {!transactionToEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContraPartida}
                >
                  <Plus className="w-3 h-3 mr-1" /> Incluir Contra Partida
                </Button>
              )}
            </div>

            {entries.map((entry, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 mb-3 space-y-3 relative"
              >
                {entries.length > 1 && (
                  <button
                    onClick={() => removeEntry(index)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <Label className="mb-1 block text-xs">Histórico</Label>
                  <Input
                    placeholder="Descrição..."
                    value={entry.description}
                    onChange={(e) =>
                      updateEntry(index, 'description', e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block text-xs">Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={entry.amount}
                      onChange={(e) =>
                        updateEntry(index, 'amount', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs">
                      Plano de Contas
                    </Label>
                    <Select
                      value={entry.plano_conta_id}
                      onValueChange={(v) =>
                        updateEntry(index, 'plano_conta_id', v)
                      }
                    >
                      <SelectTrigger className="text-xs">
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
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block text-xs">Atividade</Label>
                    <Select
                      value={entry.atividade_id}
                      onValueChange={(v) =>
                        updateEntry(index, 'atividade_id', v)
                      }
                    >
                      <SelectTrigger className="text-xs">
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
                    <Label className="mb-1 block text-xs">
                      Centro de Custos
                    </Label>
                    <Select
                      value={entry.centro_custo_id}
                      onValueChange={(v) =>
                        updateEntry(index, 'centro_custo_id', v)
                      }
                    >
                      <SelectTrigger className="text-xs">
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
              </div>
            ))}

            {entries.length > 1 && (
              <div className="flex justify-between items-center bg-gray-50 rounded-lg p-2 px-3">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {fmtCurrency(totalAmount)}
                </span>
              </div>
            )}
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
