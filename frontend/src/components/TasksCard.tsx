import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleTasks, type Task } from '../hooks/useGoogleTasks'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

function TaskItem({
  task,
  onToggle
}: {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
        task.completed ? 'opacity-50 bg-gray-800/50' : 'bg-gray-800 hover:bg-gray-750'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
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

      <div className="flex-1 min-w-0">
        <span className={`block text-sm ${
          task.completed ? 'text-gray-500 line-through' : 'text-white'
        }`}>
          {task.title}
        </span>
        {task.due && (
          <span className={`text-xs ${
            task.completed ? 'text-gray-600' : 'text-blue-400'
          }`}>
            📅 {format(task.due, 'M월 d일', { locale: ko })}
          </span>
        )}
      </div>
    </div>
  )
}

export function TasksCard() {
  const { isSignedIn, signIn } = useGoogleAuth()
  const { tasks, isLoading, toggleTask } = useGoogleTasks()
  const { addBatchEvents } = useGoogleCalendar()
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedCount = tasks.filter(t => t.completed).length

  // 할일을 캘린더에 추가 (넉넉한 시간 배분)
  const addTasksToCalendar = async () => {
    if (incompleteTasks.length === 0 || isAddingToCalendar) return

    setIsAddingToCalendar(true)

    const today = new Date().toISOString().split('T')[0]

    // 시작 시간을 19:00부터 배치 (저녁 시간에 할일 처리)
    // 각 할일에 30분씩 넉넉하게 배분
    const batchEvents = incompleteTasks.slice(0, 8).map((task, index) => {
      const startHour = 19 + Math.floor(index / 2)
      const startMinute = (index % 2) * 30
      const endMinute = startMinute + 30

      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
      const endTime = endMinute === 60
        ? `${(startHour + 1).toString().padStart(2, '0')}:00`
        : `${startHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

      return {
        title: `📋 ${task.title}`,
        startTime,
        endTime,
      }
    })

    const result = await addBatchEvents(today, batchEvents)

    setIsAddingToCalendar(false)

    if (result.success > 0) {
      alert(`${result.success}개 할일이 캘린더에 추가되었습니다!`)
    } else {
      alert('캘린더 추가에 실패했습니다.')
    }
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>✅</span>
            <span>할일</span>
          </h2>
          <Link to="/tasks" className="text-sm text-gray-400 hover:text-white">
            전체보기 →
          </Link>
        </div>
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm mb-3">Google Tasks와 연동하세요</p>
          <button
            onClick={signIn}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
          >
            Google 연동
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading && tasks.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>✅</span>
            <span>할일</span>
          </h2>
          <Link to="/tasks" className="text-sm text-gray-400 hover:text-white">
            전체보기 →
          </Link>
        </div>
        <div className="text-center py-6 text-gray-400 text-sm">
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>✅</span>
          <span>할일</span>
          {tasks.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({completedCount}/{tasks.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {incompleteTasks.length > 0 && (
            <button
              onClick={addTasksToCalendar}
              disabled={isAddingToCalendar}
              className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
                isAddingToCalendar ? 'text-green-400 animate-pulse' : 'text-gray-400 hover:text-white'
              }`}
              title="캘린더에 할일 추가"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          <Link to="/tasks" className="text-sm text-gray-400 hover:text-white">
            전체보기 →
          </Link>
        </div>
      </div>

      {incompleteTasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-800 rounded-xl">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-sm">모든 할일 완료!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {incompleteTasks.slice(0, 5).map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
            />
          ))}
          {incompleteTasks.length > 5 && (
            <Link
              to="/tasks"
              className="block text-center py-2 text-sm text-gray-400 hover:text-white"
            >
              +{incompleteTasks.length - 5}개 더보기
            </Link>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-700 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
