import { useEffect } from 'react'
import { useDayState } from '../hooks/useDayState'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useToast } from '../components/Toast'
import { requestNotificationPermission } from '../utils/notifications'
import { CalendarCard } from '../components/CalendarCard'
import { GSECard } from '../components/GSECard'
import { ApplyCard } from '../components/ApplyCard'
import { SpecCard } from '../components/SpecCard'
import { TodaySummaryCard } from '../components/TodaySummaryCard'
import { QuickLinksCard } from '../components/QuickLinksCard'
import { ProjectsCard } from '../components/ProjectsCard'
import { PageHeader } from '../components/PageHeader'

export function DashboardPage() {
  const { error, clearError } = useDayState()
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
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

  return (
    <div>
      <PageHeader icon="📊" title="대시보드" />

      <div className="space-y-2 sm:space-y-4">
        {/* Today's Summary - 오늘의 요약 */}
        <TodaySummaryCard />

        {/* Main Content Grid */}
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
          <CalendarCard />
          <GSECard accessToken={accessToken} isSignedIn={isSignedIn} onSignIn={signIn} />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
          <ApplyCard />
          <SpecCard />
        </div>

        {/* Projects */}
        <ProjectsCard />

        {/* Quick Links */}
        <QuickLinksCard />
      </div>
    </div>
  )
}
