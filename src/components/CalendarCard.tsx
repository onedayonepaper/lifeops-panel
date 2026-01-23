import { useState } from 'react'
import { useGoogleCalendar, type CalendarEvent, type NewEventData } from '../hooks/useGoogleCalendar'
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
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      isUpcoming
        ? 'bg-emerald-500/20 border border-emerald-500/30'
        : 'bg-white/5 hover:bg-white/10'
    }`}>
      {/* Time */}
      <div className={`text-base font-mono w-14 flex-shrink-0 text-center ${
        event.isAllDay
          ? 'text-purple-300'
          : isUpcoming
            ? 'text-emerald-300 font-semibold'
            : 'text-gray-400'
      }`}>
        {formatEventTime(event)}
      </div>

      {/* Divider */}
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
        isUpcoming ? 'bg-emerald-400' : 'bg-gray-600'
      }`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-base truncate ${
          isUpcoming ? 'text-white' : 'text-gray-200'
        }`}>
          {event.title}
        </div>
        {event.location && (
          <div className="text-sm text-gray-400 truncate flex items-center gap-1 mt-0.5">
            <span>📍</span> {event.location}
          </div>
        )}
      </div>

      {/* Time until */}
      {timeUntil && (
        <div className="text-sm text-emerald-400 font-semibold flex-shrink-0 bg-emerald-500/20 px-2 py-1 rounded-lg">
          {timeUntil}
        </div>
      )}
    </div>
  )
}

function AddEventModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: NewEventData) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim()) return

    setIsSubmitting(true)
    const success = await onAdd({
      title: title.trim(),
      date,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      isAllDay
    })
    setIsSubmitting(false)

    if (success) {
      setTitle('')
      setIsAllDay(false)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>➕</span> 새 일정 추가
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-violet-500 text-base"
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* All Day Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="w-5 h-5 rounded accent-violet-500"
            />
            <span className="text-white">종일</span>
          </label>

          {/* Time (if not all day) */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">시작</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">종료</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
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
  const { events, isLoading, error, isSignedIn, signIn, signOut, refresh, addEvent } = useGoogleCalendar()
  const [showAddModal, setShowAddModal] = useState(false)

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
        <div className="flex items-center justify-center h-24">
          <div className="animate-pulse text-white/80">일정 불러오는 중...</div>
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
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium"
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Google Calendar와 연동하세요
          </p>
          <button
            onClick={signIn}
            className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 mx-auto text-base"
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
    <>
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-4 shadow-lg text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">📅</span>
            캘린더
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="일정 추가"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={refresh}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={signOut}
              className="text-xs px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Today summary */}
        {todayEvents.length > 0 && (
          <div className="bg-white/10 rounded-xl px-3 py-2 mb-4 text-sm">
            오늘 <span className="font-bold text-emerald-300">{todayEvents.length}개</span> 일정
          </div>
        )}

        {/* Events list */}
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-white/70">이번 주 일정이 없습니다</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium"
            >
              + 일정 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {Array.from(groupedEvents.entries()).map(([dateKey, dayEvents]) => (
              <div key={dateKey}>
                <div className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
                  <span>{formatEventDate(dayEvents[0].start)}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {dayEvents.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEvent}
      />
    </>
  )
}
