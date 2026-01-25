import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStudyJournal } from '../hooks/useStudyJournal'
import type { StudyEntry } from '../hooks/useStudyJournal'

interface StudyJournalCardProps {
  accessToken: string | null
  isSignedIn: boolean
  onSignIn: () => void
}

export function StudyJournalCard({ accessToken, isSignedIn, onSignIn }: StudyJournalCardProps) {
  const {
    isLoading,
    isSaving,
    error,
    isInitialized,
    entries,
    addEntry,
    deleteEntry,
    refresh,
    openDoc,
    openFolder
  } = useStudyJournal(accessToken)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<StudyEntry | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) return
    const success = await addEntry(title, content)
    if (success) {
      setTitle('')
      setContent('')
      setShowForm(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteEntry(id)
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
    }
    setMenuOpen(null)
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>📚</span>
          <span>공부장</span>
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
          <span>📚</span>
          <span>공부장</span>
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

  // Detail View Modal
  if (selectedEntry) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setSelectedEntry(null)}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">목록</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDelete(selectedEntry.id)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-red-400 hover:text-red-300 transition-colors"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Entry Detail */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white">{selectedEntry.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{selectedEntry.createdAt}</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selectedEntry.content || '(내용 없음)'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/study-journal" className="hover:opacity-80 transition-opacity">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>📚</span>
            <span className="hidden sm:inline">공부장</span>
            <span className="sm:hidden">공부</span>
            {entries.length > 0 && (
              <span className="text-xs font-normal text-gray-400">
                ({entries.length})
              </span>
            )}
          </h2>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              showForm ? 'text-indigo-400 bg-gray-700' : 'hover:bg-gray-700 text-gray-400 hover:text-white'
            }`}
            title="새 글 작성"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={refresh}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="새로고침"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={openFolder}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Drive 폴더 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button
            onClick={openDoc}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="문서 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-900/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      {showForm && (
        <div className="mb-3 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 자유롭게 적어보세요..."
            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false)
                setTitle('')
                setContent('')
              }}
              className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>저장 중...</span>
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {showForm ? '' : '+ 버튼을 눌러 공부 기록을 시작하세요'}
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <button
                onClick={() => setSelectedEntry(entry)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-sm text-white truncate">{entry.title}</div>
                <div className="text-xs text-gray-500">{entry.createdAt}</div>
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(menuOpen === entry.id ? null : entry.id)
                  }}
                  className="p-1 rounded hover:bg-gray-600 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                  </svg>
                </button>
                {menuOpen === entry.id && (
                  <div className="absolute right-0 top-full mt-1 py-1 bg-gray-700 rounded-lg shadow-lg z-50 min-w-[80px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry.id)
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-gray-600"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
