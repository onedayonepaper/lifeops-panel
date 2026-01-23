import type { DayState, RunPlan } from '../store/db'

interface RunCardProps {
  dayState: DayState
  onUpdateRunPlan: (plan: RunPlan) => Promise<void>
  onToggleRunDone: () => Promise<void>
}

const RUN_PLANS: { value: RunPlan; label: string; emoji: string; description: string }[] = [
  { value: 'REST', label: '휴식', emoji: '😴', description: '오늘은 쉬어요' },
  { value: 'EASY', label: '이지런', emoji: '🚶', description: '가볍게 30분' },
  { value: 'LSD', label: 'LSD', emoji: '🏃', description: '천천히 오래' },
  { value: 'INTERVAL', label: '인터벌', emoji: '⚡', description: '빠르게 강하게' },
]

export function RunCard({
  dayState,
  onUpdateRunPlan,
  onToggleRunDone
}: RunCardProps) {
  const currentPlan = RUN_PLANS.find(p => p.value === dayState.runPlan) || RUN_PLANS[0]
  const isRestDay = dayState.runPlan === 'REST'

  return (
    <div className={`rounded-2xl p-3 sm:p-4 shadow-lg card-hover ${
      dayState.runDone
        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
        : 'bg-white dark:bg-gray-800'
    }`}>
      <h2 className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${
        dayState.runDone ? 'text-white' : 'text-gray-900 dark:text-white'
      }`}>
        <span className="text-lg sm:text-xl">🏃</span>
        <span className="hidden sm:inline">러닝 / 운동</span>
        <span className="sm:hidden">운동</span>
      </h2>

      {/* Plan Selection */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {RUN_PLANS.map((plan) => (
          <button
            key={plan.value}
            onClick={() => onUpdateRunPlan(plan.value)}
            className={`py-2 sm:py-3 px-1.5 sm:px-2 rounded-xl text-center touch-target transition-all ${
              dayState.runPlan === plan.value
                ? dayState.runDone
                  ? 'bg-white/30 text-white ring-2 ring-white/50'
                  : 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                : dayState.runDone
                ? 'bg-white/10 text-white/70 hover:bg-white/20'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">{plan.emoji}</div>
            <div className="text-[10px] sm:text-xs font-medium">{plan.label}</div>
          </button>
        ))}
      </div>

      {/* Current Plan Info */}
      <div className={`p-2 sm:p-3 rounded-xl mb-3 sm:mb-4 ${
        dayState.runDone
          ? 'bg-white/10'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <div className={`text-center ${
          dayState.runDone ? 'text-white' : 'text-gray-600 dark:text-gray-300'
        }`}>
          <span className="text-xl sm:text-2xl mr-1.5 sm:mr-2">{currentPlan.emoji}</span>
          <span className="text-sm sm:text-base font-medium">{currentPlan.description}</span>
        </div>
      </div>

      {/* Complete Button */}
      {!isRestDay && (
        <button
          onClick={onToggleRunDone}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-sm sm:text-base touch-target ${
            dayState.runDone
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {dayState.runDone ? '완료 취소' : '운동 완료!'}
        </button>
      )}

      {isRestDay && (
        <div className={`text-center py-2 sm:py-3 text-sm sm:text-base ${
          dayState.runDone ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
        }`}>
          쉬는 것도 운동의 일부예요 💪
        </div>
      )}
    </div>
  )
}
