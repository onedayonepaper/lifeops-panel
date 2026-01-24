import { useState, useEffect, useCallback, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { isAfter, format, subDays } from 'date-fns'
import { db, type DayState, type Settings } from '../store/db'
import {
  getOrCreateTodayState,
  addStudyMinutes,
  updateRunPlan,
  toggleRunDone,
  updateNotes,
  getWeeklyStudyMinutes
} from '../store/dayState'
import { getSettings } from '../store/settings'
import type { RunPlan } from '../store/db'

// Calculate effective date key based on reset time (same logic as getOrCreateTodayState)
function getEffectiveDateKey(resetTime: string): string {
  const now = new Date()
  const todayKey = format(now, 'yyyy-MM-dd')
  const yesterdayKey = format(subDays(now, 1), 'yyyy-MM-dd')

  const [hours, minutes] = resetTime.split(':').map(Number)
  const resetDateTime = new Date()
  resetDateTime.setHours(hours, minutes, 0, 0)

  return isAfter(now, resetDateTime) ? todayKey : yesterdayKey
}

interface UseDayStateReturn {
  dayState: DayState | null
  settings: Settings | null
  weeklyStudyMinutes: number
  isLoading: boolean
  error: string | null
  clearError: () => void
  actions: {
    addStudyMinutes: (minutes: number) => Promise<void>
    updateRunPlan: (plan: RunPlan) => Promise<void>
    toggleRunDone: () => Promise<void>
    updateNotes: (notes: string[]) => Promise<void>
    refreshWeeklyStats: () => Promise<void>
  }
}

export function useDayState(): UseDayStateReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyStudyMinutes, setWeeklyStudyMinutes] = useState(0)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [effectiveDateKey, setEffectiveDateKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use refs for interval to avoid stale closures
  const settingsRef = useRef<Settings | null>(null)
  const effectiveDateKeyRef = useRef<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Initialize on mount only
  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const s = await getSettings()
        if (!isMounted) return

        setSettings(s)
        settingsRef.current = s

        // Calculate effective date key using same logic as getOrCreateTodayState
        const dateKey = getEffectiveDateKey(s.resetTime)
        setEffectiveDateKey(dateKey)
        effectiveDateKeyRef.current = dateKey

        await getOrCreateTodayState(s.resetTime)
        if (!isMounted) return

        const weekly = await getWeeklyStudyMinutes()
        if (!isMounted) return

        setWeeklyStudyMinutes(weekly)
      } catch (e) {
        console.error('[DayState] Init error:', e)
        if (isMounted) {
          setError('초기화에 실패했습니다')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    init()

    // Check for date change every minute
    const interval = setInterval(async () => {
      const currentSettings = settingsRef.current
      const currentDateKey = effectiveDateKeyRef.current

      if (currentSettings) {
        const newKey = getEffectiveDateKey(currentSettings.resetTime)
        if (newKey !== currentDateKey) {
          effectiveDateKeyRef.current = newKey
          setEffectiveDateKey(newKey)
          await getOrCreateTodayState(currentSettings.resetTime)
        }
      }
    }, 60000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, []) // Empty dependency array - only run on mount

  // Live query for today's state - only query when we have the effective date key
  const dayState = useLiveQuery(
    () => effectiveDateKey ? db.dayState.get(effectiveDateKey) : undefined,
    [effectiveDateKey],
    null // default value while loading
  )

  const refreshWeeklyStats = useCallback(async () => {
    const weekly = await getWeeklyStudyMinutes()
    setWeeklyStudyMinutes(weekly)
  }, [])

  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<void>>(
    fn: T,
    errorMessage: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        await fn(...args)
        setError(null)
      } catch (e) {
        console.error(errorMessage, e)
        setError(errorMessage)
      }
    }) as T
  }, [])

  const actions = {
    addStudyMinutes: withErrorHandling(
      async (minutes: number) => {
        if (!effectiveDateKey) return
        await addStudyMinutes(effectiveDateKey, minutes)
        await refreshWeeklyStats()
      },
      '공부 시간 저장에 실패했습니다'
    ),
    updateRunPlan: withErrorHandling(
      async (plan: RunPlan) => {
        if (!effectiveDateKey) return
        await updateRunPlan(effectiveDateKey, plan)
      },
      '러닝 계획 저장에 실패했습니다'
    ),
    toggleRunDone: withErrorHandling(
      async () => {
        if (!effectiveDateKey) return
        await toggleRunDone(effectiveDateKey)
      },
      '러닝 완료 상태 변경에 실패했습니다'
    ),
    updateNotes: withErrorHandling(
      async (notes: string[]) => {
        if (!effectiveDateKey) return
        await updateNotes(effectiveDateKey, notes)
      },
      '메모 저장에 실패했습니다'
    ),
    refreshWeeklyStats
  }

  // Still loading if dayState hasn't been fetched yet
  const actuallyLoading = isLoading || dayState === undefined

  return {
    dayState: dayState ?? null,
    settings,
    weeklyStudyMinutes,
    isLoading: actuallyLoading,
    error,
    clearError,
    actions
  }
}
