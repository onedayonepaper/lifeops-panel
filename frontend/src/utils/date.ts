import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDateKorean(date: Date = new Date()): string {
  return format(date, 'M월 d일 EEEE', { locale: ko })
}

export function formatTime(date: Date = new Date()): string {
  return format(date, 'HH:mm')
}

export function formatTimeWithSeconds(date: Date = new Date()): string {
  return format(date, 'HH:mm:ss')
}

export function getDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}
