import { useState, useEffect } from 'react'
import { useGoogleCalendar, type CalendarEvent, type NewEventData } from '../hooks/useGoogleCalendar'
import { PageHeader } from '../components/PageHeader'
import { DAILY_ROUTINE } from '../data/dailyRoutine'
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
  subMonths,
  addDays,
  subDays
} from 'date-fns'
import { ko } from 'date-fns/locale'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

type ViewMode = 'day' | 'week' | 'month'

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
            ? 'bg-emerald-700 border-emerald-500 text-white'
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
            className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ImportRoutineModal({
  isOpen,
  onClose,
  date,
  onDateChange,
  onImport,
  isImporting,
  result,
  routineText,
  onTextChange,
  parsedCount,
  onLoadDefault
}: {
  isOpen: boolean
  onClose: () => void
  date: string
  onDateChange: (date: string) => void
  onImport: () => void
  isImporting: boolean
  result: { success: number; failed: number } | null
  routineText: string
  onTextChange: (text: string) => void
  parsedCount: number
  onLoadDefault: () => void
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isImporting && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">📋 일일 루틴 가져오기</h3>
          <button
            onClick={onLoadDefault}
            disabled={isImporting}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-gray-700"
            title="기본 루틴 불러오기"
          >
            기본 루틴
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">날짜 선택</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={isImporting}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Text Input */}
        <div className="flex-1 overflow-hidden mb-4 bg-gray-900 rounded-xl p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">
              양식: <code className="bg-gray-700 px-1 rounded">HH:MM-HH:MM 제목</code>
            </div>
            {parsedCount > 0 && (
              <div className="text-xs text-emerald-400">{parsedCount}개 인식됨</div>
            )}
          </div>
          <textarea
            value={routineText}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={isImporting}
            placeholder={`일정을 입력하거나 붙여넣기하세요.\n\n예시:\n06:30-06:40 기상 + 물 한 컵\n06:40-07:00 스트레칭\n07:00-07:30 아침식사\n\n* "기본 루틴" 버튼을 누르면 기본 일일 루틴이 입력됩니다.`}
            className="flex-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white text-sm placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono min-h-[200px]"
          />
        </div>

        {result && (
          <div className={`mb-4 p-3 rounded-xl ${
            result.failed === 0 ? 'bg-emerald-700/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {result.failed === 0
              ? `✅ ${result.success}개 일정이 추가되었습니다!`
              : `⚠️ ${result.success}개 성공, ${result.failed}개 실패`
            }
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            {result ? '닫기' : '취소'}
          </button>
          {!result && (
            <button
              onClick={onImport}
              disabled={isImporting || parsedCount === 0}
              className="flex-1 py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  추가 중...
                </>
              ) : (
                `${parsedCount}개 가져오기`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { events, isLoading, error, isSignedIn, signIn, signOut, refresh, addEvent, addBatchEvents, toggleEventComplete } = useGoogleCalendar()
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importDate, setImportDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [routineText, setRoutineText] = useState(`11:30-12:10 몸 깨우기 + 정리 (물 한 컵, 세면/양치, 스트레칭 5분, 방 환기, 할 일 메모)
12:10-12:40 첫 끼(브런치) - 밥/빵 + 단백질, 커피/차 한 번
12:40-13:20 유산소 (워밍업 5분 → 천국의 계단 20분 → 쿨다운 5분 + 스트레칭)
13:20-14:00 샤워 + 작업 세팅 (샤워/로션/옷, 책상 정리, 타이머 준비)
14:00-15:30 취업 준비 [핵심1] - 최근 1개 프로젝트 정리, STAR 3줄, 포트폴리오 링크 모으기
15:30-15:50 쉬는 시간 (10분 걷기/정리/설거지, 눈/목 스트레칭)
15:50-16:50 일본어 1시간 [핵심2] - 히라가나 10개 + 단어 5개 + 소리내어 읽기
16:50-18:10 개발/포트폴리오 [핵심3] - 프로젝트 1개, 기능 1개, README + 스크린샷, 커밋 1번
18:10-18:50 근력운동 30분 + 마무리 (스쿼트/푸쉬업/로우/플랭크 + 스트레칭 5분)
18:50-20:00 저녁 + 리셋 (저녁 식사, 식후 10분 걷기)
20:00-21:00 지원/정리 1시간 - 회사/공고 3개 저장, 이력서 수정 메모 3줄
21:00-23:00 자유시간 (가벼운 취미/휴식)
23:00-23:30 마감 루틴 - 내일 할 일 3개 적고 종료`)
  const [parsedRoutines, setParsedRoutines] = useState<{ startTime: string; endTime: string; title: string }[]>([
    { startTime: '11:30', endTime: '12:10', title: '몸 깨우기 + 정리 (물 한 컵, 세면/양치, 스트레칭 5분, 방 환기, 할 일 메모)' },
    { startTime: '12:10', endTime: '12:40', title: '첫 끼(브런치) - 밥/빵 + 단백질, 커피/차 한 번' },
    { startTime: '12:40', endTime: '13:20', title: '유산소 (워밍업 5분 → 천국의 계단 20분 → 쿨다운 5분 + 스트레칭)' },
    { startTime: '13:20', endTime: '14:00', title: '샤워 + 작업 세팅 (샤워/로션/옷, 책상 정리, 타이머 준비)' },
    { startTime: '14:00', endTime: '15:30', title: '취업 준비 [핵심1] - 최근 1개 프로젝트 정리, STAR 3줄, 포트폴리오 링크 모으기' },
    { startTime: '15:30', endTime: '15:50', title: '쉬는 시간 (10분 걷기/정리/설거지, 눈/목 스트레칭)' },
    { startTime: '15:50', endTime: '16:50', title: '일본어 1시간 [핵심2] - 히라가나 10개 + 단어 5개 + 소리내어 읽기' },
    { startTime: '16:50', endTime: '18:10', title: '개발/포트폴리오 [핵심3] - 프로젝트 1개, 기능 1개, README + 스크린샷, 커밋 1번' },
    { startTime: '18:10', endTime: '18:50', title: '근력운동 30분 + 마무리 (스쿼트/푸쉬업/로우/플랭크 + 스트레칭 5분)' },
    { startTime: '18:50', endTime: '20:00', title: '저녁 + 리셋 (저녁 식사, 식후 10분 걷기)' },
    { startTime: '20:00', endTime: '21:00', title: '지원/정리 1시간 - 회사/공고 3개 저장, 이력서 수정 메모 3줄' },
    { startTime: '21:00', endTime: '23:00', title: '자유시간 (가벼운 취미/휴식)' },
    { startTime: '23:00', endTime: '23:30', title: '마감 루틴 - 내일 할 일 3개 적고 종료' },
  ])
  const [, setTick] = useState(0)

  // Re-render every minute to update in-progress event sorting
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 60000) // every minute
    return () => clearInterval(interval)
  }, [])

  // 텍스트를 파싱하여 루틴 배열로 변환
  const parseRoutineText = (text: string): { startTime: string; endTime: string; title: string }[] => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const items: { startTime: string; endTime: string; title: string }[] = []

    for (const line of lines) {
      // 여러 양식 지원: "HH:MM-HH:MM 제목" 또는 "HH:MM~HH:MM 제목" 또는 "HH:MM - HH:MM 제목"
      const match = line.match(/^(\d{1,2}:\d{2})\s*[-~–]\s*(\d{1,2}:\d{2})\s+(.+)$/)
      if (match) {
        const [, startTime, endTime, title] = match
        // 시간 포맷 정규화 (H:MM -> HH:MM)
        const normalizeTime = (t: string) => {
          const [h, m] = t.split(':')
          return `${h.padStart(2, '0')}:${m}`
        }
        items.push({
          startTime: normalizeTime(startTime),
          endTime: normalizeTime(endTime),
          title: title.trim()
        })
      }
    }
    return items
  }

  const handleRoutineTextChange = (text: string) => {
    setRoutineText(text)
    const parsed = parseRoutineText(text)
    setParsedRoutines(parsed)
  }

  const handleLoadDefaultRoutine = () => {
    const defaultText = DAILY_ROUTINE.map(item => `${item.startTime}-${item.endTime} ${item.title}`).join('\n')
    setRoutineText(defaultText)
    setParsedRoutines(DAILY_ROUTINE)
  }

  const handleImportRoutine = async () => {
    if (parsedRoutines.length === 0) return
    setIsImporting(true)
    setImportResult(null)
    const result = await addBatchEvents(importDate, parsedRoutines)
    setImportResult(result)
    setIsImporting(false)
  }

  // Fetch events for the visible date range when view changes
  useEffect(() => {
    if (!isSignedIn) return

    let startDate: Date
    let endDate: Date

    if (viewMode === 'day') {
      startDate = currentDate
      endDate = currentDate
    } else if (viewMode === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
    } else {
      // month view - include days from adjacent months shown in calendar
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
      endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    }

    refresh(startDate, endDate)
  }, [currentDate, viewMode, isSignedIn])

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
    if (viewMode === 'day') {
      setCurrentDate(prev => subDays(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1))
    } else {
      setCurrentDate(prev => subMonths(prev, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => addDays(prev, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1))
    } else {
      setCurrentDate(prev => addMonths(prev, 1))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDay = (day: Date) => {
    const now = new Date()
    return events
      .filter(event => isSameDay(event.start, day))
      .sort((a, b) => {
        // Check if event is past (already ended)
        const aIsPast = !a.isAllDay && a.end < now
        const bIsPast = !b.isAllDay && b.end < now

        // Check if event is in progress (started but not ended)
        const aInProgress = !a.isAllDay && a.start <= now && a.end >= now
        const bInProgress = !b.isAllDay && b.start <= now && b.end >= now

        // In-progress events at the very top
        if (aInProgress && !bInProgress) return -1
        if (!aInProgress && bInProgress) return 1

        // All-day events come next
        if (a.isAllDay && !b.isAllDay) return -1
        if (!a.isAllDay && b.isAllDay) return 1

        // Past (ended) events go to bottom
        if (!aIsPast && bIsPast) return -1
        if (aIsPast && !bIsPast) return 1

        // Within same category, sort by start time
        return a.start.getTime() - b.start.getTime()
      })
  }

  const handleAddEvent = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setShowAddModal(true)
  }

  // Not configured
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div>
        <PageHeader icon="📅" title="캘린더" />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-400">Google Calendar 연동이 필요합니다.</p>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div>
        <PageHeader icon="📅" title="캘린더" />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="animate-pulse text-gray-400">로딩 중...</div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div>
        <PageHeader icon="📅" title="캘린더" />
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => refresh()} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="📅" title="캘린더" />
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
    <div>
      <PageHeader icon="📅" title="캘린더">
        <button
          onClick={() => setShowImportModal(true)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="루틴 가져오기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => refresh()}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="새로고침"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="로그아웃"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </PageHeader>

      {/* Navigation */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* View Mode Toggle */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'day'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                일간
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-blue-700 text-white'
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

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-white font-medium text-sm sm:text-base">
                {viewMode === 'day'
                  ? format(currentDate, 'M월 d일 (EEE)', { locale: ko })
                  : viewMode === 'week'
                    ? format(weekStart, 'yyyy년 M월', { locale: ko })
                    : format(currentDate, 'yyyy년 M월', { locale: ko })
                }
              </span>
              <button
                onClick={goToToday}
                className="px-2 sm:px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs sm:text-sm hover:bg-blue-500/30"
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
        {/* Day View - Timeline */}
        {viewMode === 'day' && (
          <div className="space-y-2">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${isToday(currentDate) ? 'text-blue-400' : 'text-white'}`}>
                  {format(currentDate, 'd')}
                </span>
                <div>
                  <div className={`text-lg font-medium ${isToday(currentDate) ? 'text-blue-400' : 'text-white'}`}>
                    {format(currentDate, 'EEEE', { locale: ko })}
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(currentDate, 'yyyy년 M월', { locale: ko })}
                    {isToday(currentDate) && <span className="ml-2 text-blue-400">오늘</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAddEvent(currentDate)}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                일정 추가
              </button>
            </div>

            {/* Timeline */}
            {(() => {
              const dayEvents = getEventsForDay(currentDate)

              if (dayEvents.length === 0) {
                return (
                  <div className="text-center py-16 text-gray-500 bg-gray-800 rounded-xl">
                    <div className="text-4xl mb-3">📭</div>
                    <div>이 날 일정이 없습니다</div>
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  {dayEvents.map((event, index) => {
                    const isCompleted = event.title.startsWith('✅ ')
                    const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title
                    const startTime = format(event.start, 'HH:mm')
                    const endTime = format(event.end, 'HH:mm')
                    const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))
                    const durationText = duration >= 60
                      ? `${Math.floor(duration / 60)}시간${duration % 60 > 0 ? ` ${duration % 60}분` : ''}`
                      : `${duration}분`

                    return (
                      <button
                        key={event.id}
                        onClick={() => toggleEventComplete(event.id, event.title)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          isCompleted
                            ? 'bg-gray-800/50 opacity-60'
                            : 'bg-gray-800 hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Time Column */}
                          <div className="flex-shrink-0 w-20 text-right">
                            <div className={`font-mono text-lg ${isCompleted ? 'text-gray-500' : 'text-blue-400'}`}>
                              {event.isAllDay ? '종일' : startTime}
                            </div>
                            {!event.isAllDay && (
                              <div className="text-xs text-gray-500">
                                ~ {endTime}
                              </div>
                            )}
                          </div>

                          {/* Timeline Indicator */}
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isCompleted
                                ? 'bg-emerald-700 border-emerald-500'
                                : 'border-blue-400 bg-gray-900'
                            }`}>
                              {isCompleted && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {index < dayEvents.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[20px] ${isCompleted ? 'bg-gray-700' : 'bg-gray-600'}`} />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                              {displayTitle}
                            </div>
                            {!event.isAllDay && (
                              <div className="text-sm text-gray-500 mt-1">
                                {durationText}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })()}

            {/* Summary */}
            {(() => {
              const dayEvents = getEventsForDay(currentDate)
              const completedCount = dayEvents.filter(e => e.title.startsWith('✅ ')).length
              const totalCount = dayEvents.length

              if (totalCount === 0) return null

              return (
                <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">진행률</span>
                    <span className="text-white font-medium">
                      {completedCount} / {totalCount} 완료
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Day Headers - hidden on mobile for week view, hidden for day view */}
        <div className={`grid grid-cols-7 gap-1 mb-2 ${viewMode === 'day' ? 'hidden' : viewMode === 'week' ? 'hidden md:grid' : ''}`}>
          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              i >= 5 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* Week View - List on mobile, grid on desktop */}
        {viewMode === 'week' && (
          <>
            {/* Mobile: List View */}
            <div className="md:hidden space-y-3">
              {weekDays.map((day, index) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentDay = isToday(day)
                const label = getDateLabel(day)
                const dayOfWeek = ['월', '화', '수', '목', '금', '토', '일'][index]

                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-xl p-3 transition-all ${
                      isCurrentDay
                        ? 'bg-blue-500/20 ring-2 ring-blue-500'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          isCurrentDay ? 'text-blue-400' : index >= 5 ? 'text-red-400' : 'text-white'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        <span className={`text-sm ${
                          index >= 5 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {dayOfWeek}요일
                        </span>
                        {label && (
                          <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                            {label}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddEvent(day)}
                        className="w-8 h-8 rounded-full hover:bg-gray-700 text-gray-500 hover:text-white flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {dayEvents.length === 0 ? (
                      <div className="text-sm text-gray-500 py-2">일정 없음</div>
                    ) : (
                      <div className="space-y-2">
                        {dayEvents.map(event => {
                          const isCompleted = event.title.startsWith('✅ ')
                          const displayTitle = isCompleted ? event.title.replace('✅ ', '') : event.title

                          return (
                            <button
                              key={event.id}
                              onClick={() => toggleEventComplete(event.id, event.title)}
                              className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                                isCompleted
                                  ? 'bg-gray-700/50'
                                  : 'bg-blue-500/20 hover:bg-blue-500/30'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-emerald-700 border-emerald-500'
                                  : 'border-gray-500'
                              }`}>
                                {isCompleted && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`font-mono text-sm flex-shrink-0 ${
                                isCompleted ? 'text-gray-500' : 'text-blue-400'
                              }`}>
                                {event.isAllDay ? '종일' : format(event.start, 'HH:mm')}
                              </span>
                              <span className={`flex-1 ${
                                isCompleted ? 'text-gray-500 line-through' : 'text-white'
                              }`}>
                                {displayTitle}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-7 gap-2">
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
          </>
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

        {/* Today's Events Detail - hidden in day view */}
        {viewMode !== 'day' && (
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
        )}
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

      <ImportRoutineModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false)
          setImportResult(null)
        }}
        date={importDate}
        onDateChange={setImportDate}
        onImport={handleImportRoutine}
        isImporting={isImporting}
        result={importResult}
        routineText={routineText}
        onTextChange={handleRoutineTextChange}
        parsedCount={parsedRoutines.length}
        onLoadDefault={handleLoadDefaultRoutine}
      />
    </div>
  )
}
