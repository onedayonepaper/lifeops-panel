import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleCalendar, type CalendarEvent, type NewEventData, type UpdateEventData } from '../hooks/useGoogleCalendar'
import { format, isToday, differenceInMinutes, addDays, subDays, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) return '종일'
  return format(event.start, 'HH:mm')
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

function EventItem({
  event,
  onToggleComplete,
  onEdit,
  onDelete,
  isSelectedToday
}: {
  event: CalendarEvent
  onToggleComplete: (eventId: string, title: string) => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  isSelectedToday: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const timeUntil = isSelectedToday ? getTimeUntilEvent(event) : null
  const isUpcoming = timeUntil !== null
  const isCompleted = event.title.startsWith('✅ ')
  const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-all relative group overflow-hidden ${
        isCompleted ? 'opacity-50' : isUpcoming ? 'bg-blue-500/10' : 'hover:bg-gray-700/50'
      }`}
    >
      <button
        onClick={() => onToggleComplete(event.id, event.title)}
        className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-emerald-700 border-emerald-500 text-white'
            : 'border-gray-500 hover:border-blue-400'
        }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={`text-xs sm:text-sm font-mono flex-shrink-0 ${
        isCompleted ? 'text-gray-500' : isUpcoming ? 'text-blue-400' : 'text-gray-400'
      }`}>
        {formatEventTime(event)}
      </span>

      <span className={`flex-1 truncate text-sm sm:text-base ${
        isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'
      }`}>
        {displayTitle}
      </span>

      {timeUntil && !isCompleted && (
        <span className="hidden sm:inline text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
          {timeUntil}
        </span>
      )}

      {/* Menu button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600 text-gray-400 hover:text-white transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[100px]">
              <button
                onClick={() => {
                  onEdit(event)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
              <button
                onClick={() => {
                  onDelete(event.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function QuickAddInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="빠른 일정 추가..."
        className="flex-1 min-w-0 px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-blue-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 flex-shrink-0"
      >
        추가
      </button>
    </form>
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
        <h3 className="text-lg font-bold text-white mb-4">새 일정</h3>

        <div className="space-y-3">
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
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditEventModal({
  event,
  onClose,
  onUpdate,
  onDelete
}: {
  event: CalendarEvent | null
  onClose: () => void
  onUpdate: (eventId: string, data: UpdateEventData) => Promise<boolean>
  onDelete: (eventId: string) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (event) {
      const displayTitle = event.title.startsWith('✅ ')
        ? event.title.replace('✅ ', '')
        : event.title
      setTitle(displayTitle)
      setDate(format(event.start, 'yyyy-MM-dd'))
      setIsAllDay(event.isAllDay)
      if (!event.isAllDay) {
        setStartTime(format(event.start, 'HH:mm'))
        setEndTime(format(event.end, 'HH:mm'))
      }
    }
  }, [event])

  if (!event) return null

  const handleUpdate = async () => {
    setIsSubmitting(true)
    const success = await onUpdate(event.id, {
      title: title.trim(),
      date,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      isAllDay
    })
    setIsSubmitting(false)
    if (success) onClose()
  }

  const handleDelete = async () => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return
    setIsSubmitting(true)
    const success = await onDelete(event.id)
    setIsSubmitting(false)
    if (success) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">일정 수정</h3>

        <div className="space-y-3">
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
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-red-900 hover:text-red-300 disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={!title.trim() || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CalendarCard() {
  const { events, isLoading, error, isSignedIn, signIn, signOut, refresh, addEvent, toggleEventComplete, deleteEvent, updateEvent } = useGoogleCalendar()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleQuickAdd = async (title: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    await addEvent({ title, date: dateStr, isAllDay: true })
  }

  const goToPrevDay = () => setSelectedDate(prev => subDays(prev, 1))
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1))
  const goToToday = () => setSelectedDate(new Date())

  // Filter and sort events for selected date
  // Sort: upcoming events first (sorted by time), then past events at the bottom
  const selectedDateEvents = events
    .filter(e => isSameDay(e.start, selectedDate))
    .sort((a, b) => {
      const now = new Date()
      const aIsPast = !a.isAllDay && a.start < now
      const bIsPast = !b.isAllDay && b.start < now

      // All-day events stay at top
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1

      // Past events go to bottom
      if (!aIsPast && bIsPast) return -1
      if (aIsPast && !bIsPast) return 1

      // Within same category, sort by start time
      return a.start.getTime() - b.start.getTime()
    })

  // Format selected date for display
  const formatSelectedDate = () => {
    return format(selectedDate, 'M월 d일 (EEE)', { locale: ko })
  }

  // Not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          📅 캘린더
        </h2>
        <p className="text-gray-400 text-sm">Google Calendar 연동 필요</p>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          📅 캘린더
        </h2>
        <div className="animate-pulse text-gray-400 text-center py-8">로딩 중...</div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          📅 캘린더
        </h2>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={refresh} className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          📅 캘린더
        </h2>
        <div className="text-center py-6">
          <button
            onClick={signIn}
            className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 연동
          </button>
        </div>
      </div>
    )
  }

  // Signed in
  return (
    <>
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/calendar"
            className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 hover:text-blue-400 transition-colors"
          >
            <span>📅</span>
            <span className="hidden sm:inline">캘린더</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
              title="상세 추가"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={refresh}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
              title="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={signOut}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
              title="로그아웃"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-3 bg-gray-700/50 rounded-xl p-2 gap-1">
          <button
            onClick={goToPrevDay}
            className="p-1.5 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors min-w-0 truncate ${
              isToday(selectedDate)
                ? 'bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {formatSelectedDate()}
            {selectedDateEvents.length > 0 && (
              <span className="ml-1 sm:ml-1.5 text-xs opacity-80">
                ({selectedDateEvents.length})
              </span>
            )}
          </button>
          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quick Add */}
        <div className="mb-4">
          <QuickAddInput onAdd={handleQuickAdd} />
        </div>

        {/* Events for selected date */}
        {selectedDateEvents.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>{formatSelectedDate()} 일정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {selectedDateEvents.map(event => (
              <EventItem
                key={event.id}
                event={event}
                onToggleComplete={toggleEventComplete}
                onEdit={setEditingEvent}
                onDelete={deleteEvent}
                isSelectedToday={isToday(selectedDate)}
              />
            ))}
          </div>
        )}
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEvent}
      />

      <EditEventModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
    </>
  )
}
