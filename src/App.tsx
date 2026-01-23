import { useState } from 'react'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { TopBar } from './components/TopBar'
import { Top3Card } from './components/Top3Card'
import { OneActionCard } from './components/OneActionCard'
import { StudyTimerCard } from './components/StudyTimerCard'
import { RunCard } from './components/RunCard'
import { NotesCard } from './components/NotesCard'
import { SettingsModal } from './components/SettingsModal'
import { WeatherCard } from './components/WeatherCard'

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
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="p-4 pb-8 max-w-2xl mx-auto">
        <div className="grid gap-4">
          {/* Weather */}
          <WeatherCard />

          {/* Row 1: Top3 & OneAction */}
          <div className="grid md:grid-cols-2 gap-4">
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

          {/* Row 2: Study Timer & Run */}
          <div className="grid md:grid-cols-2 gap-4">
            <StudyTimerCard
              dayState={dayState}
              weeklyStudyMinutes={weeklyStudyMinutes}
              onAddStudyMinutes={actions.addStudyMinutes}
            />
            <RunCard
              dayState={dayState}
              onUpdateRunPlan={actions.updateRunPlan}
              onToggleRunDone={actions.toggleRunDone}
            />
          </div>

          {/* Row 3: Notes */}
          <NotesCard
            dayState={dayState}
            onUpdateNotes={actions.updateNotes}
          />
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
