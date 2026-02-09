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
import { TodayTasksCard } from './components/TodayTasksCard'
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
import CareerDescriptionPage from './pages/CareerDescriptionPage'
import ResumeSummaryPage from './pages/ResumeSummaryPage'
import FinancePage from './pages/FinancePage'
import SavingsPage from './pages/SavingsPage'
import InsurancePage from './pages/InsurancePage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import FixedExpensesPage from './pages/FixedExpensesPage'
import CardsPage from './pages/CardsPage'
import SelfIntroductionPage from './pages/SelfIntroductionPage'
import ExternalProfilesPage from './pages/ExternalProfilesPage'
import AppliedCompanyPage from './pages/AppliedCompanyPage'
import SpecSchedulePage from './pages/SpecSchedulePage'
import ResumeManagementPage from './pages/ResumeManagementPage'

// Layout wrapper with sidebar
function Layout({ children }: { children: ReactNode }) {
  const { dayState, settings, isLoading, error } = useDayState()
  const { isSignedIn, signOut } = useGoogleAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const isNight = useNightMode(
    settings?.nightModeStart || '23:00',
    settings?.nightModeEnd || '06:00'
  )

  if (isLoading && !error) {
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
        {dayState && (
          <TopBar
            dayState={dayState}
            isNightMode={isNight}
            onRefreshClick={() => window.location.reload()}
            onSettingsClick={() => setIsSettingsOpen(true)}
            isSignedIn={isSignedIn}
            onSignOut={signOut}
          />
        )}

        <main className="p-2 sm:p-4 pb-8">
          {children}
        </main>

        {settings && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
          />
        )}
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
      {/* 오늘의 루틴 */}
      <DailyRoutineCard />
      {/* 오늘 할일 */}
      <TodayTasksCard />
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* 시계 페이지는 전체 화면으로 표시 (사이드바 없음) */}
      <Route path="/clock" element={<ClockPage />} />

      {/* 나머지 페이지는 Layout 안에서 표시 */}
      <Route path="*" element={
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
            <Route path="/applied-company" element={<AppliedCompanyPage />} />
            <Route path="/japanese" element={<JapanesePage />} />
            <Route path="/japanese/hiragana" element={<HiraganaPracticePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/new" element={<ProjectInputPage />} />
            <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
            <Route path="/job-document" element={<ResumePage />} />
            <Route path="/job-document/edit/new" element={<ResumeEditPage />} />
            <Route path="/job-document/:id" element={<ResumeDetailPage />} />
            <Route path="/job-document/:id/edit" element={<ResumeEditPage />} />
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
            <Route path="/career-description" element={<CareerDescriptionPage />} />
            <Route path="/resume" element={<ResumeSummaryPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/insurance" element={<InsurancePage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/self-introduction" element={<SelfIntroductionPage />} />
            <Route path="/external-profiles" element={<ExternalProfilesPage />} />
            <Route path="/spec-schedule" element={<SpecSchedulePage />} />
            <Route path="/resume-management" element={<ResumeManagementPage />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

export default App
