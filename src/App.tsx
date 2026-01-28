import { useState, useEffect, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { useGoogleAuth } from './contexts/GoogleAuthContext'
import { requestNotificationPermission } from './utils/notifications'
import { TopBar } from './components/TopBar'
import { SettingsModal } from './components/SettingsModal'
import { Sidebar } from './components/Sidebar'
import { DailyRoundCard } from './components/DailyRoundCard'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage } from './pages/CalendarPage'
import { TasksPage } from './pages/TasksPage'
import { BucketListPage } from './pages/BucketListPage'
import { StudyJournalPage } from './pages/StudyJournalPage'
import { GSEPage } from './pages/GSEPage'
import { SpecPage } from './pages/SpecPage'
import { ApplyPage } from './pages/ApplyPage'
import { CompanyPage } from './pages/CompanyPage'
import { LifeAnchorsPage } from './pages/LifeAnchorsPage'
import { ClockPage } from './pages/ClockPage'
import JapanesePage from './pages/JapanesePage'
import HiraganaPracticePage from './pages/HiraganaPracticePage'
import PortfolioPage from './pages/PortfolioPage'
import ResumePage from './pages/ResumePage'
import ResumeDetailPage from './pages/ResumeDetailPage'

// Layout wrapper with sidebar
function Layout({ children }: { children: ReactNode }) {
  const { dayState, settings, isLoading } = useDayState()
  const { isSignedIn, signOut } = useGoogleAuth()
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
    <div className={`min-h-screen flex ${isNight ? 'night-mode bg-gray-950' : 'bg-gray-900'}`}>
      <Sidebar isNightMode={isNight} />

      <div className="flex-1 min-w-0">
        <TopBar
          dayState={dayState}
          isNightMode={isNight}
          onRefreshClick={() => window.location.reload()}
          onSettingsClick={() => setIsSettingsOpen(true)}
          isSignedIn={isSignedIn}
          onSignOut={signOut}
        />

        <main className="p-2 sm:p-4 pb-8">
          {children}
        </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
        />
      </div>
    </div>
  )
}

function HomePage() {
  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div>
      {/* 오늘 카드 - 메인 페이지에서는 이것만 보여줌 */}
      <DailyRoundCard />
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/bucket-list" element={<BucketListPage />} />
        <Route path="/study-journal" element={<StudyJournalPage />} />
        <Route path="/goals" element={<GSEPage />} />
        <Route path="/spec" element={<SpecPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/japanese" element={<JapanesePage />} />
        <Route path="/japanese/hiragana" element={<HiraganaPracticePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/:id" element={<ResumeDetailPage />} />
        <Route path="/life-anchors" element={<LifeAnchorsPage />} />
        <Route path="/clock" element={<ClockPage />} />
      </Routes>
    </Layout>
  )
}

export default App
