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
import { CentroCusto } from '@/lib/types'
import { createRecord, updateRecord } from '@/services/crudService'
import { toast } from 'sonner'

const schema = z.object({
  centro_de_custos: z.string().min(2, 'Nome do centro de custo é obrigatório'),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: CentroCusto | null
  onSuccess: () => void
}

export function CentroCustosForm({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { centro_de_custos: '' },
  })

  useEffect(() => {
    form.reset({ centro_de_custos: editItem?.centro_de_custos || '' })
  }, [editItem, form, open])

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setSubmitting(true)
      if (editItem) {
        await updateRecord('centro_custos', editItem.id, values)
        toast.success('Centro de custo atualizado')
      } else {
        await createRecord('centro_custos', values)
        toast.success('Centro de custo criado')
      }
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('Erro ao salvar centro de custo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {editItem ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </SheetTitle>
          <SheetDescription>
            {editItem ? 'Edite os dados.' : 'Adicione um novo centro de custo.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="centro_de_custos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Custos</FormLabel>
                  <FormControl>
                    <Input placeholder="Departamento de TI..." {...field} />
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
                  'Criar Centro'
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
