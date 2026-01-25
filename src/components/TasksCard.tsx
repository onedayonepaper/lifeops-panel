import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleTasks, type Task } from '../hooks/useGoogleTasks'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface TasksCardProps {
  accessToken: string | null
  isSignedIn: boolean
  onSignIn: () => void
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit
}: {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleMenuClick = () => {
    if (!showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      })
    }
    setShowMenu(!showMenu)
  }

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-all relative group ${
        task.completed ? 'opacity-50' : 'hover:bg-gray-700/50'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
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
        <span className={`block text-sm sm:text-base ${
          task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
        }`}>
          {task.title}
        </span>
        {task.due && (
          <span className={`text-xs ${
            task.completed ? 'text-gray-600' : 'text-gray-500'
          }`}>
            {format(task.due, 'M/d (EEE)', { locale: ko })}
          </span>
        )}
      </div>

      {/* Menu button */}
      <div className="relative">
        <button
          ref={menuButtonRef}
          onClick={handleMenuClick}
          className="p-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-600 text-gray-400 hover:text-white transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setShowMenu(false)}
            />
            <div
              className="fixed bg-gray-700 rounded-lg shadow-lg z-[101] py-1 min-w-[100px]"
              style={{ top: menuPosition.top, right: menuPosition.right }}
            >
              <button
                onClick={() => {
                  onEdit(task)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
              <button
                onClick={() => {
                  onDelete(task.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AddTaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할일 추가..."
        className="flex-1 min-w-0 px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 flex-shrink-0"
      >
        추가
      </button>
    </form>
  )
}

function EditTaskModal({
  task,
  onClose,
  onUpdate,
  onDelete
}: {
  task: Task | null
  onClose: () => void
  onUpdate: (taskId: string, title: string, notes?: string, due?: string) => Promise<boolean>
  onDelete: (taskId: string) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [due, setDue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setNotes(task.notes || '')
      setDue(task.due ? format(task.due, 'yyyy-MM-dd') : '')
    }
  }, [task])

  if (!task) return null

  const handleUpdate = async () => {
    setIsSubmitting(true)
    const success = await onUpdate(task.id, title.trim(), notes || undefined, due || undefined)
    setIsSubmitting(false)
    if (success) onClose()
  }

  const handleDelete = async () => {
    if (!confirm('이 할일을 삭제하시겠습니까?')) return
    setIsSubmitting(true)
    const success = await onDelete(task.id)
    setIsSubmitting(false)
    if (success) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">할일 수정</h3>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할일 제목"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="메모 (선택)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />

          <div>
            <label className="block text-xs text-gray-400 mb-1">마감일 (선택)</label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-red-900 hover:text-red-300 disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={!title.trim() || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-emerald-700 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TasksCard({ accessToken, isSignedIn, onSignIn }: TasksCardProps) {
  const {
    tasks,
    taskLists,
    selectedListId,
    isLoading,
    error,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    selectList
  } = useGoogleTasks(accessToken)

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showListSelector, setShowListSelector] = useState(false)

  const handleAddTask = async (title: string) => {
    await addTask(title)
  }

  const handleToggle = async (taskId: string, completed: boolean) => {
    await toggleTask(taskId, completed)
  }

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const selectedList = taskLists.find(l => l.id === selectedListId)
  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          ✅ 할일
        </h2>
        <div className="text-center py-6">
          <button
            onClick={onSignIn}
            className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 연동
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading && tasks.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          ✅ 할일
        </h2>
        <div className="animate-pulse text-gray-400 text-center py-8">로딩 중...</div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          ✅ 할일
        </h2>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/tasks" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <span>✅</span>
              <span>할일</span>
            </h2>
            {incompleteTasks.length > 0 && (
              <span className="text-xs bg-emerald-700/50 text-emerald-300 px-1.5 py-0.5 rounded">
                {incompleteTasks.length}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* List selector */}
            {taskLists.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowListSelector(!showListSelector)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white text-xs sm:text-sm flex items-center gap-1"
                  title="목록 선택"
                >
                  <span className="max-w-[80px] truncate">{selectedList?.title || '목록'}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showListSelector && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowListSelector(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                      {taskLists.map(list => (
                        <button
                          key={list.id}
                          onClick={() => {
                            selectList(list.id)
                            setShowListSelector(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-600 ${
                            list.id === selectedListId ? 'text-emerald-400' : 'text-gray-200'
                          }`}
                        >
                          {list.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              onClick={refresh}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
              title="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Add Task */}
        <div className="mb-4">
          <AddTaskInput onAdd={handleAddTask} />
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>할일이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {/* Incomplete tasks */}
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={setEditingTask}
              />
            ))}

            {/* Completed tasks (collapsed) */}
            {completedTasks.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 py-1">
                  완료됨 ({completedTasks.length})
                </summary>
                <div className="mt-1 space-y-1">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={setEditingTask}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </>
  )
}
