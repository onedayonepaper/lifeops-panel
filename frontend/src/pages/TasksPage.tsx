import { useState, useEffect, useRef } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleTasks, type Task } from '../hooks/useGoogleTasks'
import { PageHeader } from '../components/PageHeader'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

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
      className={`flex items-start gap-3 p-4 rounded-xl transition-all relative group ${
        task.completed ? 'opacity-50 bg-gray-800/50' : 'bg-gray-800 hover:bg-gray-750'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
          task.completed
            ? 'bg-emerald-700 border-emerald-500 text-white'
            : 'border-gray-500 hover:border-emerald-400'
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`block text-base ${
          task.completed ? 'text-gray-500 line-through' : 'text-white'
        }`}>
          {task.title}
        </span>
        {task.notes && (
          <p className={`text-sm mt-1 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
            {task.notes}
          </p>
        )}
        {task.due && (
          <span className={`text-xs mt-1 inline-block ${
            task.completed ? 'text-gray-600' : 'text-blue-400'
          }`}>
            📅 {format(task.due, 'M월 d일 (EEE)', { locale: ko })}
          </span>
        )}
      </div>

      <div className="relative">
        <button
          ref={menuButtonRef}
          onClick={handleMenuClick}
          className="p-2 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
              className="fixed bg-gray-700 rounded-lg shadow-lg z-[101] py-1 min-w-[120px]"
              style={{ top: menuPosition.top, right: menuPosition.right }}
            >
              <button
                onClick={() => {
                  onEdit(task)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
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
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
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

function AddTaskModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (title: string, notes?: string, due?: string) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [due, setDue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    const success = await onAdd(title.trim(), notes || undefined, due || undefined)
    setIsSubmitting(false)
    if (success) {
      setTitle('')
      setNotes('')
      setDue('')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-5">새 할일</h3>

        <div className="space-y-4">
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
            <label className="block text-sm text-gray-400 mb-2">마감일 (선택)</label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-emerald-700 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
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
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-5">할일 수정</h3>

        <div className="space-y-4">
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
            <label className="block text-sm text-gray-400 mb-2">마감일 (선택)</label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl bg-gray-700 text-red-400 font-medium hover:bg-red-900/50 disabled:opacity-50"
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

export function TasksPage() {
  const { isSignedIn, signIn } = useGoogleAuth()
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
  } = useGoogleTasks()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showListSelector, setShowListSelector] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const selectedList = taskLists.find(l => l.id === selectedListId)
  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  const filteredTasks = filter === 'all'
    ? tasks
    : filter === 'active'
      ? incompleteTasks
      : completedTasks

  const handleAddTask = async (title: string, notes?: string, due?: string) => {
    return await addTask(title, notes, due)
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="✅" title="할일" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">할일 관리</h2>
          <p className="text-gray-400 mb-6">Google Tasks와 연동하여 할일을 관리하세요</p>
          <button
            onClick={signIn}
            className="px-6 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium inline-flex items-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 연동
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading && tasks.length === 0) {
    return (
      <div>
        <PageHeader icon="✅" title="할일">
          <button onClick={refresh} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="새로고침">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </PageHeader>
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="animate-pulse text-gray-400">로딩 중...</div>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div>
        <PageHeader icon="✅" title="할일" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={refresh} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="✅" title="할일">
        <button onClick={refresh} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="새로고침">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </PageHeader>

      {/* Navigation */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* List Selector */}
            {taskLists.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowListSelector(!showListSelector)}
                  className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm flex items-center gap-2 hover:bg-gray-700"
                >
                  <span>{selectedList?.title || '목록'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showListSelector && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowListSelector(false)} />
                    <div className="absolute left-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[150px]">
                      {taskLists.map(list => (
                        <button
                          key={list.id}
                          onClick={() => {
                            selectList(list.id)
                            setShowListSelector(false)
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-600 ${
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

            {/* Filter Tabs */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              {(['all', 'active', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-emerald-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
                  {f === 'all' && ` (${tasks.length})`}
                  {f === 'active' && ` (${incompleteTasks.length})`}
                  {f === 'completed' && ` (${completedTasks.length})`}
                </button>
              ))}
            </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            추가
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-800 rounded-xl">
            <div className="text-4xl mb-3">📋</div>
            <div>{filter === 'all' ? '할일을 추가해보세요' : '해당하는 할일이 없습니다'}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={setEditingTask}
              />
            ))}
          </div>
        )}

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">진행률</span>
              <span className="text-white font-medium">
                {completedTasks.length} / {tasks.length} 완료
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  )
}
