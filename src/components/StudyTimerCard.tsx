import { useState, useEffect, useCallback, useRef } from 'react'
import { formatSecondsToTimer } from '../utils/time'
import type { DayState } from '../store/db'

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

export function StudyTimerCard({
  dayState,
  weeklyStudyMinutes,
  onAddStudyMinutes
}: StudyTimerCardProps) {
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

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            playSound()

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
          gradient: 'from-red-500 to-orange-600',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        }
      case 'shortBreak':
        return {
          emoji: '☕',
          label: '짧은 휴식',
          gradient: 'from-emerald-500 to-teal-600',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
        }
      case 'longBreak':
        return {
          emoji: '🌴',
          label: '긴 휴식',
          gradient: 'from-blue-500 to-indigo-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const config = getModeConfig()

  return (
    <div className={`rounded-2xl p-4 shadow-lg bg-gradient-to-br ${config.gradient} text-white`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          뽀모도로
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">
            {sessionCount} 세션
          </span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 mb-4 bg-white/10 p-1 rounded-xl">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-white/30' : 'hover:bg-white/10'
            }`}
          >
            {m === 'work' ? '집중' : m === 'shortBreak' ? '짧은휴식' : '긴휴식'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-4">
        {/* Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-40 h-40 -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        {/* Timer Text */}
        <div className="text-center py-8">
          <div className="text-5xl font-mono font-bold">
            {formatSecondsToTimer(seconds)}
          </div>
          <div className="text-sm mt-2 text-white/80">
            {isRunning ? `${config.label} 중...` : config.label}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className={`flex-1 py-3 px-4 rounded-xl ${config.buttonColor} text-white font-semibold`}
          >
            {seconds === DURATIONS[mode] ? '시작' : '계속'}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex-1 py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold"
          >
            일시정지
          </button>
        )}
        <button
          onClick={resetTimer}
          className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
        >
          리셋
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-white/80">
        <span>오늘: {dayState.studyMinutesDone}분</span>
        <span>이번 주: {formatWeeklyHours(weeklyStudyMinutes)}</span>
      </div>
    </div>
  )
}
