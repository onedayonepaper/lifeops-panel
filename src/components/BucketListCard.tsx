import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBucketList } from '../hooks/useBucketList'
import type { BucketItem } from '../hooks/useBucketList'

interface BucketListCardProps {
  accessToken: string | null
  isSignedIn: boolean
  onSignIn: () => void
}

const STATUS_LABELS: Record<BucketItem['status'], { emoji: string; label: string; color: string }> = {
  todo: { emoji: '📋', label: '할 예정', color: 'bg-gray-600' },
  in_progress: { emoji: '🔥', label: '진행 중', color: 'bg-amber-600' },
  completed: { emoji: '✅', label: '달성!', color: 'bg-emerald-600' }
}

const CATEGORY_EMOJIS: Record<string, string> = {
  '여행': '✈️',
  '커리어': '💼',
  '건강': '💪',
  '학습': '📚',
  '경험': '🎯',
  '관계': '❤️',
  '재정': '💰',
  '기타': '📌'
}

export function BucketListCard({ accessToken, isSignedIn, onSignIn }: BucketListCardProps) {
  const {
    items,
    categories,
    isLoading,
    error,
    isInitialized,
    addItem,
    updateStatus,
    deleteItem,
    refresh
  } = useBucketList(accessToken)

  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('경험')
  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<'all' | BucketItem['status']>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setIsAdding(true)
    const success = await addItem({ title: newTitle.trim(), category: newCategory })
    if (success) {
      setNewTitle('')
      setShowAddForm(false)
    }
    setIsAdding(false)
  }

  const handleStatusChange = async (id: string, status: BucketItem['status']) => {
    await updateStatus(id, status)
    setMenuOpen(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteItem(id)
    }
    setMenuOpen(null)
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>🎯</span>
          <span>버킷리스트</span>
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
  if (isLoading || !isInitialized) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>🎯</span>
          <span>버킷리스트</span>
        </h2>
        <div className="text-center py-4">
          {error ? (
            <>
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <p className="text-gray-500 text-xs">권한 문제일 수 있습니다. 로그아웃 후 다시 로그인해주세요.</p>
            </>
          ) : (
            <div className="animate-pulse text-gray-400">로딩 중...</div>
          )}
        </div>
      </div>
    )
  }

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.status === filter)

  // Sort: in_progress first, then todo, then completed
  const sortedItems = [...filteredItems].sort((a, b) => {
    const order = { in_progress: 0, todo: 1, completed: 2 }
    return order[a.status] - order[b.status]
  })

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    inProgress: items.filter(i => i.status === 'in_progress').length
  }

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/bucket-list" className="hover:opacity-80 transition-opacity">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span>
            <span className="hidden sm:inline">버킷리스트</span>
            <span className="sm:hidden">버킷</span>
            {stats.total > 0 && (
              <span className="text-xs font-normal text-gray-400">
                ({stats.completed}/{stats.total})
              </span>
            )}
          </h2>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors ${
              showAddForm ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            }`}
            title="추가"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
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

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-3 p-3 rounded-lg bg-gray-700/50 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="죽기 전에 꼭 하고 싶은 것..."
            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_EMOJIS[cat]} {cat}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={isAdding || !newTitle.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {isAdding ? '추가 중...' : '추가'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {(['all', 'in_progress', 'todo', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {status === 'all' ? '전체' : STATUS_LABELS[status].label}
            {status === 'all' && ` (${stats.total})`}
            {status === 'in_progress' && ` (${stats.inProgress})`}
            {status === 'completed' && ` (${stats.completed})`}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {filter === 'all' ? '버킷리스트를 추가해보세요!' : '해당하는 항목이 없습니다'}
          </p>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className={`p-2 sm:p-3 rounded-lg bg-gray-700/50 flex items-center gap-2 ${
                item.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <span className="text-lg" title={item.category}>
                {CATEGORY_EMOJIS[item.category] || '📌'}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_LABELS[item.status].color}`}>
                    {STATUS_LABELS[item.status].emoji} {STATUS_LABELS[item.status].label}
                  </span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                  className="p-1 rounded hover:bg-gray-600 text-gray-400"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                  </svg>
                </button>
                {menuOpen === item.id && (
                  <div className="absolute right-0 top-full mt-1 py-1 bg-gray-700 rounded-lg shadow-lg z-50 min-w-[100px]">
                    {item.status !== 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'in_progress')}
                        className="w-full px-3 py-1.5 text-left text-sm text-amber-400 hover:bg-gray-600"
                      >
                        🔥 진행 중
                      </button>
                    )}
                    {item.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        className="w-full px-3 py-1.5 text-left text-sm text-emerald-400 hover:bg-gray-600"
                      >
                        ✅ 달성!
                      </button>
                    )}
                    {item.status !== 'todo' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'todo')}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-600"
                      >
                        📋 할 예정
                      </button>
                    )}
                    <hr className="my-1 border-gray-600" />
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-600"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>달성률</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
