import { useState } from 'react'
import { useTodayTasksSheet, type TodayTask } from '../hooks/useTodayTasksSheet'

function TaskItem({
  task,
  onToggle,
  onPostpone,
  onDelete
}: {
  task: TodayTask
  onToggle: (taskId: string, completed: boolean) => void
  onPostpone: (taskId: string) => void
  onDelete: (taskId: string) => void
}) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
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
      <span className={`flex-1 text-sm ${
        task.completed ? 'text-gray-500 line-through' : 'text-white'
      }`}>
        {task.title}
      </span>
      {!task.completed && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
          <button
            onClick={() => onPostpone(task.id)}
            className="text-xs text-gray-400 hover:text-yellow-400"
            title="내일로 미루기"
          >
            →내일
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-400"
            title="삭제"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export function TodayTasksCard() {
  const {
    tasks,
    incompleteTasks,
    completedTasks,
    isLoading,
    isSignedIn,
    signIn,
    toggleTask,
    postponeTask,
    deleteTask,
    addTask,
    spreadsheetUrl
  } = useTodayTasksSheet()
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [copied, setCopied] = useState(false)

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    const today = new Date().toISOString().split('T')[0]
    await addTask(newTaskTitle.trim(), today)
    setNewTaskTitle('')
    setIsAdding(false)
  }

  const copyToClipboard = async () => {
    const text = incompleteTasks.map(task => `• ${task.title}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 로그인 필요
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">오늘 할일</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400 mb-3">
            Google Sheets와 연동하세요
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
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">오늘 할일</h2>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          오늘 할일
          {incompleteTasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              {incompleteTasks.length}개 남음
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="할일 추가"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={copyToClipboard}
            className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors ${
              copied ? 'text-green-400' : 'text-gray-400 hover:text-white'
            }`}
            title="목록 복사"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>
{spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              시트 열기
            </a>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-700/50">
        {/* 할일 추가 입력 */}
        {isAdding && (
          <div className="px-3 py-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTaskTitle('')
                }
              }}
              placeholder="할일 입력 후 Enter"
              className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        {incompleteTasks.length === 0 && !isAdding ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400">
              {completedTasks.length > 0 ? '모두 완료! 🎉' : '오늘 할일이 없습니다'}
            </p>
          </div>
        ) : (
          <>
            {/* 미완료 할일 */}
            {incompleteTasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onPostpone={postponeTask} onDelete={deleteTask} />
            ))}

            {/* 더 있으면 표시 */}
            {incompleteTasks.length > 5 && spreadsheetUrl && (
              <div className="px-4 py-2 text-center">
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-400"
                >
                  +{incompleteTasks.length - 5}개 더보기
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* 진행률 - 미완료 할일이 있을 때만 표시 */}
      {incompleteTasks.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>진행률</span>
            <span>{completedTasks.length}/{tasks.length}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
