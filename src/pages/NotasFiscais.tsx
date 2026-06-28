import { useState, useEffect, useCallback } from 'react'
import { Plus, FileUp, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { NotasFiscaisForm } from '@/components/forms/NotasFiscaisForm'
import { PdfImportModal } from '@/components/pdf/PdfImportModal'
import { NotaFiscalViewDialog } from '@/components/NotaFiscalViewDialog'
import { NotaFiscal } from '@/lib/types'
import { fetchWithFilters, deleteRecord } from '@/services/crudService'
import { toast } from 'sonner'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    v,
  )

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  aprovada: 'bg-green-50 text-green-700 border-green-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
}

const NotasFiscais = () => {
  const [data, setData] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [editItem, setEditItem] = useState<NotaFiscal | null>(null)
  const [viewItem, setViewItem] = useState<NotaFiscal | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [numeroFilter, setNumeroFilter] = useState('')
  const [emissorFilter, setEmissorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const andFilters: Array<{
        column: string
        value: string
        isText?: boolean
      }> = []
      if (emissorFilter.trim()) {
        andFilters.push({
          column: 'emissor',
          value: emissorFilter.trim(),
          isText: true,
        })
      }
      if (numeroFilter.trim()) {
        andFilters.push({ column: 'numero_nota', value: numeroFilter.trim() })
      }
      const result = await fetchWithFilters<NotaFiscal>('notas_fiscais', {
        andFilters,
        eqColumn: statusFilter !== 'all' ? 'status' : undefined,
        eqValue: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setData(result)
    } catch {
      toast.error('Erro ao carregar notas fiscais')
    } finally {
      setLoading(false)
    }
  }, [emissorFilter, numeroFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const handleCreate = () => {
    setEditItem(null)
    setFormOpen(true)
  }
  const handleEdit = (item: NotaFiscal) => {
    setEditItem(item)
    setFormOpen(true)
  }
  const handleView = (item: NotaFiscal) => {
    setViewItem(item)
    setViewOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais</h1>
          <p className="text-gray-500">
            Gerencie suas notas fiscais e documentos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPdfOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" /> Importar PDF
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nova Nota
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Número
          </label>
          <Input
            type="number"
            placeholder="Filtrar por número..."
            value={numeroFilter}
            onChange={(e) => setNumeroFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Emissor
          </label>
          <Input
            type="text"
            placeholder="Filtrar por emissor..."
            value={emissorFilter}
            onChange={(e) => setEmissorFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-white shadow-sm">
          <p className="text-gray-500 mb-2">Nenhuma nota fiscal encontrada.</p>
          <p className="text-sm text-gray-400">
            Adicione uma nova nota ou importe via PDF.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Número</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Emissor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-gray-900">
                    {item.numero_nota}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(item.data_emissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {item.emissor}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    {formatCurrency(item.valor_total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[item.status] || ''}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleView(item)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação excluirá permanentemente a nota fiscal.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={async () => {
                                await deleteRecord('notas_fiscais', item.id)
                                setData((prev) =>
                                  prev.filter((i) => i.id !== item.id),
                                )
                                toast.success('Nota fiscal excluída')
                              }}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NotasFiscaisForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        onSuccess={loadData}
      />
      <PdfImportModal
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        entityType="notas_fiscais"
        onSuccess={loadData}
      />
      <NotaFiscalViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        item={viewItem}
      />
    </div>
  )
}

export default NotasFiscais
