import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import { formatSecondsToTimer } from '../utils/time'
import { notifyPomodoroComplete } from '../utils/notifications'
import type { DayState } from '../store/db'
import type { TimerRef } from '../App'

interface StudyTimerCardProps {
  dayState: DayState
  weeklyStudyMinutes: number
  onAddStudyMinutes: (minutes: number) => Promise<void>
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

const DURATIONS = {
  work: 25 * 60,        // 25분
  shortBreak: 5 * 60,   // 5분
  longBreak: 15 * 60    // 15분
}

export const StudyTimerCard = forwardRef<TimerRef, StudyTimerCardProps>(function StudyTimerCard({
  dayState,
  weeklyStudyMinutes,
  onAddStudyMinutes
}, ref) {
  const [mode, setMode] = useState<TimerMode>('work')
  const [seconds, setSeconds] = useState(DURATIONS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQFq2+LJskJlbpfQzIRaHBhgveTnqHIPOpLk68yWYiZYqezwzJJYJWOq5N/FhEoYVara3rmJUzFPnN/u26huIjeMwu7hs4pXMFmRt+jgq39GJG2W1O7gtX5VOU2c3OTUq3Y8O4jV7+W+gF8rW5LT7eC7gFQvYZ3Z')
  }, [])

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const startTimer = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setSeconds(DURATIONS[mode])
  }, [mode])

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode)
    setSeconds(DURATIONS[newMode])
    setIsRunning(false)
  }, [])

  // Expose toggle and reset methods via ref
  useImperativeHandle(ref, () => ({
    toggle: () => {
      if (isRunning) {
        pauseTimer()
      } else {
        startTimer()
      }
    },
    reset: resetTimer
  }), [isRunning, pauseTimer, startTimer, resetTimer])

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            playSound()
            notifyPomodoroComplete(mode)

            // Handle timer complete
            if (mode === 'work') {
              // Add study time
              onAddStudyMinutes(25)
              const newSessionCount = sessionCount + 1
              setSessionCount(newSessionCount)

              // Every 4 sessions, take a long break
              if (newSessionCount % 4 === 0) {
                setMode('longBreak')
                return DURATIONS.longBreak
              } else {
                setMode('shortBreak')
                return DURATIONS.shortBreak
              }
            } else {
              // Break is over, start work
              setMode('work')
              return DURATIONS.work
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, mode, sessionCount, playSound, onAddStudyMinutes])

  const formatWeeklyHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}분`
    if (mins === 0) return `${hours}시간`
    return `${hours}시간 ${mins}분`
  }

  const progress = ((DURATIONS[mode] - seconds) / DURATIONS[mode]) * 100

  const getModeConfig = () => {
    switch (mode) {
      case 'work':
        return {
          emoji: isRunning ? '🔥' : '🍅',
          label: '집중',
          gradient: 'from-rose-900 to-red-950',
          buttonColor: 'bg-rose-800 hover:bg-rose-700'
        }
      case 'shortBreak':
        return {
          emoji: '☕',
          label: '짧은 휴식',
          gradient: 'from-teal-800 to-teal-900',
          buttonColor: 'bg-teal-700 hover:bg-teal-600'
        }
      case 'longBreak':
        return {
          emoji: '🌴',
          label: '긴 휴식',
          gradient: 'from-indigo-800 to-indigo-900',
          buttonColor: 'bg-indigo-700 hover:bg-indigo-600'
        }
    }
  }

  const config = getModeConfig()

  return (
    <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg bg-gradient-to-br ${config.gradient} text-white`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">{config.emoji}</span>
          <span className="hidden sm:inline">뽀모도로</span>
          <span className="sm:hidden">타이머</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-lg">
            {sessionCount} 세션
          </span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-3 sm:mb-4 bg-white/10 p-1 rounded-xl">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all truncate ${
              mode === m ? 'bg-white/30' : 'hover:bg-white/10'
            }`}
          >
            {m === 'work' ? '집중' : m === 'shortBreak' ? '짧은휴식' : '긴휴식'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-3 sm:mb-4">
        {/* Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-28 h-28 sm:w-40 sm:h-40 -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
              className="sm:stroke-[8]"
            />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="white"
              strokeWidth="6"
              className="sm:stroke-[8]"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 1s' }}
            />
          </svg>
        </div>

        {/* Timer Text */}
        <div className="text-center py-5 sm:py-8">
          <div className="text-4xl sm:text-5xl font-mono font-bold">
            {formatSecondsToTimer(seconds)}
          </div>
          <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-white/80">
            {isRunning ? `${config.label} 중...` : config.label}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl ${config.buttonColor} text-white font-semibold text-sm sm:text-base`}
          >
            {seconds === DURATIONS[mode] ? '시작' : '계속'}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base"
          >
            일시정지
          </button>
        )}
        <button
          onClick={resetTimer}
          className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base"
        >
          리셋
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs sm:text-sm text-white/80">
        <span>오늘: {dayState.studyMinutesDone}분</span>
        <span>이번 주: {formatWeeklyHours(weeklyStudyMinutes)}</span>
      </div>
    </div>
  )
})
