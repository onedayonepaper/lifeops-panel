import { useState, useEffect } from 'react'
import { useGoogleSheets } from '../hooks/useGoogleSheets'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface DailyLogCardProps {
  accessToken: string | null
  isSignedIn: boolean
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '😊', '😄']
const ENERGY_EMOJIS = ['😴', '🥱', '😌', '⚡', '🔥']

export function DailyLogCard({ accessToken, isSignedIn }: DailyLogCardProps) {
  const {
    entries,
    isLoading,
    error,
    isInitialized,
    initializeSheet,
    addEntry,
    getTodayEntry,
    refresh
  } = useGoogleSheets(accessToken)

  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Load today's entry
  useEffect(() => {
    const todayEntry = getTodayEntry()
    if (todayEntry) {
      setMood(todayEntry.mood)
      setEnergy(todayEntry.energy)
      setNote(todayEntry.note)
    }
  }, [entries, getTodayEntry])

  const handleSave = async () => {
    setIsSaving(true)
    await addEntry({ mood, energy, note })
    setIsSaving(false)
  }

  const handleInitialize = async () => {
    await initializeSheet()
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>📝</span>
          <span>일일 기록</span>
        </h2>
        <p className="text-gray-500 text-sm">Google 로그인이 필요합니다</p>
      </div>
    )
  }

  // Loading
  if (isLoading && !isInitialized) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>📝</span>
          <span>일일 기록</span>
        </h2>
        <div className="animate-pulse text-gray-400 text-center py-4">로딩 중...</div>
      </div>
    )
  }

  // Not initialized - need to create spreadsheet
  if (!isInitialized) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>📝</span>
          <span>일일 기록</span>
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-3">
            일일 기록을 저장할 스프레드시트를 생성합니다
          </p>
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? '생성 중...' : '시작하기'}
          </button>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>📝</span>
          <span>일일 기록</span>
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

  const todayEntry = getTodayEntry()
  const today = format(new Date(), 'M월 d일 EEEE', { locale: ko })

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>📝</span>
          <span className="hidden sm:inline">일일 기록</span>
          <span className="sm:hidden">기록</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors ${
              showHistory ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            }`}
            title="기록 보기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {showHistory ? (
        // History View
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">기록이 없습니다</p>
          ) : (
            entries.slice().reverse().slice(0, 7).map((entry) => (
              <div
                key={entry.date}
                className="p-2 sm:p-3 rounded-lg bg-gray-700/50 flex items-center gap-3"
              >
                <div className="text-xs sm:text-sm text-gray-400 w-20 flex-shrink-0">
                  {entry.date.slice(5).replace('-', '/')}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span title="기분">{MOOD_EMOJIS[entry.mood - 1]}</span>
                  <span title="에너지">{ENERGY_EMOJIS[entry.energy - 1]}</span>
                </div>
                <div className="text-sm text-gray-300 truncate flex-1">
                  {entry.note || '-'}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Today's Entry
        <div className="space-y-3">
          <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-between">
            <span>{today}</span>
            {todayEntry && (
              <span className="text-emerald-400 text-xs">저장됨</span>
            )}
          </div>

          {/* Mood */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">기분</div>
            <div className="flex gap-1 sm:gap-2">
              {MOOD_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMood(index + 1)}
                  className={`flex-1 py-2 sm:py-2.5 rounded-lg text-lg sm:text-xl transition-all ${
                    mood === index + 1
                      ? 'bg-blue-600 scale-110'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">에너지</div>
            <div className="flex gap-1 sm:gap-2">
              {ENERGY_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setEnergy(index + 1)}
                  className={`flex-1 py-2 sm:py-2.5 rounded-lg text-lg sm:text-xl transition-all ${
                    energy === index + 1
                      ? 'bg-emerald-600 scale-110'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">메모</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="오늘 하루 어땠나요?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {isSaving ? '저장 중...' : todayEntry ? '수정하기' : '저장하기'}
          </button>
        </div>
      )}
    </div>
  )
}
