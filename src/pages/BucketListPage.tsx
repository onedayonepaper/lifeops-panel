import { useState } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useBucketList } from '../hooks/useBucketList'
import { PageHeader } from '../components/PageHeader'
import type { BucketItem } from '../hooks/useBucketList'

const STATUS_LABELS: Record<BucketItem['status'], { emoji: string; label: string; color: string; bgColor: string }> = {
  todo: { emoji: '📋', label: '할 예정', color: 'text-gray-300', bgColor: 'bg-gray-600' },
  in_progress: { emoji: '🔥', label: '진행 중', color: 'text-amber-400', bgColor: 'bg-amber-600' },
  completed: { emoji: '✅', label: '달성!', color: 'text-emerald-400', bgColor: 'bg-emerald-600' }
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

function BucketItemCard({
  item,
  onStatusChange,
  onDelete
}: {
  item: BucketItem
  onStatusChange: (id: string, status: BucketItem['status']) => void
  onDelete: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={`p-4 rounded-xl transition-all ${
        item.status === 'completed' ? 'bg-gray-800/50 opacity-70' : 'bg-gray-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" title={item.category}>
          {CATEGORY_EMOJIS[item.category] || '📌'}
        </span>

        <div className="flex-1 min-w-0">
          <div className={`text-lg font-medium ${
            item.status === 'completed' ? 'line-through text-gray-400' : 'text-white'
          }`}>
            {item.title}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_LABELS[item.status].bgColor}`}>
              {STATUS_LABELS[item.status].emoji} {STATUS_LABELS[item.status].label}
            </span>
            <span className="text-xs text-gray-500">{item.category}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 py-1 bg-gray-700 rounded-lg shadow-lg z-50 min-w-[130px]">
                {item.status !== 'in_progress' && (
                  <button
                    onClick={() => {
                      onStatusChange(item.id, 'in_progress')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-gray-600 flex items-center gap-2"
                  >
                    🔥 진행 중
                  </button>
                )}
                {item.status !== 'completed' && (
                  <button
                    onClick={() => {
                      onStatusChange(item.id, 'completed')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-gray-600 flex items-center gap-2"
                  >
                    ✅ 달성!
                  </button>
                )}
                {item.status !== 'todo' && (
                  <button
                    onClick={() => {
                      onStatusChange(item.id, 'todo')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                  >
                    📋 할 예정
                  </button>
                )}
                <hr className="my-1 border-gray-600" />
                <button
                  onClick={() => {
                    onDelete(item.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
                >
                  🗑️ 삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AddItemModal({
  isOpen,
  onClose,
  onAdd,
  categories
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { title: string; category: string }) => Promise<boolean>
  categories: string[]
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('경험')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    const success = await onAdd({ title: title.trim(), category })
    setIsSubmitting(false)
    if (success) {
      setTitle('')
      setCategory('경험')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-5">버킷리스트 추가</h3>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="죽기 전에 꼭 하고 싶은 것..."
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <div>
            <label className="block text-sm text-gray-400 mb-2">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    category === cat
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-xl mb-1">{CATEGORY_EMOJIS[cat]}</div>
                  <div className="text-xs text-gray-300">{cat}</div>
                </button>
              ))}
            </div>
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
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function BucketListPage() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
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

  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | BucketItem['status']>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const filteredItems = items
    .filter(item => filter === 'all' || item.status === filter)
    .filter(item => !categoryFilter || item.category === categoryFilter)

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

  const handleStatusChange = async (id: string, status: BucketItem['status']) => {
    await updateStatus(id, status)
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteItem(id)
    }
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="🪣" title="버킷리스트" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-4">버킷리스트</h2>
          <p className="text-gray-400 mb-6">꿈꾸는 것들을 기록하고 하나씩 이뤄가세요</p>
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
  if (isLoading || !isInitialized) {
    return (
      <div>
        <PageHeader icon="🪣" title="버킷리스트">
          <button onClick={refresh} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="새로고침">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </PageHeader>
        <div className="max-w-2xl mx-auto mt-8 text-center">
          {error ? (
            <>
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-gray-500 text-sm">권한 문제일 수 있습니다.</p>
            </>
          ) : (
            <div className="animate-pulse text-gray-400">로딩 중...</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🪣" title="버킷리스트">
        <button onClick={refresh} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="새로고침">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </PageHeader>

      {/* Navigation */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
        {/* Status Filter */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex bg-gray-800 rounded-lg p-1">
              {(['all', 'in_progress', 'todo', 'completed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {status === 'all' ? '전체' : STATUS_LABELS[status].label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              추가
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                !categoryFilter
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
                  categoryFilter === cat
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {CATEGORY_EMOJIS[cat]} {cat}
              </button>
            ))}
        </div>
      </div>

      {/* Items List */}
      <div>
        {sortedItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-800 rounded-xl">
            <div className="text-4xl mb-3">🌟</div>
            <div>{items.length === 0 ? '버킷리스트를 추가해보세요' : '해당하는 항목이 없습니다'}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map(item => (
              <BucketItemCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {items.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">전체</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div>
                <div className="text-xs text-gray-400">진행 중</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
                <div className="text-xs text-gray-400">달성</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>달성률</span>
              <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
        categories={categories}
      />
    </div>
  )
}
