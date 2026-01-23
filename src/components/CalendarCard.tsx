import { useGoogleCalendar, type CalendarEvent } from '../hooks/useGoogleCalendar'
import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns'
import { ko } from 'date-fns/locale'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) {
    return '종일'
  }
  return format(event.start, 'HH:mm')
}

function formatEventDate(date: Date): string {
  if (isToday(date)) return '오늘'
  if (isTomorrow(date)) return '내일'
  return format(date, 'M/d (EEE)', { locale: ko })
}

function getTimeUntilEvent(event: CalendarEvent): string | null {
  if (event.isAllDay) return null

  const now = new Date()
  const diff = differenceInMinutes(event.start, now)

  if (diff < 0) return null
  if (diff < 60) return `${diff}분 후`
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 후`
  return null
}

function EventItem({ event }: { event: CalendarEvent }) {
  const timeUntil = getTimeUntilEvent(event)
  const isUpcoming = timeUntil !== null

  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg ${
      isUpcoming ? 'bg-emerald-500/20' : 'bg-white/5'
    }`}>
      <div className={`text-sm font-mono w-12 flex-shrink-0 ${
        isUpcoming ? 'text-emerald-400' : 'text-gray-400'
      }`}>
        {formatEventTime(event)}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${
          isUpcoming ? 'text-white' : 'text-gray-200'
        }`}>
          {event.title}
        </div>
        {event.location && (
          <div className="text-xs text-gray-400 truncate">
            📍 {event.location}
          </div>
        )}
      </div>
      {timeUntil && (
        <div className="text-xs text-emerald-400 font-medium flex-shrink-0">
          {timeUntil}
        </div>
      )}
    </div>
  )
}

function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>()

  events.forEach(event => {
    const dateKey = format(event.start, 'yyyy-MM-dd')
    const existing = groups.get(dateKey) || []
    groups.set(dateKey, [...existing, event])
  })

  return groups
}

export function CalendarCard() {
  const { events, isLoading, error, isSignedIn, signIn, signOut, refresh } = useGoogleCalendar()

  // Not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">📅</span>
          캘린더
        </h2>
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-sm mb-2">Google Calendar 연동이 필요합니다</p>
          <p className="text-xs opacity-70">
            .env 파일에 VITE_GOOGLE_CLIENT_ID를 설정하세요
          </p>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-4 shadow-lg text-white">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-xl">📅</span>
          캘린더
        </h2>
        <div className="flex items-center justify-center h-20">
          <div className="animate-pulse">일정 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-4 shadow-lg text-white">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-xl">📅</span>
          캘린더
        </h2>
        <div className="text-center py-2">
          <p className="text-sm mb-2">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">📅</span>
          캘린더
        </h2>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Google Calendar와 연동하여 일정을 확인하세요
          </p>
          <button
            onClick={signIn}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        </div>
      </div>
    )
  }

  // Signed in with events
  const groupedEvents = groupEventsByDate(events)
  const todayEvents = events.filter(e => isToday(e.start))

  return (
    <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-4 shadow-lg text-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-xl">📅</span>
          캘린더
          {todayEvents.length > 0 && (
            <span className="text-sm font-normal opacity-80">
              오늘 {todayEvents.length}개
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg hover:bg-white/20"
            aria-label="새로고침"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={signOut}
            className="text-xs px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30"
          >
            로그아웃
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-4 opacity-80">
          <p className="text-sm">이번 주 일정이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Array.from(groupedEvents.entries()).map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <div className="text-xs font-medium text-white/70 mb-1">
                {formatEventDate(dayEvents[0].start)}
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
