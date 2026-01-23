import { useState, useCallback, useRef, useEffect } from 'react'

interface UseTimerReturn {
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  isComplete: boolean
}

export function useTimer(durationMinutes: number): UseTimerReturn {
  const durationSeconds = durationMinutes * 60
  const [seconds, setSeconds] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (seconds <= 0 || isComplete) return
    setIsRunning(true)
  }, [seconds, isComplete])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    setIsRunning(false)
    setIsComplete(false)
    setSeconds(durationSeconds)
    clearTimer()
  }, [durationSeconds, clearTimer])

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return clearTimer
  }, [isRunning, clearTimer])

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    isComplete
  }
}
