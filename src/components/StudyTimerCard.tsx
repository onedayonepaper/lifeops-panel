import { useEffect, useCallback } from 'react'
import { useTimer } from '../hooks/useTimer'
import { formatSecondsToTimer } from '../utils/time'
import type { DayState } from '../store/db'

interface StudyTimerCardProps {
  dayState: DayState
  weeklyStudyMinutes: number
  onAddStudyMinutes: (minutes: number) => Promise<void>
}

const STUDY_DURATION_MINUTES = 60

export function StudyTimerCard({
  dayState,
  weeklyStudyMinutes,
  onAddStudyMinutes
}: StudyTimerCardProps) {
  const { seconds, isRunning, start, pause, reset, isComplete } = useTimer(STUDY_DURATION_MINUTES)

  const handleComplete = useCallback(async () => {
    await onAddStudyMinutes(STUDY_DURATION_MINUTES)
  }, [onAddStudyMinutes])

  useEffect(() => {
    if (isComplete) {
      handleComplete()
    }
  }, [isComplete, handleComplete])

  const formatWeeklyHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}분`
    if (mins === 0) return `${hours}시간`
    return `${hours}시간 ${mins}분`
  }

  return (
    <div className={`rounded-2xl p-4 shadow-lg card-hover ${
      isRunning
        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
        : isComplete
        ? 'bg-gradient-to-br from-emerald-500 to-green-600'
        : 'bg-white dark:bg-gray-800'
    }`}>
      <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
        isRunning || isComplete ? 'text-white' : 'text-gray-900 dark:text-white'
      }`}>
        <span className="text-xl">{isComplete ? '✅' : isRunning ? '🔥' : '📚'}</span>
        공부 타이머
      </h2>

      {/* Timer Display */}
      <div className={`text-center py-4 rounded-xl mb-4 ${
        isRunning
          ? 'bg-white/20 backdrop-blur'
          : isComplete
          ? 'bg-white/20 backdrop-blur'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <div className={`text-5xl font-mono font-bold ${
          isRunning ? 'text-white animate-pulse-slow' : isComplete ? 'text-white' : 'text-gray-900 dark:text-white'
        }`}>
          {formatSecondsToTimer(seconds)}
        </div>
        <div className={`text-sm mt-2 ${
          isRunning || isComplete ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {isComplete ? '세션 완료!' : isRunning ? '집중 중...' : `${STUDY_DURATION_MINUTES}분 집중 세션`}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {!isRunning && !isComplete && (
          <button
            onClick={start}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold touch-target"
          >
            시작
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
            className="flex-1 py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold touch-target"
          >
            일시정지
          </button>
        )}
        {(isRunning || seconds < STUDY_DURATION_MINUTES * 60) && !isComplete && (
          <button
            onClick={reset}
            className={`py-3 px-4 rounded-xl font-semibold touch-target ${
              isRunning
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
            }`}
          >
            리셋
          </button>
        )}
        {isComplete && (
          <button
            onClick={reset}
            className="flex-1 py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold touch-target"
          >
            한 번 더
          </button>
        )}
      </div>

      {/* Stats */}
      <div className={`flex justify-between text-sm ${
        isRunning || isComplete ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
      }`}>
        <span>오늘: {dayState.studyMinutesDone}분</span>
        <span>이번 주: {formatWeeklyHours(weeklyStudyMinutes)}</span>
      </div>
    </div>
  )
}
