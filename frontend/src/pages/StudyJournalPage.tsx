import { useState } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useStudyJournal } from '../hooks/useStudyJournal'
import { PageHeader } from '../components/PageHeader'
import type { StudyEntry } from '../hooks/useStudyJournal'

function EntryCard({
  entry,
  onSelect,
  onDelete
}: {
  entry: StudyEntry
  onSelect: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className="p-4 rounded-xl bg-gray-800 hover:bg-gray-750 transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-white truncate">{entry.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {entry.content || '(내용 없음)'}
          </p>
          <div className="text-xs text-gray-500 mt-2">{entry.createdAt}</div>
        </div>

        <div className="relative ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
              <div className="absolute right-0 top-full mt-1 py-1 bg-gray-700 rounded-lg shadow-lg z-50 min-w-[100px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
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
    </div>
  )
}

function AddEntryModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (title: string, content: string) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    const success = await onAdd(title.trim(), content)
    setIsSubmitting(false)
    if (success) {
      setTitle('')
      setContent('')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <h3 className="text-xl font-bold text-white mb-5">새 공부 기록</h3>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 배운 것, 느낀 점, 다음에 할 것 등을 자유롭게 적어보세요..."
            className="flex-1 min-h-[200px] w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
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
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function EntryDetailModal({
  entry,
  onClose,
  onDelete
}: {
  entry: StudyEntry | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  if (!entry) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{entry.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{entry.createdAt}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm('정말 삭제하시겠습니까?')) {
                  onDelete(entry.id)
                  onClose()
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-700 text-red-400 hover:text-red-300"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {entry.content || '(내용 없음)'}
          </p>
        </div>
      </div>
    </div>
  )
}

// kdi6033 GitHub 학습 자료
const STUDY_RESOURCES = [
  {
    name: 'arduino',
    title: 'ESP32 Physical AI PLC',
    description: 'ESP32 기반 Physical AI PLC with LVGL HMI 구현',
    topics: ['ESP32', 'LVGL', 'PLC', 'HMI', 'IoT'],
    url: 'https://github.com/kdi6033/arduino',
  },
  {
    name: 'plc',
    title: 'PLC Control Layer',
    description: '액츄에이터 제어를 위한 PLC 프로그래밍',
    topics: ['PLC', 'Actuator', 'Control'],
    url: 'https://github.com/kdi6033/plc',
  },
  {
    name: 'sensor',
    title: 'Sensor Integration',
    description: 'I2C/OneWire/Analog 센서 데이터 수집',
    topics: ['I2C', 'OneWire', 'Sensor', 'Data Collection'],
    url: 'https://github.com/kdi6033/sensor',
  },
  {
    name: 'node-red',
    title: 'Node-RED Dashboard',
    description: 'MQTT 기반 IoT 대시보드 구축',
    topics: ['Node-RED', 'MQTT', 'Dashboard', 'IoT'],
    url: 'https://github.com/kdi6033/node-red',
  },
  {
    name: 'Robot',
    title: 'Robot Kinematics',
    description: '로봇 운동학 및 제어 시스템',
    topics: ['Robotics', 'Kinematics', 'Control'],
    url: 'https://github.com/kdi6033/Robot',
  },
  {
    name: 'cloud',
    title: 'Cloud Integration',
    description: 'AWS/IBM Cloud IoT 연동',
    topics: ['AWS', 'IBM Cloud', 'IoT', 'Cloud'],
    url: 'https://github.com/kdi6033/cloud',
  },
]

function StudyResourceCard({ resource }: { resource: typeof STUDY_RESOURCES[0] }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
          {resource.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium group-hover:text-indigo-400 transition-colors flex items-center gap-2">
            {resource.title}
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </h4>
          <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {resource.topics.slice(0, 3).map(topic => (
              <span key={topic} className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  )
}

export function StudyJournalPage() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const {
    isLoading,
    error,
    isInitialized,
    entries,
    addEntry,
    deleteEntry,
    refresh,
    openDoc,
    openFolder
  } = useStudyJournal(accessToken)

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<StudyEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResources, setShowResources] = useState(true)

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.content && entry.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteEntry(id)
    }
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="📚" title="공부장" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-4">공부장</h2>
          <p className="text-gray-400 mb-6">학습 내용을 기록하고 성장을 추적하세요</p>
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
        <PageHeader icon="📚" title="공부장">
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
      <PageHeader icon="📚" title="공부장">
        <button onClick={openFolder} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="Drive 폴더 열기">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <button onClick={openDoc} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="문서 열기">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <button onClick={refresh} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="새로고침">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </PageHeader>

      {/* Navigation */}
      <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">새 기록</span>
            </button>
        </div>
      </div>

      {/* Study Resources Section */}
      <div className="bg-gray-800/50 rounded-xl mb-4 overflow-hidden">
        <button
          onClick={() => setShowResources(!showResources)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div className="text-left">
              <h3 className="text-white font-medium">공부할 것</h3>
              <p className="text-sm text-gray-500">Industrial IoT & Physical AI (kdi6033)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kdi6033"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="GitHub 프로필 보기"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showResources ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showResources && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {STUDY_RESOURCES.map(resource => (
                <StudyResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entries List */}
      <div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-800 rounded-xl">
            <div className="text-4xl mb-3">📝</div>
            <div>{searchQuery ? '검색 결과가 없습니다' : '공부 기록을 시작해보세요'}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onSelect={() => setSelectedEntry(entry)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">총 기록</span>
              <span className="text-white font-bold text-xl">{entries.length}개</span>
            </div>
          </div>
        )}
      </div>

      <AddEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addEntry}
      />

      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={deleteEntry}
      />
    </div>
  )
}
