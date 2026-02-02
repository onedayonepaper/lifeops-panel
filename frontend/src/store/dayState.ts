import { format, subDays, isAfter } from 'date-fns'
import { db, createEmptyDayState, type DayState } from './db'

// Get today's date string
export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// Get yesterday's date string
export function getYesterdayKey(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd')
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

// Notes operations
export async function updateNotes(date: string, notes: string[]): Promise<void> {
  await updateDayState(date, { notes })
}

// Get state by date
export async function getDayState(date: string): Promise<DayState | undefined> {
  return db.dayState.get(date)
}
