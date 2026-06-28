import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Razao } from '@/lib/types'
import { format } from 'date-fns'

interface StatementViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Razao | null
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v)

export function StatementViewDialog({
  open,
  onOpenChange,
  item,
}: StatementViewDialogProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visualização de Extrato</DialogTitle>
          <DialogDescription>Detalhes do lançamento contábil</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4 p-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">ID</label>
                <p className="text-sm font-mono text-gray-900">{item.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Data
                </label>
                <p className="text-sm text-gray-900">
                  {format(new Date(item.data), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Conta</label>
              <p className="text-sm font-mono text-gray-900">{item.conta}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Descrição
              </label>
              <p className="text-sm text-gray-900">{item.descricao}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Débito
                </label>
                <p className="text-sm font-bold text-red-600">
                  {formatCurrency(item.debito)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Crédito
                </label>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency(item.credito)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Saldo
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(item.saldo)}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
