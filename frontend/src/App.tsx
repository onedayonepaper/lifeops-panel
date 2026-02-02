import { useState, useEffect, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDayState } from './hooks/useDayState'
import { useNightMode } from './hooks/useNightMode'
import { useGoogleAuth } from './contexts/GoogleAuthContext'
import { requestNotificationPermission } from './utils/notifications'
import { TopBar } from './components/TopBar'
import { SettingsModal } from './components/SettingsModal'
import { Sidebar } from './components/Sidebar'
import { DailyRoutineCard } from './components/DailyRoutineCard'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage } from './pages/CalendarPage'
import { TasksPage } from './pages/TasksPage'
import { BucketListPage } from './pages/BucketListPage'
import { StudyJournalPage } from './pages/StudyJournalPage'
import { ApplyPage } from './pages/ApplyPage'
import { CompanyPage } from './pages/CompanyPage'
import EmploymentPage from './pages/EmploymentPage'
import { LifeAnchorsPage } from './pages/LifeAnchorsPage'
import { ClockPage } from './pages/ClockPage'
import JapanesePage from './pages/JapanesePage'
import HiraganaPracticePage from './pages/HiraganaPracticePage'
import PortfolioPage from './pages/PortfolioPage'
import PortfolioDetailPage from './pages/PortfolioDetailPage'
import ProjectInputPage from './pages/ProjectInputPage'
import ResumePage from './pages/ResumePage'
import ResumeDetailPage from './pages/ResumeDetailPage'
import ResumeEditPage from './pages/ResumeEditPage'
import CareerDetailPage from './pages/CareerDetailPage'
import CareerEditPage from './pages/CareerEditPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectEditPage from './pages/ProjectEditPage'
import ProfilePage from './pages/ProfilePage'
import PlanPage from './pages/PlanPage'
import CareerPage from './pages/CareerPage'
import PublicSectorITPage from './pages/PublicSectorITPage'
import JobDocumentsPage from './pages/JobDocumentsPage'
import HouseFindingPage from './pages/HouseFindingPage'
import ApiKeysPage from './pages/ApiKeysPage'

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
    <div className="space-y-4">
      {/* 오늘 카드 */}
      <DailyRoutineCard />
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/today" element={<HomePage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/bucket-list" element={<BucketListPage />} />
        <Route path="/study-journal" element={<StudyJournalPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/employment" element={<EmploymentPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/japanese" element={<JapanesePage />} />
        <Route path="/japanese/hiragana" element={<HiraganaPracticePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/new" element={<ProjectInputPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume/edit/new" element={<ResumeEditPage />} />
        <Route path="/resume/:id" element={<ResumeDetailPage />} />
        <Route path="/resume/:id/edit" element={<ResumeEditPage />} />
        <Route path="/career/edit/new" element={<CareerEditPage />} />
        <Route path="/career/:id" element={<CareerDetailPage />} />
        <Route path="/career/:id/edit" element={<CareerEditPage />} />
        <Route path="/project/edit/new" element={<ProjectEditPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/project/:id/edit" element={<ProjectEditPage />} />
        <Route path="/public-sector-it" element={<PublicSectorITPage />} />
        <Route path="/job-documents" element={<JobDocumentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/life-anchors" element={<LifeAnchorsPage />} />
        <Route path="/house-finding" element={<HouseFindingPage />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/clock" element={<ClockPage />} />
      </Routes>
    </Layout>
  )
}

export default App
