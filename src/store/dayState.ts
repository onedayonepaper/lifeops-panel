import { format, subDays, isAfter } from 'date-fns'
import { db, createEmptyDayState, type DayState, type RunPlan } from './db'

// Get today's date string
export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// Get yesterday's date string
export function getYesterdayKey(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd')
}

// Check if we need to reset based on reset time
export async function shouldResetToday(resetTime: string): Promise<boolean> {
  const now = new Date()
  const todayKey = getTodayKey()

  // Parse reset time
  const [hours, minutes] = resetTime.split(':').map(Number)
  const resetDateTime = new Date()
  resetDateTime.setHours(hours, minutes, 0, 0)

  // If current time is before reset time, use yesterday's date
  const effectiveDate = isAfter(now, resetDateTime) ? todayKey : getYesterdayKey()

  const existing = await db.dayState.get(effectiveDate)
  return !existing
}

// Get or create today's state
export async function getOrCreateTodayState(resetTime: string = '06:00'): Promise<DayState> {
  const now = new Date()
  const todayKey = getTodayKey()

  // Parse reset time
  const [hours, minutes] = resetTime.split(':').map(Number)
  const resetDateTime = new Date()
  resetDateTime.setHours(hours, minutes, 0, 0)

  // Determine effective date based on reset time
  const effectiveDate = isAfter(now, resetDateTime) ? todayKey : getYesterdayKey()

  let state = await db.dayState.get(effectiveDate)

  if (!state) {
    state = createEmptyDayState(effectiveDate)
    await db.dayState.add(state)
  }

  return state
}

// Update day state
export async function updateDayState(date: string, updates: Partial<DayState>): Promise<void> {
  await db.dayState.update(date, {
    ...updates,
    updatedAt: Date.now()
  })
}

// Study operations
export async function addStudyMinutes(date: string, minutes: number): Promise<void> {
  const state = await db.dayState.get(date)
  if (!state) return

  await updateDayState(date, {
    studyMinutesDone: state.studyMinutesDone + minutes
  })
}

// Run operations
export async function updateRunPlan(date: string, plan: RunPlan): Promise<void> {
  await updateDayState(date, { runPlan: plan })
}

export async function toggleRunDone(date: string): Promise<void> {
  const state = await db.dayState.get(date)
  if (!state) return

  await updateDayState(date, { runDone: !state.runDone })
}

// Notes operations
export async function updateNotes(date: string, notes: string[]): Promise<void> {
  await updateDayState(date, { notes })
}

// Get weekly study stats
export async function getWeeklyStudyMinutes(): Promise<number> {
  const now = new Date()
  const weekAgo = subDays(now, 7)
  const weekAgoKey = format(weekAgo, 'yyyy-MM-dd')

  const states = await db.dayState
    .where('date')
    .above(weekAgoKey)
    .toArray()

  return states.reduce((sum, state) => sum + state.studyMinutesDone, 0)
}

// Get state by date
export async function getDayState(date: string): Promise<DayState | undefined> {
  return db.dayState.get(date)
}
