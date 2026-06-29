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
import { Atividade } from '@/lib/types'
import { createRecord, updateRecord } from '@/services/crudService'
import { toast } from 'sonner'

const schema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'ID deve ser um número' })
    .int('ID deve ser um número inteiro')
    .positive('ID deve ser positivo')
    .min(1, 'ID é obrigatório'),
  atividade: z.string().min(2, 'Nome da atividade é obrigatório'),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: Atividade | null
  onSuccess: () => void
}

export function AtividadesForm({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { id: 0, atividade: '' },
  })

  useEffect(() => {
    form.reset({
      id: editItem?.id ?? 0,
      atividade: editItem?.atividade || '',
    })
  }, [editItem, form, open])

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setSubmitting(true)
      if (editItem) {
        const { id: _id, ...updates } = values
        await updateRecord('atividades', editItem.id, updates)
        toast.success('Atividade atualizada')
      } else {
        await createRecord('atividades', values)
        toast.success('Atividade criada')
      }
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao salvar atividade')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {editItem ? 'Editar Atividade' : 'Nova Atividade'}
          </SheetTitle>
          <SheetDescription>
            {editItem ? 'Edite os dados.' : 'Adicione uma nova atividade.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 501"
                      disabled={!!editItem}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? 0 : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="atividade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atividade</FormLabel>
                  <FormControl>
                    <Input placeholder="Venda de produtos..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{' '}
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
                  'Criar Atividade'
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
