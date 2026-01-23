import { useState, useEffect } from 'react'
import { formatDateKorean, formatTimeWithSeconds } from '../utils/date'
import type { DayState } from '../store/db'

interface TopBarProps {
  dayState: DayState | null
  isNightMode: boolean
  onSettingsClick: () => void
  onRefreshClick: () => void
}

export function TopBar({ dayState, isNightMode, onSettingsClick, onRefreshClick }: TopBarProps) {
  const [time, setTime] = useState(formatTimeWithSeconds())
  const [date, setDate] = useState(formatDateKorean())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTimeWithSeconds())
      setDate(formatDateKorean())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate today's status
  const getStatusIcon = () => {
    if (!dayState) return '💤'

    const hasPlans = dayState.top3.some(t => t.trim() !== '') || dayState.oneAction.trim() !== ''
    const allDone = dayState.top3Done.every((done, i) => !dayState.top3[i] || done) &&
      (!dayState.oneAction || dayState.oneActionDone) &&
      (dayState.runPlan === 'REST' || dayState.runDone)

    if (allDone && hasPlans) return '✅'
    if (hasPlans) return '🔥'
    return '💤'
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 ${
      isNightMode ? 'bg-gray-900' : 'bg-gray-800'
    } text-white`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getStatusIcon()}</span>
        <div>
          <div className="text-lg font-semibold">{date}</div>
        </div>
      </div>

      <div className="text-3xl font-mono font-light tracking-wider">
        {time}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onRefreshClick}
          className="p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 touch-target"
          aria-label="새로고침"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 touch-target"
          aria-label="설정"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
