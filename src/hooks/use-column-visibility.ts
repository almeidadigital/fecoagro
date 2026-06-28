import { useState, useEffect, useCallback } from 'react'

export function useColumnVisibility(storageKey: string, columnKeys: string[]) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      const stored = sessionStorage.getItem(`col-vis-${storageKey}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const initial: Record<string, boolean> = {}
          columnKeys.forEach((key) => {
            initial[key] = parsed[key] !== false
          })
          return initial
        } catch {
          // ignore parse errors
        }
      }
      const initial: Record<string, boolean> = {}
      columnKeys.forEach((key) => {
        initial[key] = true
      })
      return initial
    },
  )

  useEffect(() => {
    sessionStorage.setItem(
      `col-vis-${storageKey}`,
      JSON.stringify(visibleColumns),
    )
  }, [visibleColumns, storageKey])

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return { visibleColumns, toggleColumn }
}
