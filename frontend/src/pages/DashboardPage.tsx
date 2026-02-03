import { useEffect } from 'react'
import { useDayState } from '../hooks/useDayState'
import { useToast } from '../components/Toast'
import { requestNotificationPermission } from '../utils/notifications'
import { DailyRoutineCard } from '../components/DailyRoutineCard'
import { TodayTasksCard } from '../components/TodayTasksCard'
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
        {/* 오늘 요약 - 일단 숨김 */}
        {/* <TodaySummaryCard /> */}

        {/* 오늘 카드 (왼쪽) + 할일 (오른쪽) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          <DailyRoutineCard />
          <TodayTasksCard />
        </div>
      </div>
    </div>
  )
}
