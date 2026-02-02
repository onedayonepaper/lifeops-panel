// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Check if notifications are enabled
export function isNotificationEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Show a notification
export function showNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    tag?: string
    requireInteraction?: boolean
  }
): void {
  if (!isNotificationEnabled()) return

  const notification = new Notification(title, {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    ...options
  })

  // Auto close after 5 seconds unless requireInteraction is true
  if (!options?.requireInteraction) {
    setTimeout(() => notification.close(), 5000)
  }
}

// Pomodoro notifications
export function notifyPomodoroComplete(mode: 'work' | 'shortBreak' | 'longBreak'): void {
  const messages = {
    work: { title: '집중 시간 완료!', body: '휴식을 취하세요' },
    shortBreak: { title: '짧은 휴식 끝!', body: '다시 집중할 시간입니다' },
    longBreak: { title: '긴 휴식 끝!', body: '다시 집중할 시간입니다' }
  }

  const { title, body } = messages[mode]
  showNotification(title, { body, tag: 'pomodoro' })
}

// Event reminder notification
export function notifyEventReminder(eventTitle: string, minutesUntil: number): void {
  const body = minutesUntil === 0
    ? '지금 시작합니다'
    : `${minutesUntil}분 후 시작`

  showNotification(eventTitle, { body, tag: `event-${eventTitle}` })
}
