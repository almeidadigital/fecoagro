import { format } from 'date-fns'

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const delimiter = ';'
  const csvContent = [
    headers.map(escapeCsvValue).join(delimiter),
    ...rows.map((row) => row.map(escapeCsvValue).join(delimiter)),
  ].join('\r\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function buildExportFilename(moduleName: string): string {
  return `${moduleName}_${format(new Date(), 'yyyy-MM-dd')}.csv`
}

export function formatCurrencyNumber(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

export function formatDateISO(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return format(d, 'yyyy-MM-dd')
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return format(d, 'dd/MM/yyyy')
}
