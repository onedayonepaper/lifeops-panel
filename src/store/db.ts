import Dexie, { type EntityTable } from 'dexie'

// Types
export type RunPlan = 'REST' | 'EASY' | 'LSD' | 'INTERVAL'

export interface DayState {
  date: string // YYYY-MM-DD (Primary Key)
  top3: [string, string, string]
  top3Done: [boolean, boolean, boolean]
  oneAction: string
  oneActionDone: boolean
  studyMinutesDone: number
  runPlan: RunPlan
  runDone: boolean
  notes: string[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  id: number // Always 1 (singleton)
  pinHash: string | null
  nightModeStart: string // HH:mm
  nightModeEnd: string // HH:mm
  resetTime: string // HH:mm
  kioskMode: boolean
}

export interface Habit {
  id?: number
  name: string
  emoji: string
  createdAt: number
}

export interface HabitLog {
  id?: number
  habitId: number
  date: string // YYYY-MM-DD
  completed: boolean
}

// Database class
class LifeOpsDB extends Dexie {
  dayState!: EntityTable<DayState, 'date'>
  settings!: EntityTable<Settings, 'id'>
  habits!: EntityTable<Habit, 'id'>
  habitLogs!: EntityTable<HabitLog, 'id'>

  constructor() {
    super('LifeOpsDB')

    this.version(1).stores({
      dayState: 'date, createdAt, updatedAt',
      settings: 'id'
    })

    this.version(2).stores({
      dayState: 'date, createdAt, updatedAt',
      settings: 'id',
      habits: '++id, createdAt',
      habitLogs: '++id, habitId, date, [habitId+date]'
    })
  }
}

export const db = new LifeOpsDB()

// Initialize default settings
export async function initializeSettings(): Promise<Settings> {
  const existing = await db.settings.get(1)
  if (existing) return existing

  const defaultSettings: Settings = {
    id: 1,
    pinHash: null,
    nightModeStart: '23:00',
    nightModeEnd: '06:00',
    resetTime: '06:00',
    kioskMode: false
  }

  await db.settings.add(defaultSettings)
  return defaultSettings
}

// Create empty day state
export function createEmptyDayState(date: string): DayState {
  return {
    date,
    top3: ['', '', ''],
    top3Done: [false, false, false],
    oneAction: '',
    oneActionDone: false,
    studyMinutesDone: 0,
    runPlan: 'REST',
    runDone: false,
    notes: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

// Export all data for backup
export async function exportAllData(): Promise<string> {
  const dayStates = await db.dayState.toArray()
  const settings = await db.settings.toArray()
  const habits = await db.habits.toArray()
  const habitLogs = await db.habitLogs.toArray()

  const exportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      dayStates,
      settings,
      habits,
      habitLogs
    }
  }

  return JSON.stringify(exportData, null, 2)
}

// Import data from backup
export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const importData = JSON.parse(jsonString)

    if (!importData.version || !importData.data) {
      return { success: false, message: '잘못된 백업 파일 형식입니다' }
    }

    const { dayStates, settings, habits, habitLogs } = importData.data

    await db.transaction('rw', [db.dayState, db.settings, db.habits, db.habitLogs], async () => {
      if (dayStates?.length) {
        await db.dayState.bulkPut(dayStates)
      }
      if (settings?.length) {
        await db.settings.bulkPut(settings)
      }
      if (habits?.length) {
        await db.habits.bulkPut(habits)
      }
      if (habitLogs?.length) {
        await db.habitLogs.bulkPut(habitLogs)
      }
    })

    return { success: true, message: '데이터를 성공적으로 복원했습니다' }
  } catch (e) {
    console.error('Import error:', e)
    return { success: false, message: '데이터 복원에 실패했습니다' }
  }
}

// Download backup file
export function downloadBackup(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
