import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const FECOAGRO_LOGO =
  'https://www.fecoagro.coop.br/wp-content/uploads/2021/10/logo-top.png'

async function extractPdfText(data: Uint8Array): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  // @ts-ignore: workerSrc assignment needed for Deno
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''

  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  })
  const pdf = await loadingTask.promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
  }
  return fullText
}

function parseNotasFiscais(text: string, userId: string) {
  const records: any[] = []
  const notaPattern = /(?:nota\s*fiscal|nf-?e|n[uú]mero)[:\s]*(\d{3,})/gi
  const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/g
  const valuePattern = /r\$\s*([\d.,]+)/gi
  let match
  const numeros: string[] = []
  while ((match = notaPattern.exec(text)) !== null) numeros.push(match[1])
  const datas = [...text.matchAll(datePattern)]
  const valores = [...text.matchAll(valuePattern)]
  const maxLen = Math.max(numeros.length, datas.length, valores.length)
  for (let i = 0; i < Math.min(maxLen, 20); i++) {
    records.push({
      user_id: userId,
      numero_nota: numeros[i] || `IMP-${Date.now()}-${i}`,
      data_emissao: datas[i]
        ? `${datas[i][3]}-${datas[i][2]}-${datas[i][1]}`
        : new Date().toISOString().split('T')[0],
      emissor: 'Importado via PDF',
      valor_total: valores[i]
        ? parseFloat(valores[i][1].replace(/\./g, '').replace(',', '.'))
        : 0,
      status: 'pendente',
    })
  }
  return records
}

function parseRazao(text: string, userId: string) {
  const records: any[] = []
  const contaPattern = /(\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,3})/g
  const valuePattern = /([\d.,]+)/g
  const contas = [...text.matchAll(contaPattern)]
  for (let i = 0; i < Math.min(contas.length, 20); i++) {
    const valor = parseFloat(
      (contas[i].input || '')
        .substring(contas[i].index)
        .match(/[\d.,]+/)?.[0]
        ?.replace(/\./g, '')
        .replace(',', '.') || '0',
    )
    records.push({
      user_id: userId,
      data: new Date().toISOString().split('T')[0],
      conta: contas[i][1],
      descricao: 'Importado via PDF',
      debito: valor > 0 ? valor : 0,
      credito: 0,
      saldo: valor,
    })
  }
  return records
}

function parseBancos(text: string, userId: string) {
  const records: any[] = []
  const bancoPattern = /(?:banco|ag[eê]ncia|conta)[:\s]*([a-z\s\d-]+)/gi
  const valuePattern = /r\$\s*([\d.,]+)/gi
  const valores = [...text.matchAll(valuePattern)]
  const nomes = [...text.matchAll(bancoPattern)]
  const maxLen = Math.max(valores.length, nomes.length)
  for (let i = 0; i < Math.min(maxLen, 10); i++) {
    records.push({
      user_id: userId,
      banco: nomes[i] ? nomes[i][1].trim().substring(0, 50) : `Banco ${i + 1}`,
      agencia: '0001',
      conta_corrente: `${10000 + i}`,
      saldo_atual: valores[i]
        ? parseFloat(valores[i][1].replace(/\./g, '').replace(',', '.'))
        : 0,
    })
  }
  return records
}

function parseTransactions(text: string, userId: string) {
  const records: any[] = []
  const valuePattern = /r\$\s*([\d.,]+)/gi
  const valores = [...text.matchAll(valuePattern)]
  for (let i = 0; i < Math.min(valores.length, 20); i++) {
    records.push({
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      description: `Importado via PDF - Item ${i + 1}`,
      category: 'Importado',
      type: 'Despesa',
      amount: parseFloat(valores[i][1].replace(/\./g, '').replace(',', '.')),
      payment_method: 'Conta Corrente',
      notes: 'Importado automaticamente via PDF',
    })
  }
  return records
}

function parseCentroCustos(text: string, userId: string) {
  const records: any[] = []
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 3)
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    records.push({
      user_id: userId,
      centro_de_custos: lines[i].substring(0, 100),
    })
  }
  return records
}

function parseAtividades(text: string, userId: string) {
  const records: any[] = []
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 3)
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    records.push({
      user_id: userId,
      atividade: lines[i].substring(0, 100),
    })
  }
  return records
}

function parsePlanoContas(
  text: string,
  userId: string,
  startSyntheticId: number = 9000000,
) {
  const records: any[] = []
  const lines = text.split('\n')

  let syntheticIdCounter = startSyntheticId
  const seenIds = new Set<number>()
  const seenClass = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (
      trimmed.includes('FEDERACAO COOPER') ||
      trimmed.includes('Plano de Contas') ||
      (trimmed.includes('Conta') && trimmed.includes('Reduzido')) ||
      trimmed.startsWith('---')
    ) {
      continue
    }

    const match = trimmed.match(
      /^(\d+(?:\.\d+)*)\s+(?:([DC])\s+(\d+)\s+)?(.+)$/,
    )
    if (match) {
      const classificacao = match[1]
      const reduzido = match[3]
      let descricao = match[4].trim()
      descricao = descricao.replace(/\s+\d+\s+\d+\s+\d+$/, '').trim()

      if (!descricao) continue

      const tipo = reduzido ? 'analitica' : 'sintetica'
      const id = reduzido ? parseInt(reduzido, 10) : syntheticIdCounter++

      if (seenIds.has(id) || seenClass.has(classificacao)) continue
      seenIds.add(id)
      seenClass.add(classificacao)

      records.push({
        id,
        user_id: userId,
        classificacao,
        descricao: descricao.substring(0, 255),
        tipo,
      })
    }
  }

  return records
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { filePath, entityType } = await req.json()
    if (!filePath || !entityType) {
      return new Response(
        JSON.stringify({ error: 'filePath and entityType are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: fileData, error: downloadError } =
      await supabaseClient.storage.from('imports').download(filePath)

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const pdfBytes = new Uint8Array(await fileData.arrayBuffer())
    let extractedText = ''
    try {
      extractedText = await extractPdfText(pdfBytes)
    } catch (parseError) {
      console.error('PDF parse error:', parseError)
      return new Response(
        JSON.stringify({
          error:
            'Failed to parse PDF. Ensure the file is a valid PDF document.',
          logo: FECOAGRO_LOGO,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    let records: any[] = []
    let tableName = entityType

    switch (entityType) {
      case 'notas_fiscais':
        records = parseNotasFiscais(extractedText, user.id)
        break
      case 'razao':
        records = parseRazao(extractedText, user.id)
        break
      case 'bancos':
        records = parseBancos(extractedText, user.id)
        break
      case 'transactions':
        records = parseTransactions(extractedText, user.id)
        break
      case 'centro_custos':
        records = parseCentroCustos(extractedText, user.id)
        break
      case 'atividades':
        records = parseAtividades(extractedText, user.id)
        break
      case 'plano_contas': {
        const { data: existingDb } = await adminClient
          .from('plano_contas')
          .select('id, classificacao')
          .eq('user_id', user.id)

        const existingIds = new Set(existingDb?.map((r: any) => r.id) || [])
        const existingClass = new Set(
          existingDb?.map((r: any) => r.classificacao) || [],
        )

        let maxSyntheticId = 9000000
        if (existingDb) {
          for (const r of existingDb) {
            if (r.id >= 9000000)
              maxSyntheticId = Math.max(maxSyntheticId, r.id + 1)
          }
        }

        const parsedRecords = parsePlanoContas(
          extractedText,
          user.id,
          maxSyntheticId,
        )
        records = parsedRecords.filter(
          (r: any) =>
            !existingIds.has(r.id) && !existingClass.has(r.classificacao),
        )
        break
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown entity type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    if (records.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No records could be extracted from the PDF.',
          extractedTextLength: extractedText.length,
          recordsInserted: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let insertedCount = 0
    const chunkSize = 500
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { data: inserted, error: insertError } = await adminClient
        .from(tableName)
        .insert(chunk)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        return new Response(
          JSON.stringify({
            error: 'Failed to insert records',
            detail: insertError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      insertedCount += inserted?.length || 0
    }

    return new Response(
      JSON.stringify({
        message: 'PDF processed successfully',
        recordsInserted: insertedCount,
        entityType,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in process-pdf:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
