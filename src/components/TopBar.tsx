import { useState, useEffect } from 'react'
import { formatDateKorean, formatTimeWithSeconds } from '../utils/date'
import type { DayState } from '../store/db'

interface TopBarProps {
  dayState: DayState | null
  isNightMode: boolean
  onSettingsClick: () => void
  onRefreshClick: () => void
  isSignedIn?: boolean
  onSignOut?: () => void
}

export function TopBar({ dayState, isNightMode, onSettingsClick, onRefreshClick, isSignedIn, onSignOut }: TopBarProps) {
  const [time, setTime] = useState(formatTimeWithSeconds())
  const [date, setDate] = useState(formatDateKorean())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTimeWithSeconds())
      setDate(formatDateKorean())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // App status icon
  const getStatusIcon = () => {
    if (!dayState) return '💤'
    return '🚀'
  }

  return (
    <div className={`flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 ${
      isNightMode ? 'bg-gray-900' : 'bg-gray-800'
    } text-white`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl">{getStatusIcon()}</span>
        <div className="min-w-0">
          <div className="text-xs sm:text-lg font-semibold whitespace-nowrap">{date}</div>
        </div>
      </div>

      <div className="text-xl sm:text-3xl font-mono font-light tracking-wider">
        {time}
      </div>

      <div className="flex items-center gap-1">
        {isSignedIn && onSignOut && (
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-gray-700 active:bg-gray-600 touch-target text-gray-400 hover:text-white"
            aria-label="로그아웃"
            title="Google 로그아웃"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
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
