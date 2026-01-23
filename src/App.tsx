import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { useToast } from './components/Toast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { requestNotificationPermission } from './utils/notifications'
import { TopBar } from './components/TopBar'
import { StudyTimerCard } from './components/StudyTimerCard'
import { RunCard } from './components/RunCard'
import { SettingsModal } from './components/SettingsModal'
import { CalendarCard } from './components/CalendarCard'
import { WeeklyStreakCard } from './components/WeeklyStreakCard'
import { HabitTrackerCard } from './components/HabitTrackerCard'
import { Top3Card } from './components/Top3Card'
import { OneActionCard } from './components/OneActionCard'
import { CalendarPage } from './pages/CalendarPage'

// Timer ref type for keyboard shortcuts
export interface TimerRef {
  toggle: () => void
  reset: () => void
}

function HomePage() {
  const { dayState, settings, weeklyStudyMinutes, isLoading, error, clearError, actions } = useDayState()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { showToast } = useToast()
  const timerRef = useRef<TimerRef>(null)

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast(error, 'error')
      clearError()
    }
  }, [error, showToast, clearError])

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleTimer: () => timerRef.current?.toggle(),
    onResetTimer: () => timerRef.current?.reset(),
    onToggleTop3: (index) => {
      if (dayState?.top3[index]?.trim()) {
        actions.toggleTop3Done(index)
      }
    },
    onToggleOneAction: () => {
      if (dayState?.oneAction?.trim()) {
        actions.toggleOneActionDone()
      }
    },
    onRefresh: () => window.location.reload()
  })

  const isNight = useNightMode(
    settings?.nightModeStart || '23:00',
    settings?.nightModeEnd || '06:00'
  )

  if (isLoading || !dayState || !settings) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isNight ? 'bg-gray-950' : 'bg-gray-900'
      }`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-white text-lg">LifeOps Panel</div>
          <div className="text-gray-400 text-sm mt-2">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen w-full ${isNight ? 'night-mode bg-gray-950' : 'bg-gray-900'}`}>
      {/* Top Bar */}
      <TopBar
        dayState={dayState}
        isNightMode={isNight}
        onRefreshClick={() => window.location.reload()}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="p-2 sm:p-4 pb-8">
        <div className="grid gap-2 sm:gap-4">
          {/* Calendar */}
          <CalendarCard />

          {/* Pomodoro Timer & Habits */}
          <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
            <StudyTimerCard
              ref={timerRef}
              dayState={dayState}
              weeklyStudyMinutes={weeklyStudyMinutes}
              onAddStudyMinutes={actions.addStudyMinutes}
            />
            <HabitTrackerCard />
          </div>

          {/* Run & Weekly Streak */}
          <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
            <RunCard
              dayState={dayState}
              onUpdateRunPlan={actions.updateRunPlan}
              onToggleRunDone={actions.toggleRunDone}
            />
            <WeeklyStreakCard />
          </div>

          {/* Top3 & One Action */}
          <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
            <Top3Card
              dayState={dayState}
              onUpdateTop3={actions.updateTop3}
              onToggleTop3Done={actions.toggleTop3Done}
              onCopyFromYesterday={actions.copyFromYesterday}
            />
            <OneActionCard
              dayState={dayState}
              onUpdateOneAction={actions.updateOneAction}
              onToggleOneActionDone={actions.toggleOneActionDone}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
      />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  )
}

export default App
