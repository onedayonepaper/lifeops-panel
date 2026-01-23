import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleCalendar, type CalendarEvent, type NewEventData } from '../hooks/useGoogleCalendar'
import {
  format,
  isToday,
  isTomorrow,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns'
import { ko } from 'date-fns/locale'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

type ViewMode = 'week' | 'month'

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) return '종일'
  return format(event.start, 'HH:mm')
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return '오늘'
  if (isTomorrow(date)) return '내일'
  return ''
}

function EventItem({
  event,
  onToggleComplete
}: {
  event: CalendarEvent
  onToggleComplete: (eventId: string, title: string) => void
}) {
  const isCompleted = event.title.startsWith('✅ ')
  const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      isCompleted ? 'opacity-50 bg-gray-800/50' : 'bg-gray-800 hover:bg-gray-700'
    }`}>
      <button
        onClick={() => onToggleComplete(event.id, event.title)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-500 hover:border-blue-400'
        }`}
      >
        {isCompleted && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={`text-sm font-mono w-14 flex-shrink-0 ${
        isCompleted ? 'text-gray-500' : 'text-blue-400'
      }`}>
        {formatEventTime(event)}
      </span>

      <span className={`flex-1 ${
        isCompleted ? 'text-gray-500 line-through' : 'text-white'
      }`}>
        {displayTitle}
      </span>
    </div>
  )
}

function AddEventModal({
  isOpen,
  onClose,
  onAdd,
  initialDate
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: NewEventData) => Promise<boolean>
  initialDate?: string
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'))
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
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-5">새 일정</h3>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="w-5 h-5 rounded accent-blue-500"
            />
            <span className="text-gray-300">종일</span>
          </label>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">시작</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">종료</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

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
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { events, isLoading, error, isSignedIn, signIn, signOut, refresh, addEvent, toggleEventComplete } = useGoogleCalendar()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  })

  // Month view days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const goToPrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1))
    } else {
      setCurrentDate(prev => subMonths(prev, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1))
    } else {
      setCurrentDate(prev => addMonths(prev, 1))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day))
  }

  const handleAddEvent = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setShowAddModal(true)
  }

  // Not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <Header />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-400">Google Calendar 연동이 필요합니다.</p>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <Header />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="animate-pulse text-gray-400">로딩 중...</div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <Header />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={refresh} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <Header />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <button
            onClick={signIn}
            className="px-6 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium inline-flex items-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 연동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onSignOut={signOut} onRefresh={refresh} />

      {/* Navigation */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* View Mode Toggle */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                월간
              </button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-white font-medium">
                {viewMode === 'week'
                  ? format(weekStart, 'yyyy년 M월', { locale: ko })
                  : format(currentDate, 'yyyy년 M월', { locale: ko })
                }
              </span>
              <button
                onClick={goToToday}
                className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30"
              >
                오늘
              </button>
            </div>

            <button
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              i >= 5 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentDay = isToday(day)
              const label = getDateLabel(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] rounded-xl p-2 transition-all ${
                    isCurrentDay
                      ? 'bg-blue-500/20 ring-2 ring-blue-500'
                      : 'bg-gray-800 hover:bg-gray-750'
                  } ${index >= 5 ? 'bg-gray-800/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className={`text-lg font-bold ${
                        isCurrentDay ? 'text-blue-400' : index >= 5 ? 'text-red-400' : 'text-white'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {label && (
                        <span className="text-xs text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddEvent(day)}
                      className="w-6 h-6 rounded-full hover:bg-gray-700 text-gray-500 hover:text-white flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const isCompleted = event.title.startsWith('✅ ')
                      const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title

                      return (
                        <button
                          key={event.id}
                          onClick={() => toggleEventComplete(event.id, event.title)}
                          className={`w-full text-left text-xs p-1.5 rounded-lg truncate transition-all ${
                            isCompleted
                              ? 'bg-gray-700/50 text-gray-500 line-through'
                              : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          }`}
                        >
                          {!event.isAllDay && (
                            <span className="font-mono mr-1">{format(event.start, 'HH:mm')}</span>
                          )}
                          {displayTitle}
                        </button>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentDay = isToday(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const dayOfWeek = (index % 7)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleAddEvent(day)}
                  className={`min-h-[80px] rounded-lg p-1.5 transition-all cursor-pointer ${
                    isCurrentDay
                      ? 'bg-blue-500/20 ring-2 ring-blue-500'
                      : isCurrentMonth
                        ? 'bg-gray-800 hover:bg-gray-750'
                        : 'bg-gray-800/30'
                  } ${dayOfWeek >= 5 && isCurrentMonth ? 'bg-gray-800/70' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      !isCurrentMonth
                        ? 'text-gray-600'
                        : isCurrentDay
                          ? 'text-blue-400'
                          : dayOfWeek >= 5
                            ? 'text-red-400'
                            : 'text-white'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(event => {
                      const isCompleted = event.title.startsWith('✅ ')
                      const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title

                      return (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleEventComplete(event.id, event.title)
                          }}
                          className={`w-full text-left text-[10px] px-1 py-0.5 rounded truncate transition-all ${
                            isCompleted
                              ? 'bg-gray-700/50 text-gray-500 line-through'
                              : 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/40'
                          }`}
                        >
                          {displayTitle}
                        </button>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Today's Events Detail */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">오늘의 일정</span>
            <span className="text-sm font-normal text-gray-500">
              {format(new Date(), 'M월 d일 EEEE', { locale: ko })}
            </span>
          </h3>

          {events.filter(e => isToday(e.start)).length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-800 rounded-xl">
              오늘 일정이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .filter(e => isToday(e.start))
                .map(event => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onToggleComplete={toggleEventComplete}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedDate(null)
        }}
        onAdd={addEvent}
        initialDate={selectedDate || undefined}
      />
    </div>
  )
}

function Header({ onSignOut, onRefresh }: { onSignOut?: () => void; onRefresh?: () => void }) {
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>홈으로</span>
        </Link>

        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📅</span>
          캘린더
        </h1>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              title="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              title="로그아웃"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
