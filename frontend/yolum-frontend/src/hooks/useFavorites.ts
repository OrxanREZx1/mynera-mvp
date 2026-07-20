import * as React from 'react'

const STORAGE_KEY = 'yolum_favorite_mentors'

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [ids, setIds] = React.useState<string[]>(readStored)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggle = React.useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const isFavorite = React.useCallback((id: string) => ids.includes(id), [ids])

  return { favoriteIds: ids, toggle, isFavorite }
}
