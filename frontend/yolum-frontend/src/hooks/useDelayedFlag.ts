import { useEffect, useState } from 'react'

export function useDelayedFlag(active: boolean, delayMs = 5_000): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(active), active ? delayMs : 0)
    return () => window.clearTimeout(timeoutId)
  }, [active, delayMs])

  return active && visible
}
