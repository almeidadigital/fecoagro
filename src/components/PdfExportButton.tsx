import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePdfReport, PdfColumn } from '@/services/pdfExportService'
import { toast } from 'sonner'

interface PdfExportButtonProps {
  title: string
  columns: PdfColumn[]
  data: Record<string, string | number | null | undefined>[]
  disabled?: boolean
}

export function PdfExportButton({
  title,
  columns,
  data,
  disabled,
}: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar')
      return
    }
    setLoading(true)
    try {
      await generatePdfReport(title, columns, data)
      toast.success('PDF exportado com sucesso')
    } catch {
      toast.error('Erro ao gerar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading || disabled}
    >
      <FileDown className="w-4 h-4 mr-2" />
      {loading ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  )
}
