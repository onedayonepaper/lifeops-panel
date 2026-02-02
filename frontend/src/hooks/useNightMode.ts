import { useState, useEffect } from 'react'
import { isNightMode } from '../store/settings'

export function useNightMode(nightModeStart: string, nightModeEnd: string): boolean {
  const [isNight, setIsNight] = useState(() => isNightMode(nightModeStart, nightModeEnd))

  useEffect(() => {
    // Check immediately
    setIsNight(isNightMode(nightModeStart, nightModeEnd))

    // Check every minute
    const interval = setInterval(() => {
      setIsNight(isNightMode(nightModeStart, nightModeEnd))
    }, 60000)

    return () => clearInterval(interval)
  }, [nightModeStart, nightModeEnd])

  return isNight
}
