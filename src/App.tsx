import { useState } from 'react'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { TopBar } from './components/TopBar'
import { StudyTimerCard } from './components/StudyTimerCard'
import { RunCard } from './components/RunCard'
import { SettingsModal } from './components/SettingsModal'
import { CalendarCard } from './components/CalendarCard'
import { WeeklyStreakCard } from './components/WeeklyStreakCard'
import { HabitTrackerCard } from './components/HabitTrackerCard'

function App() {
  const { dayState, settings, weeklyStudyMinutes, isLoading, actions } = useDayState()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
    <div className={`min-h-screen ${isNight ? 'night-mode bg-gray-950' : 'bg-gray-900'}`}>
      {/* Top Bar */}
      <TopBar
        dayState={dayState}
        isNightMode={isNight}
        onRefreshClick={() => window.location.reload()}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="p-4 pb-8 max-w-2xl mx-auto">
        <div className="grid gap-4">
          {/* Calendar */}
          <CalendarCard />

          {/* Pomodoro Timer & Habits */}
          <div className="grid md:grid-cols-2 gap-4">
            <StudyTimerCard
              dayState={dayState}
              weeklyStudyMinutes={weeklyStudyMinutes}
              onAddStudyMinutes={actions.addStudyMinutes}
            />
            <HabitTrackerCard />
          </div>

          {/* Run & Weekly Streak */}
          <div className="grid md:grid-cols-2 gap-4">
            <RunCard
              dayState={dayState}
              onUpdateRunPlan={actions.updateRunPlan}
              onToggleRunDone={actions.toggleRunDone}
            />
            <WeeklyStreakCard />
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

export default App
