import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

type WeakPointCategory = 'language' | 'certification' | 'tech' | 'etc'
type WeakPointStatus = 'not_started' | 'studying' | 'acquired'

interface WeakPoint {
  id: string
  name: string
  category: WeakPointCategory
  currentLevel: string
  targetLevel: string
  status: WeakPointStatus
  notes: string
  acquiredDate: string
}

const CATEGORY_CONFIG: Record<WeakPointCategory, { label: string; icon: string }> = {
  language: { label: '어학', icon: '🌐' },
  certification: { label: '자격증', icon: '📜' },
  tech: { label: '기술', icon: '💻' },
  etc: { label: '기타', icon: '📌' },
}

const STATUS_CONFIG: Record<WeakPointStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: '미시작', color: 'text-gray-400', bgColor: 'bg-gray-600/30' },
  studying: { label: '학습중', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  acquired: { label: '취득', color: 'text-green-400', bgColor: 'bg-green-500/20' },
}

const INITIAL_DATA: WeakPoint[] = [
  {
    id: '1',
    name: '한국사',
    category: 'certification',
    currentLevel: '',
    targetLevel: '3급',
    status: 'not_started',
    notes: '',
    acquiredDate: ''
  },
  {
    id: '2',
    name: '토익스피킹',
    category: 'language',
    currentLevel: '',
    targetLevel: 'IM',
    status: 'not_started',
    notes: '',
    acquiredDate: ''
  },
  {
    id: '3',
    name: '오픽',
    category: 'language',
    currentLevel: '',
    targetLevel: 'IM',
    status: 'not_started',
    notes: '',
    acquiredDate: ''
  },
  {
    id: '4',
    name: '정보처리기사',
    category: 'certification',
    currentLevel: '',
    targetLevel: '취득',
    status: 'not_started',
    notes: '대부분 기업/공공기관 우대 또는 필수',
    acquiredDate: ''
  },
  {
    id: '5',
    name: 'SQLD',
    category: 'certification',
    currentLevel: '',
    targetLevel: '취득',
    status: 'not_started',
    notes: 'DB 관련 포지션 우대',
    acquiredDate: ''
  },
  {
    id: '6',
    name: 'TOEIC',
    category: 'language',
    currentLevel: '',
    targetLevel: '800+',
    status: 'not_started',
    notes: '스피킹/오픽과 별도로 점수 요구하는 곳 많음',
    acquiredDate: ''
  },
  {
    id: '7',
    name: 'JLPT',
    category: 'language',
    currentLevel: '',
    targetLevel: 'N2',
    status: 'not_started',
    notes: '일본 취업 목표',
    acquiredDate: ''
  },
  {
    id: '8',
    name: '코딩테스트',
    category: 'tech',
    currentLevel: '',
    targetLevel: '백준 골드 이상',
    status: 'not_started',
    notes: '프로그래머스/백준',
    acquiredDate: ''
  },
  {
    id: '9',
    name: 'CS 기초',
    category: 'tech',
    currentLevel: '',
    targetLevel: '면접 대비 완료',
    status: 'not_started',
    notes: 'OS, 네트워크, 자료구조/알고리즘',
    acquiredDate: ''
  },
]

function rowToWeakPoint(row: string[], headers: string[]): WeakPoint {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => {
    record[header] = row[index] || ''
  })
  return {
    id: record.id || Date.now().toString(),
    name: record.name || '',
    category: (record.category as WeakPointCategory) || 'etc',
    currentLevel: record.currentLevel || '',
    targetLevel: record.targetLevel || '',
    status: (record.status as WeakPointStatus) || 'not_started',
    notes: record.notes || '',
    acquiredDate: record.acquiredDate || ''
  }
}

function weakPointToRow(item: WeakPoint): string[] {
  return [
    item.id,
    item.name,
    item.category,
    item.currentLevel,
    item.targetLevel,
    item.status,
    item.notes,
    item.acquiredDate
  ]
}

export default function WeakPointsPage() {
  const {
    data: dataFromSheet,
    isLoading,
    isSaving,
    isSignedIn,
    signIn,
    addItem,
    updateItem,
    deleteItem,
    spreadsheetUrl
  } = useLifeOpsSheets<WeakPoint>(
    SHEET_CONFIGS.weakPoints,
    rowToWeakPoint,
    weakPointToRow
  )

  const [items, setItems] = useState<WeakPoint[]>(INITIAL_DATA)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<WeakPointCategory | 'all'>('all')
  const [formData, setFormData] = useState({
    name: '',
    category: 'etc' as WeakPointCategory,
    currentLevel: '',
    targetLevel: '',
    notes: ''
  })

  useEffect(() => {
    if (!isLoading && isSignedIn && !isInitialized) {
      const existingIds = new Set(dataFromSheet.map(d => d.id))
      const missing = INITIAL_DATA.filter(d => !existingIds.has(d.id))

      if (missing.length > 0) {
        const saveMissing = async () => {
          for (const item of missing) {
            await addItem(item)
          }
        }
        saveMissing()
      }

      setItems([...dataFromSheet, ...missing])
      setIsInitialized(true)
    }
  }, [isLoading, dataFromSheet, isSignedIn, isInitialized, addItem])

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    const newItem: WeakPoint = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      category: formData.category,
      currentLevel: formData.currentLevel.trim(),
      targetLevel: formData.targetLevel.trim(),
      status: 'not_started',
      notes: formData.notes.trim(),
      acquiredDate: ''
    }

    const success = await addItem(newItem)
    if (success) {
      setItems(prev => [newItem, ...prev])
      setFormData({ name: '', category: 'etc', currentLevel: '', targetLevel: '', notes: '' })
      setShowForm(false)
    }
  }

  const handleStatusChange = async (id: string, status: WeakPointStatus) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const updated = {
      ...item,
      status,
      acquiredDate: status === 'acquired' ? new Date().toISOString().split('T')[0] : item.acquiredDate
    }
    setItems(prev => prev.map(i => i.id === id ? updated : i))
    await updateItem(id, updated)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id)
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const filteredItems = items.filter(i => {
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false
    return true
  })

  const needsImprovement = items.filter(i => i.status !== 'acquired' || (i.currentLevel && i.targetLevel && i.currentLevel !== i.targetLevel))

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">💪</div>
          <h1 className="text-2xl font-bold text-white">부족한점</h1>
          <p className="text-gray-400">
            자격, 어학, 기술 등 현재 수준과 목표를 추적하여 부족한 역량을 파악합니다.
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
          <Link to="/" className="block text-gray-500 hover:text-gray-400 text-sm">
            &larr; 메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="💪" title="부족한점">
        {spreadsheetUrl && (
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-green-400 transition-colors"
            title="Google Sheets에서 보기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
            </svg>
          </a>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="항목 추가"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 bg-gray-800 rounded-xl px-4 py-2">
        <span className="text-lg">📊</span>
        <div className="flex gap-4 text-sm">
          <span className="text-white"><span className="font-bold">{items.length}</span> 전체</span>
          <span className="text-yellow-400"><span className="font-bold">{items.filter(i => i.status === 'studying').length}</span> 학습중</span>
          <span className="text-green-400"><span className="font-bold">{items.filter(i => i.status === 'acquired').length}</span> 취득</span>
          <span className="text-orange-400"><span className="font-bold">{needsImprovement.length}</span> 개선필요</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          전체 {items.length}
        </button>
        {(Object.entries(CATEGORY_CONFIG) as [WeakPointCategory, { label: string; icon: string }][]).map(([key, config]) => {
          const count = items.filter(i => i.category === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {config.icon} {config.label} {count}
            </button>
          )
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-4 bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="이름 (예: 토익스피킹) *"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as WeakPointCategory }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="현재 등급/점수 (예: IM, 3급)"
              value={formData.currentLevel}
              onChange={e => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="목표 등급/점수 (예: AL, 1급)"
              value={formData.targetLevel}
              onChange={e => setFormData(prev => ({ ...prev, targetLevel: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="메모"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.name.trim() || isSaving}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '저장 중...' : '추가'}
            </button>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && !showForm && (
        <div className="mb-4 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm text-center">
          저장 중...
        </div>
      )}

      {/* List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            항목이 없습니다. + 버튼으로 추가해보세요.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredItems.map(item => {
              const categoryConfig = CATEGORY_CONFIG[item.category]
              const statusConfig = STATUS_CONFIG[item.status]
              const hasGap = item.currentLevel && item.targetLevel && item.currentLevel !== item.targetLevel

              return (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700/50 transition-colors">
                  {/* Category icon */}
                  <span className="text-lg flex-shrink-0 w-7">{categoryConfig.icon}</span>

                  {/* Name & levels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{item.name}</span>
                      <span className="text-xs text-gray-500">{categoryConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {item.currentLevel && (
                        <span className={hasGap ? 'text-orange-400' : 'text-green-400'}>
                          {item.currentLevel}
                        </span>
                      )}
                      {item.targetLevel && (
                        <>
                          <span className="text-gray-600">&rarr;</span>
                          <span className="text-blue-400">{item.targetLevel}</span>
                        </>
                      )}
                      {item.notes && <span className="text-gray-500 ml-1 truncate">{item.notes}</span>}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>

                  {/* Status actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {item.status === 'not_started' && (
                      <button onClick={() => handleStatusChange(item.id, 'studying')} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded" title="학습 시작">&#9654;</button>
                    )}
                    {item.status === 'studying' && (
                      <>
                        <button onClick={() => handleStatusChange(item.id, 'acquired')} className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="취득 완료">&#10003;</button>
                        <button onClick={() => handleStatusChange(item.id, 'not_started')} className="p-1 text-gray-400 hover:bg-gray-600 rounded" title="리셋">&#8634;</button>
                      </>
                    )}
                    {item.status === 'acquired' && (
                      <button onClick={() => handleStatusChange(item.id, 'studying')} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded" title="재학습">&#8634;</button>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded flex-shrink-0"
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary by category */}
      <div className="mt-4 bg-gray-800 rounded-xl p-3">
        <div className="flex gap-1 overflow-x-auto">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = items.filter(i => i.status === status).length
            return (
              <div key={status} className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${config.bgColor} text-center min-w-16`}>
                <div className={`text-lg font-bold ${config.color}`}>{count}</div>
                <div className="text-xs text-gray-400">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
