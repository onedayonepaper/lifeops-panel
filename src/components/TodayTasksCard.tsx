import { Link } from 'react-router-dom'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleTasks, type Task } from '../hooks/useGoogleTasks'

function TaskItem({
  task,
  onToggle
}: {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        task.completed ? 'opacity-50' : 'hover:bg-gray-700/50'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-emerald-700 border-emerald-500 text-white'
            : 'border-gray-500 hover:border-emerald-400'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`text-sm ${
        task.completed ? 'text-gray-500 line-through' : 'text-white'
      }`}>
        {task.title}
      </span>
    </div>
  )
}

export function TodayTasksCard() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const { tasks, isLoading, toggleTask } = useGoogleTasks(accessToken)

  // 오늘 날짜
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 오늘 마감이거나 마감일이 없는 미완료 할일 + 완료된 할일
  const todayTasks = tasks.filter(task => {
    if (task.due) {
      const dueDate = new Date(task.due)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate <= today // 오늘 또는 지난 마감일
    }
    return true // 마감일 없는 할일도 표시
  })

  const incompleteTasks = todayTasks.filter(t => !t.completed)
  const completedTasks = todayTasks.filter(t => t.completed)

  // 로그인 필요
  if (!isSignedIn) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">오늘 할일</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Google Tasks와 연동하세요
          </p>
          <button
            onClick={signIn}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  // 로딩
  if (isLoading && tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">오늘 할일</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          오늘 할일
          {incompleteTasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              {incompleteTasks.length}개 남음
            </span>
          )}
        </h2>
        <Link
          to="/tasks"
          className="text-sm text-blue-500 hover:text-blue-400"
        >
          전체보기
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              오늘 할일이 없습니다
            </p>
          </div>
        ) : (
          <>
            {/* 미완료 할일 */}
            {incompleteTasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} />
            ))}

            {/* 더 있으면 표시 */}
            {incompleteTasks.length > 5 && (
              <div className="px-4 py-2 text-center">
                <Link
                  to="/tasks"
                  className="text-sm text-gray-500 hover:text-gray-400"
                >
                  +{incompleteTasks.length - 5}개 더보기
                </Link>
              </div>
            )}

            {/* 완료된 할일 (최대 2개) */}
            {completedTasks.length > 0 && incompleteTasks.length < 5 && (
              <>
                {completedTasks.slice(0, 2).map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* 진행률 */}
      {todayTasks.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>진행률</span>
            <span>{completedTasks.length}/{todayTasks.length}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedTasks.length / todayTasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
