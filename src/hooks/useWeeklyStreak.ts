import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { db, type DayState } from '../store/db'

export interface DayStreak {
  date: string
  dayOfWeek: string
  hasStudy: boolean
  studyMinutes: number
  hasRun: boolean
  runPlan: string
  top3Completed: number
  top3Total: number
  isToday: boolean
}

export interface WeeklyStreakData {
  days: DayStreak[]
  studyStreak: number
  runStreak: number
  totalStudyMinutes: number
  totalRunDays: number
}

function getDayOfWeek(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()]
}

export function useWeeklyStreak(): { data: WeeklyStreakData | null; isLoading: boolean } {
  const [data, setData] = useState<WeeklyStreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWeeklyData() {
      const today = new Date()
      const todayKey = format(today, 'yyyy-MM-dd')

      // Get last 7 days
      const days: DayStreak[] = []
      const dateKeys: string[] = []

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const dateKey = format(date, 'yyyy-MM-dd')
        dateKeys.push(dateKey)
      }

      // Fetch all day states for the week
      const states = await db.dayState
        .where('date')
        .anyOf(dateKeys)
        .toArray()

      const stateMap = new Map<string, DayState>()
      states.forEach(s => stateMap.set(s.date, s))

      // Build day streak data
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const dateKey = format(date, 'yyyy-MM-dd')
        const state = stateMap.get(dateKey)

        const top3Total = state?.top3.filter(t => t.trim() !== '').length || 0
        const top3Completed = state?.top3Done.filter((done, idx) => done && state.top3[idx]?.trim()).length || 0

        days.push({
          date: dateKey,
          dayOfWeek: getDayOfWeek(date),
          hasStudy: (state?.studyMinutesDone || 0) > 0,
          studyMinutes: state?.studyMinutesDone || 0,
          hasRun: state?.runDone || false,
          runPlan: state?.runPlan || 'REST',
          top3Completed,
          top3Total,
          isToday: dateKey === todayKey
        })
      }

      // Calculate streaks (consecutive days from today going back)
      let studyStreak = 0
      let runStreak = 0

      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i]
        if (day.hasStudy) {
          studyStreak++
        } else if (!day.isToday) {
          break
        }
      }

      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i]
        if (day.hasRun || day.runPlan === 'REST') {
          if (day.hasRun) runStreak++
        } else if (!day.isToday) {
          break
        }
      }

      // Calculate totals
      const totalStudyMinutes = days.reduce((sum, d) => sum + d.studyMinutes, 0)
      const totalRunDays = days.filter(d => d.hasRun).length

      setData({
        days,
        studyStreak,
        runStreak,
        totalStudyMinutes,
        totalRunDays
      })
      setIsLoading(false)
    }

    fetchWeeklyData()

    // Refresh every minute
    const interval = setInterval(fetchWeeklyData, 60000)
    return () => clearInterval(interval)
  }, [])

  return { data, isLoading }
}
