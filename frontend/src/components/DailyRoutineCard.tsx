import { useState } from 'react'
import { useDailyRoutineSheet } from '../hooks/useDailyRoutineSheet'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

export function DailyRoutineCard() {
  const {
    todayLogs,
    isLoading,
    isSaving,
    isSignedIn,
    signIn,
    toggleItem,
    addItem,
    removeItem,
    postponeItem,
    stats,
    spreadsheetUrl
  } = useDailyRoutineSheet()

  const { addBatchEvents } = useGoogleCalendar()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [copied, setCopied] = useState(false)

  // 데이터 복사
  const copyToClipboard = async () => {
    const text = todayLogs.map(log => `• ${log.label}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 루틴을 캘린더에 추가
  const addRoutineToCalendar = async () => {
    if (todayLogs.length === 0 || isAddingToCalendar) return

    setIsAddingToCalendar(true)

    const today = new Date().toISOString().split('T')[0]

    // 시간표 정의 (순서대로 1시간씩)
    const startHour = 9
    const batchEvents = todayLogs
      .filter(log => !log.completed)
      .map((log, index) => ({
        title: `🎯 ${log.label}`,
        startTime: `${String(startHour + index).padStart(2, '0')}:00`,
        endTime: `${String(startHour + index + 1).padStart(2, '0')}:00`,
      }))

    const result = await addBatchEvents(today, batchEvents)

    setIsAddingToCalendar(false)

    if (result.success > 0) {
      alert(`${result.success}개 루틴이 캘린더에 추가되었습니다!`)
    } else {
      alert('캘린더 추가에 실패했습니다.')
    }
  }

  // 로그인되지 않은 경우
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-bold text-white">오늘의 루틴</h2>
          <p className="text-gray-400 text-sm">
            Google Sheets와 연동하여 루틴을 관리하세요
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    )
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">📋</div>
          <h2 className="text-xl font-bold text-white">오늘의 루틴</h2>
          <p className="text-gray-400 text-sm">데이터를 불러오는 중...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">📋</span>
          <span className="text-lg font-bold text-white">오늘의 루틴</span>
          {stats.total > 0 && (
            <span className="text-sm font-normal text-gray-400">
              {stats.completed}/{stats.total}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {/* 항목 추가 */}
          <button
            onClick={() => setShowAddInput(!showAddInput)}
            className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
              showAddInput ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
            title="항목 추가"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {/* 복사 */}
          <button
            onClick={copyToClipboard}
            className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
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
          {/* 캘린더에 추가 */}
          <button
            onClick={addRoutineToCalendar}
            disabled={isAddingToCalendar}
            className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
              isAddingToCalendar ? 'text-green-400 animate-pulse' : 'text-gray-400 hover:text-white'
            }`}
            title="캘린더에 루틴 추가"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {/* 시트 열기 */}
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="시트 열기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Routine Items */}
      {isExpanded && (
        <div className="space-y-4">
          <div className="rounded-xl p-3 bg-gray-700/30">
            {/* 항목 추가 입력 */}
            {showAddInput && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newItemLabel.trim()) {
                      addItem(newItemLabel)
                      setNewItemLabel('')
                      setShowAddInput(false)
                    } else if (e.key === 'Escape') {
                      setShowAddInput(false)
                      setNewItemLabel('')
                    }
                  }}
                  placeholder="새 루틴 입력 (Enter로 추가)"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (newItemLabel.trim()) {
                      addItem(newItemLabel)
                      setNewItemLabel('')
                      setShowAddInput(false)
                    }
                  }}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
            )}

            {/* Items */}
            <div className="space-y-1.5">
              {todayLogs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  오늘의 루틴이 없습니다
                </p>
              ) : (
                todayLogs.map(log => (
                  <div
                    key={log.id}
                    className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-all ${
                      log.completed ? 'opacity-50' : ''
                    }`}
                  >
                    {/* 체크박스 */}
                    <button
                      onClick={() => toggleItem(log.id)}
                      disabled={isSaving}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        log.completed
                          ? 'bg-emerald-700 border-emerald-500 text-white'
                          : 'border-gray-500 hover:border-emerald-400'
                      }`}
                    >
                      {log.completed && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        log.completed ? 'text-gray-500 line-through' : 'text-white'
                      }`}>
                        {log.label}
                      </div>
                      {log.detail && (
                        <div className="text-xs text-gray-500 truncate">
                          {log.detail}
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼들 */}
                    {!log.completed && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* 내일로 미루기 */}
                        <button
                          onClick={() => postponeItem(log.id)}
                          disabled={isSaving}
                          className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                          title="내일로 미루기"
                        >
                          →내일
                        </button>
                        {/* 삭제 */}
                        <button
                          onClick={() => removeItem(log.routineId)}
                          disabled={isSaving}
                          className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                          title="삭제"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 진행률 표시 */}
          {stats.total > 0 && (
            <div className="px-1">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>진행률</span>
                <span>{stats.percentage}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
