export enum TipoTransacao {
  Receita = 'Receita',
  Despesa = 'Despesa',
}

export enum FormaPagamento {
  Transferencia = 'Transferência',
  PIX = 'PIX',
  CartaoDebito = 'Cartão Débito',
  CartaoCredito = 'Cartão Crédito',
  DebitoAutomatico = 'Débito Automático',
  ContaCorrente = 'Conta Corrente',
  ContaPoupanca = 'Conta Poupança',
}

export interface Categoria {
  id: string
  nome: string
  icon?: string
}

export interface Transacao {
  id: string
  user_id: string
  date: string
  description: string
  category: string
  amount: number
  payment_method: string
  lote: number | null
  centro_custo_id: number | null
  atividade_id: number | null
  plano_conta_id: number | null
  nota_fiscal_id: number | null
  reconciled: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface ExtratoBancario {
  id: number
  user_id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debit' | 'credit'
  banco_id: number
  created_at?: string | null
  updated_at?: string | null
}

export interface PlanoConta {
  id: number
  user_id: string
  classificacao: string
  descricao: string
  tipo: 'analitica' | 'sintetica'
  created_at?: string | null
  updated_at?: string | null
}

export interface CentroCusto {
  id: number
  user_id: string
  centro_de_custos: string
  created_at?: string | null
  updated_at?: string | null
}

export interface Atividade {
  id: number
  user_id: string
  atividade: string
  created_at?: string | null
  updated_at?: string | null
}

export interface User {
  id: string
  name: string
  totalPaid: number
  avgMonthlySpend: number
  status: 'Ativo' | 'Em Risco'
}

export interface KPIMetric {
  label: string
  value: string | number
  subValue?: string
  trend: number
  trendLabel: string
  progress: number
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray'
  to?: string
}

export interface DashboardKPIs {
  totalBalance: number
  monthIncome: number
  monthExpense: number
  lastMonthIncome: number
  lastMonthExpense: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  expenses: number
}

export interface CategoryDistribution {
  name: string
  value: number
  percentage: number
  color: string
}

export interface PaymentMethodDistribution {
  name: string
  value: number
  color: string
}

export interface NotaFiscal {
  id: number
  user_id: string
  numero_nota: string
  data_emissao: string
  emissor: string
  valor_total: number
  status: string
  created_at?: string | null
  updated_at?: string | null
}

export interface Razao {
  id: number
  user_id: string
  data: string
  conta: string
  descricao: string
  historico?: string | null
  lote?: number | null
  debito: number
  credito: number
  saldo: number
  plano_conta_id?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Banco {
  id: number
  user_id: string
  banco: string
  agencia: string
  conta_corrente: string
  saldo_atual: number
  created_at?: string | null
  updated_at?: string | null
}

export type Role = 'admin' | 'colaborador' | 'visitante'

export interface UserProfile {
  id: string
  full_name: string | null
  role: Role
  avatar_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}
