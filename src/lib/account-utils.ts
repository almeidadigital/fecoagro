export function suggestNatureza(
  classificacao: string,
): 'Devedora' | 'Credora' | '' {
  const prefix = (classificacao || '').trim().charAt(0)
  if (prefix === '1' || prefix === '4' || prefix === '5') return 'Devedora'
  if (prefix === '2' || prefix === '3') return 'Credora'
  return ''
}

export function getLevel(classificacao: string): number {
  return (classificacao || '').split('.').filter(Boolean).length
}

export function isAnalyticalAccount(
  classificacao: string,
  allClassifications: string[],
): boolean {
  const prefix = classificacao + '.'
  return !allClassifications.some((c) => c.startsWith(prefix))
}

export function getDCIndicator(
  debito: number,
  credito: number,
): 'D' | 'C' | '' {
  if (debito > credito) return 'D'
  if (credito > debito) return 'C'
  return ''
}

export interface FinancialTreeNode {
  id: number
  classificacao: string
  descricao: string
  natureza: string | null
  level: number
  isAnalytical: boolean
  debito: number
  credito: number
  saldo: number
  children: FinancialTreeNode[]
}

interface AccountAggregate {
  id: number
  classificacao: string
  descricao: string
  natureza: string | null
  debito: number
  credito: number
  saldo: number
}

export function buildAccountTree(
  accounts: AccountAggregate[],
): FinancialTreeNode[] {
  const sorted = [...accounts].sort((a, b) =>
    a.classificacao.localeCompare(b.classificacao, undefined, {
      numeric: true,
    }),
  )
  const allClassifications = sorted.map((a) => a.classificacao)
  const map = new Map<string, FinancialTreeNode>()

  for (const a of sorted) {
    map.set(a.classificacao, {
      ...a,
      level: getLevel(a.classificacao),
      isAnalytical: isAnalyticalAccount(a.classificacao, allClassifications),
      children: [],
    })
  }

  const roots: FinancialTreeNode[] = []
  for (const a of sorted) {
    const node = map.get(a.classificacao)!
    const parts = a.classificacao.split('.')
    let parentKey: string | null = null
    for (let i = parts.length - 1; i > 0; i--) {
      const candidate = parts.slice(0, i).join('.')
      if (map.has(candidate)) {
        parentKey = candidate
        break
      }
    }
    if (parentKey) map.get(parentKey)!.children.push(node)
    else roots.push(node)
  }

  function rollUp(node: FinancialTreeNode): void {
    for (const child of node.children) {
      rollUp(child)
      node.debito += child.debito
      node.credito += child.credito
      node.saldo += child.saldo
    }
  }
  roots.forEach(rollUp)
  return roots
}

export function filterTreeWithMovement(
  nodes: FinancialTreeNode[],
): FinancialTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: filterTreeWithMovement(node.children),
    }))
    .filter((n) => n.debito !== 0 || n.credito !== 0 || n.children.length > 0)
}

export function flattenTree(
  tree: FinancialTreeNode[],
  maxLevel: number | 'all',
): FinancialTreeNode[] {
  const result: FinancialTreeNode[] = []
  function traverse(nodes: FinancialTreeNode[], depth: number) {
    for (const node of nodes) {
      result.push(node)
      if (maxLevel === 'all' || depth < maxLevel) {
        traverse(node.children, depth + 1)
      }
    }
  }
  traverse(tree, 1)
  return result
}
