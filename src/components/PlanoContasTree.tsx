import { useState, useMemo, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlanoConta } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TreeNode {
  account: PlanoConta
  children: TreeNode[]
}

function buildTree(accounts: PlanoConta[]): TreeNode[] {
  const sorted = [...accounts].sort((a, b) =>
    (a.classificacao ?? '').localeCompare(b.classificacao ?? '', undefined, {
      numeric: true,
    }),
  )
  const map = new Map<string, TreeNode>()
  for (const a of sorted) {
    map.set(a.classificacao ?? '', { account: a, children: [] })
  }
  const roots: TreeNode[] = []
  for (const a of sorted) {
    const node = map.get(a.classificacao ?? '')!
    const parts = (a.classificacao ?? '').split('.')
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
  return roots
}

function allKeys(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [
    n.account.classificacao ?? '',
    ...allKeys(n.children),
  ])
}

function NodeView({
  node,
  depth,
  expanded,
  toggle,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  toggle: (k: string) => void
}) {
  const key = node.account.classificacao ?? ''
  const isOpen = expanded.has(key)
  const hasChildren = node.children.length > 0
  const isRoot = key.split('.').length === 1

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50',
          isRoot && 'bg-gray-50/80',
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => hasChildren && toggle(key)}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span
          className={cn(
            'font-mono text-xs w-28 shrink-0',
            isRoot ? 'text-gray-700' : 'text-gray-400',
          )}
        >
          {key}
        </span>
        <span
          className={cn(
            'text-sm truncate flex-1',
            isRoot ? 'uppercase font-bold text-gray-900' : 'text-gray-700',
          )}
        >
          {node.account.descricao}
        </span>
        <Badge
          variant="secondary"
          className={cn(
            'shrink-0',
            node.account.tipo === 'analitica'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700',
          )}
        >
          {node.account.tipo}
        </Badge>
      </div>
      {isOpen &&
        node.children.map((child) => (
          <NodeView
            key={child.account.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
    </>
  )
}

export function PlanoContasTree({ data }: { data: PlanoConta[] }) {
  const tree = useMemo(() => buildTree(data), [data])
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const root of tree) {
      initial.add(root.account.classificacao ?? '')
      for (const child of root.children) {
        initial.add(child.account.classificacao ?? '')
      }
    }
    return initial
  })

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpanded(new Set(allKeys(tree)))
  }, [tree])

  const collapseAll = useCallback(() => {
    setExpanded(new Set(tree.map((r) => r.account.classificacao ?? '')))
  }, [tree])

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50/50">
        <span className="text-sm text-gray-500">{data.length} contas</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            <ChevronsUpDown className="w-4 h-4 mr-1" /> Expandir
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            <ChevronsDownUp className="w-4 h-4 mr-1" /> Recolher
          </Button>
        </div>
      </div>
      <div className="max-h-[600px] overflow-auto">
        {tree.map((node) => (
          <NodeView
            key={node.account.id}
            node={node}
            depth={0}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
      </div>
    </div>
  )
}
