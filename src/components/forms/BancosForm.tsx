import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Banco } from '@/lib/types'
import { createRecord, updateRecord } from '@/services/crudService'
import { toast } from 'sonner'

const schema = z.object({
  banco: z.string().min(2, 'Nome do banco é obrigatório'),
  saldo_atual: z.coerce.number(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: Banco | null
  onSuccess: () => void
}

export function BancosForm({ open, onOpenChange, editItem, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      banco: '',
      saldo_atual: 0,
    },
  })

  useEffect(() => {
    if (editItem) {
      form.reset({
        banco: editItem.banco,
        saldo_atual: editItem.saldo_atual,
      })
    } else {
      form.reset({
        banco: '',
        saldo_atual: 0,
      })
    }
  }, [editItem, form, open])

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setSubmitting(true)
      if (editItem) {
        await updateRecord('bancos', editItem.id, values)
        toast.success('Conta bancária atualizada com sucesso')
      } else {
        await createRecord('bancos', values)
        toast.success('Conta bancária criada com sucesso')
      }
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao salvar conta bancária')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {editItem ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </SheetTitle>
          <SheetDescription>
            {editItem
              ? 'Edite os dados da conta bancária.'
              : 'Adicione uma nova conta bancária.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Banco do Brasil..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saldo_atual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Atual</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editItem ? (
                  'Salvar Alterações'
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
