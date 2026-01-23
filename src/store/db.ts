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

// Database class
class LifeOpsDB extends Dexie {
  dayState!: EntityTable<DayState, 'date'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('LifeOpsDB')

    this.version(1).stores({
      dayState: 'date, createdAt, updatedAt',
      settings: 'id'
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
