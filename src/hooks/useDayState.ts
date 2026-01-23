import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DayState, type Settings } from '../store/db'
import {
  getOrCreateTodayState,
  updateTop3,
  toggleTop3Done,
  updateOneAction,
  toggleOneActionDone,
  addStudyMinutes,
  updateRunPlan,
  toggleRunDone,
  updateNotes,
  copyFromYesterday,
  getWeeklyStudyMinutes,
  getTodayKey
} from '../store/dayState'
import { getSettings } from '../store/settings'
import type { RunPlan } from '../store/db'

interface UseDayStateReturn {
  dayState: DayState | null
  settings: Settings | null
  weeklyStudyMinutes: number
  isLoading: boolean
  actions: {
    updateTop3: (index: number, value: string) => Promise<void>
    toggleTop3Done: (index: number) => Promise<void>
    updateOneAction: (value: string) => Promise<void>
    toggleOneActionDone: () => Promise<void>
    addStudyMinutes: (minutes: number) => Promise<void>
    updateRunPlan: (plan: RunPlan) => Promise<void>
    toggleRunDone: () => Promise<void>
    updateNotes: (notes: string[]) => Promise<void>
    copyFromYesterday: () => Promise<void>
    refreshWeeklyStats: () => Promise<void>
  }
}

export function useDayState(): UseDayStateReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyStudyMinutes, setWeeklyStudyMinutes] = useState(0)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [todayKey, setTodayKey] = useState(getTodayKey())

  // Initialize and watch for date changes
  useEffect(() => {
    async function init() {
      const s = await getSettings()
      setSettings(s)
      await getOrCreateTodayState(s.resetTime)
      const weekly = await getWeeklyStudyMinutes()
      setWeeklyStudyMinutes(weekly)
      setIsLoading(false)
    }
    init()

    // Check for date change every minute
    const interval = setInterval(() => {
      const newKey = getTodayKey()
      if (newKey !== todayKey) {
        setTodayKey(newKey)
        init()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [todayKey])

  // Live query for today's state
  const dayState = useLiveQuery(
    () => db.dayState.get(todayKey),
    [todayKey]
  )

  const refreshWeeklyStats = useCallback(async () => {
    const weekly = await getWeeklyStudyMinutes()
    setWeeklyStudyMinutes(weekly)
  }, [])

  const actions = {
    updateTop3: async (index: number, value: string) => {
      await updateTop3(todayKey, index, value)
    },
    toggleTop3Done: async (index: number) => {
      await toggleTop3Done(todayKey, index)
    },
    updateOneAction: async (value: string) => {
      await updateOneAction(todayKey, value)
    },
    toggleOneActionDone: async () => {
      await toggleOneActionDone(todayKey)
    },
    addStudyMinutes: async (minutes: number) => {
      await addStudyMinutes(todayKey, minutes)
      await refreshWeeklyStats()
    },
    updateRunPlan: async (plan: RunPlan) => {
      await updateRunPlan(todayKey, plan)
    },
    toggleRunDone: async () => {
      await toggleRunDone(todayKey)
    },
    updateNotes: async (notes: string[]) => {
      await updateNotes(todayKey, notes)
    },
    copyFromYesterday: async () => {
      await copyFromYesterday(todayKey)
    },
    refreshWeeklyStats
  }

  return {
    dayState: dayState ?? null,
    settings,
    weeklyStudyMinutes,
    isLoading,
    actions
  }
}
