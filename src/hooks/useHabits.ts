import { useState, useEffect, useCallback } from 'react'
import { db, type Habit } from '../store/db'
import { format } from 'date-fns'

export interface HabitWithStatus extends Habit {
  completedToday: boolean
}

interface HabitsState {
  habits: HabitWithStatus[]
  isLoading: boolean
}

const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  { name: '물 8잔', emoji: '💧' },
  { name: '명상', emoji: '🧘' },
  { name: '독서', emoji: '📚' },
]

export function useHabits() {
  const [state, setState] = useState<HabitsState>({
    habits: [],
    isLoading: true
  })

  const today = format(new Date(), 'yyyy-MM-dd')

  const loadHabits = useCallback(async () => {
    try {
      let habits = await db.habits.orderBy('createdAt').toArray()

      // Initialize default habits if none exist
      if (habits.length === 0) {
        for (const habit of DEFAULT_HABITS) {
          await db.habits.add({
            ...habit,
            createdAt: Date.now()
          })
        }
        habits = await db.habits.orderBy('createdAt').toArray()
      }

      // Get today's logs
      const todayLogs = await db.habitLogs.where('date').equals(today).toArray()
      const completedIds = new Set(todayLogs.filter(l => l.completed).map(l => l.habitId))

      const habitsWithStatus: HabitWithStatus[] = habits.map(habit => ({
        ...habit,
        completedToday: completedIds.has(habit.id!)
      }))

      setState({ habits: habitsWithStatus, isLoading: false })
    } catch (error) {
      console.error('Failed to load habits:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [today])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  const toggleHabit = useCallback(async (habitId: number) => {
    try {
      const existingLog = await db.habitLogs
        .where('[habitId+date]')
        .equals([habitId, today])
        .first()

      if (existingLog) {
        await db.habitLogs.update(existingLog.id!, {
          completed: !existingLog.completed
        })
      } else {
        await db.habitLogs.add({
          habitId,
          date: today,
          completed: true
        })
      }

      await loadHabits()
    } catch (error) {
      console.error('Failed to toggle habit:', error)
    }
  }, [today, loadHabits])

  const addHabit = useCallback(async (name: string, emoji: string) => {
    try {
      await db.habits.add({
        name,
        emoji,
        createdAt: Date.now()
      })
      await loadHabits()
    } catch (error) {
      console.error('Failed to add habit:', error)
    }
  }, [loadHabits])

  const removeHabit = useCallback(async (habitId: number) => {
    try {
      await db.habits.delete(habitId)
      await db.habitLogs.where('habitId').equals(habitId).delete()
      await loadHabits()
    } catch (error) {
      console.error('Failed to remove habit:', error)
    }
  }, [loadHabits])

  return {
    ...state,
    toggleHabit,
    addHabit,
    removeHabit,
    refresh: loadHabits
  }
}
