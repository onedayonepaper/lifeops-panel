import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { useGoogleAuth } from './contexts/GoogleAuthContext'
import { useToast } from './components/Toast'
import { requestNotificationPermission } from './utils/notifications'
import { TopBar } from './components/TopBar'
import { SettingsModal } from './components/SettingsModal'
import { CalendarCard } from './components/CalendarCard'
import { TasksCard } from './components/TasksCard'
import { BucketListCard } from './components/BucketListCard'
import { StudyJournalCard } from './components/StudyJournalCard'
import { CalendarPage } from './pages/CalendarPage'

function HomePage() {
  const { dayState, settings, isLoading, error, clearError } = useDayState()
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { showToast } = useToast()

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
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Calendar */}
          <CalendarCard />
          {/* Tasks */}
          <TasksCard accessToken={accessToken} isSignedIn={isSignedIn} onSignIn={signIn} />
          {/* Bucket List */}
          <BucketListCard accessToken={accessToken} isSignedIn={isSignedIn} onSignIn={signIn} />
          {/* Study Journal */}
          <StudyJournalCard accessToken={accessToken} isSignedIn={isSignedIn} onSignIn={signIn} />
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
