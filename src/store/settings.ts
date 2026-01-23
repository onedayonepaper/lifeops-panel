import { db, initializeSettings, type Settings } from './db'

// Get settings (singleton)
export async function getSettings(): Promise<Settings> {
  return initializeSettings()
}

// Update settings
export async function updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.settings.update(1, updates)
}

// Night mode check
export function isNightMode(nightModeStart: string, nightModeEnd: string): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const [startHours, startMins] = nightModeStart.split(':').map(Number)
  const [endHours, endMins] = nightModeEnd.split(':').map(Number)

  const startMinutes = startHours * 60 + startMins
  const endMinutes = endHours * 60 + endMins

  // Handle overnight periods (e.g., 23:00 - 06:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

// PIN verification (simple hash for demo)
export function hashPin(pin: string): string {
  // Simple hash for demo purposes - use proper crypto in production
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const settings = await getSettings()
  if (!settings.pinHash) return true
  return hashPin(pin) === settings.pinHash
}

export async function setPin(pin: string | null): Promise<void> {
  const pinHash = pin ? hashPin(pin) : null
  await updateSettings({ pinHash })
}
