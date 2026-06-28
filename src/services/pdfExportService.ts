import { supabase } from '@/lib/supabase/client'

export interface PdfColumn {
  header: string
  key: string
}

export async function generatePdfReport(
  title: string,
  columns: PdfColumn[],
  rows: Record<string, string | number | null | undefined>[],
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, columns, rows }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate PDF')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
