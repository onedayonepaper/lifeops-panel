import { useWeeklyStreak, type DayStreak } from '../hooks/useWeeklyStreak'

function DayCell({ day }: { day: DayStreak }) {
  const hasActivity = day.hasStudy || day.hasRun
  const isComplete = day.hasStudy && (day.hasRun || day.runPlan === 'REST')

  return (
    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${day.isToday ? 'scale-105 sm:scale-110' : ''}`}>
      <span className={`text-[10px] sm:text-xs font-medium ${
        day.isToday ? 'text-emerald-400' : 'text-gray-400'
      }`}>
        {day.dayOfWeek}
      </span>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg ${
        isComplete
          ? 'bg-emerald-500 text-white'
          : hasActivity
          ? 'bg-amber-500 text-white'
          : day.isToday
          ? 'bg-gray-600 text-gray-300 ring-2 ring-emerald-400'
          : 'bg-gray-700 text-gray-500'
      }`}>
        {isComplete ? '🔥' : hasActivity ? '⚡' : day.isToday ? '📍' : '·'}
      </div>
      <div className="flex gap-0.5">
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
          day.hasStudy ? 'bg-blue-400' : 'bg-gray-600'
        }`} title="공부" />
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
          day.hasRun ? 'bg-green-400' : day.runPlan === 'REST' ? 'bg-gray-500' : 'bg-gray-600'
        }`} title="운동" />
      </div>
    </div>
  )
}

function formatHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

export function WeeklyStreakCard() {
  const { data, isLoading } = useWeeklyStreak()

  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">📊</span>
          <span className="hidden sm:inline">이번 주 기록</span>
          <span className="sm:hidden">주간</span>
        </h2>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          {data.studyStreak > 0 && (
            <span className="flex items-center gap-0.5 sm:gap-1 text-blue-500">
              <span>📚</span>
              <span className="font-bold">{data.studyStreak}</span>
              <span className="hidden sm:inline text-xs text-gray-500">연속</span>
            </span>
          )}
          {data.runStreak > 0 && (
            <span className="flex items-center gap-0.5 sm:gap-1 text-green-500">
              <span>🏃</span>
              <span className="font-bold">{data.runStreak}</span>
              <span className="hidden sm:inline text-xs text-gray-500">연속</span>
            </span>
          )}
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex justify-between mb-3 sm:mb-4">
        {data.days.map((day) => (
          <DayCell key={day.date} day={day} />
        ))}
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            공부
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            운동
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span>📚 {formatHoursMinutes(data.totalStudyMinutes)}</span>
          <span>🏃 {data.totalRunDays}일</span>
        </div>
      </div>
    </div>
  )
}
