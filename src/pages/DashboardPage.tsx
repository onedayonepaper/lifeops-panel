import { useEffect } from 'react'
import { useDayState } from '../hooks/useDayState'
import { useToast } from '../components/Toast'
import { requestNotificationPermission } from '../utils/notifications'
import { CalendarCard } from '../components/CalendarCard'
import { TodaySummaryCard } from '../components/TodaySummaryCard'
import { DailyRoutineCard } from '../components/DailyRoutineCard'
import { PageHeader } from '../components/PageHeader'

export function DashboardPage() {
  const { error, clearError } = useDayState()
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

      <div className="space-y-2 sm:space-y-3">
        {/* Top Row: Summary + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          <TodaySummaryCard />
          <CalendarCard />
        </div>

        {/* Today's Routine - 오늘 카드 */}
        <DailyRoutineCard />
      </div>
    </div>
  )
}
