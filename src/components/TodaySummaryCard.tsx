import { useMemo, useEffect, useState } from 'react'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import type { CalendarEvent } from '../hooks/useGoogleCalendar'

export function TodaySummaryCard() {
  const { events } = useGoogleCalendar()
  const [, setTick] = useState(0)

  // 매 분마다 리렌더링하여 진행률 자동 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 60000) // 1분마다
    return () => clearInterval(interval)
  }, [])

  const todayStats = useMemo(() => {
    const now = new Date()
    const todayEvents = events.filter((e: CalendarEvent) => {
      return e.start.toDateString() === now.toDateString()
    })

    // 시간이 지난 일정은 자동으로 완료 처리 (종일 일정 제외)
    const completed = todayEvents.filter((e: CalendarEvent) => {
      // 수동으로 완료 표시한 경우
      if (e.title?.startsWith('✓') || e.title?.startsWith('✅')) return true
      // 종일 일정은 하루 끝날 때까지 미완료
      if (e.isAllDay) return false
      // 시간 일정은 종료 시간이 지나면 완료
      return e.end < now
    }).length

    // Find current or next event
    let currentEvent: CalendarEvent | null = null
    let nextEvent: CalendarEvent | null = null

    for (const event of todayEvents) {
      if (now >= event.start && now <= event.end) {
        currentEvent = event
      } else if (now < event.start && !nextEvent) {
        nextEvent = event
      }
    }

    return {
      total: todayEvents.length,
      completed,
      progress: todayEvents.length > 0 ? Math.round((completed / todayEvents.length) * 100) : 0,
      currentEvent,
      nextEvent,
    }
  }, [events])

  const getTimeUntil = (targetDate: Date) => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 0) return '진행 중'
    if (minutes < 60) return `${minutes}분 후`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}시간 ${mins}분 후` : `${hours}시간 후`
  }

  const getGreetingAndTip = () => {
    const hour = new Date().getHours()
    if (hour >= 0 && hour < 5) {
      return {
        greeting: '늦은 밤이에요 🌙',
        tip: '충분한 수면이 내일의 생산성을 높여요',
        tipColor: 'text-indigo-300'
      }
    }
    if (hour < 7) {
      return {
        greeting: '이른 아침이에요 🌅',
        tip: '일찍 일어난 새가 벌레를 잡는다!',
        tipColor: 'text-orange-300'
      }
    }
    if (hour < 12) {
      return {
        greeting: '좋은 아침이에요 ☀️',
        tip: '오늘 하루도 화이팅!',
        tipColor: 'text-yellow-300'
      }
    }
    if (hour < 14) {
      return {
        greeting: '점심시간이에요 🍽️',
        tip: '잠깐 쉬어가며 에너지 충전하세요',
        tipColor: 'text-green-300'
      }
    }
    if (hour < 18) {
      return {
        greeting: '좋은 오후에요 💪',
        tip: '집중력이 높은 시간, 중요한 일을 처리하세요',
        tipColor: 'text-blue-300'
      }
    }
    if (hour < 21) {
      return {
        greeting: '좋은 저녁이에요 🌆',
        tip: '오늘 하루 수고했어요',
        tipColor: 'text-purple-300'
      }
    }
    return {
      greeting: '오늘 하루도 수고했어요 🌃',
      tip: '내일을 위해 푹 쉬세요',
      tipColor: 'text-indigo-300'
    }
  }

  const { greeting, tip, tipColor } = getGreetingAndTip()

  // Progress display logic
  const getProgressDisplay = () => {
    if (todayStats.total === 0) {
      return { text: '오늘', subtext: '일정 없음' }
    }
    return {
      text: `${todayStats.progress}%`,
      subtext: `${todayStats.completed}/${todayStats.total} 완료`
    }
  }

  const progressDisplay = getProgressDisplay()

  return (
    <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg h-full">
        {/* Greeting & Progress */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{greeting}</h2>
            <p className={`text-xs sm:text-sm ${tipColor}`}>{tip}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white">{progressDisplay.text}</div>
            <div className="text-xs text-gray-400">{progressDisplay.subtext}</div>
          </div>
        </div>

        {/* Progress Bar - only show if there are events */}
        {todayStats.total > 0 && (
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${todayStats.progress}%` }}
            />
          </div>
        )}

        {/* Current/Next Event - Compact */}
        <div className={`grid gap-2 sm:grid-cols-2 ${todayStats.total === 0 ? 'mt-3' : ''}`}>
          {todayStats.currentEvent ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-400">진행 중</span>
              </div>
              <p className="text-white font-medium text-xs truncate">
                {todayStats.currentEvent.title?.replace(/^[✓✅]\s*/, '')}
              </p>
            </div>
          ) : (
            <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-gray-500 text-sm">☕</span>
                <span className="text-xs font-medium text-gray-400">자유 시간</span>
              </div>
              <p className="text-gray-400 text-xs">나만의 시간을 활용하세요</p>
            </div>
          )}

          {todayStats.nextEvent ? (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-blue-400 text-sm">→</span>
                <span className="text-xs font-medium text-blue-400">다음</span>
                <span className="text-xs text-blue-300 ml-auto">
                  {getTimeUntil(todayStats.nextEvent.start)}
                </span>
              </div>
              <p className="text-white font-medium text-xs truncate">
                {todayStats.nextEvent.title?.replace(/^[✓✅]\s*/, '')}
              </p>
            </div>
          ) : todayStats.total > 0 ? (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span>
                <span className="text-xs font-medium text-emerald-400">일정 완료! 🎉</span>
              </div>
            </div>
          ) : (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5">
                <span className="text-purple-400 text-sm">📅</span>
                <span className="text-xs font-medium text-purple-400">일정 없는 날</span>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
