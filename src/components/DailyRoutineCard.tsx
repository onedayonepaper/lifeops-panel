import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyRoutineTasks } from '../hooks/useDailyRoutineTasks'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

export function DailyRoutineCard() {
  const {
    routines,
    isLoading,
    isSignedIn,
    signIn,
    addItem,
    removeItem,
  } = useDailyRoutineTasks()

  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const { addBatchEvents } = useGoogleCalendar()

  const todayRoutine = routines[0]
  const totalItems = todayRoutine?.items.length ?? 0

  // 루틴을 캘린더에 추가
  const addRoutineToCalendar = async () => {
    if (!todayRoutine || isAddingToCalendar) return

    setIsAddingToCalendar(true)

    const today = new Date().toISOString().split('T')[0]

    // 시간표 정의
    const scheduleMap: Record<string, { start: string; end: string }> = {
      'r0-2': { start: '09:00', end: '10:00' },      // 프로젝트 관리 (1시간)
      'r0-3': { start: '10:00', end: '11:00' },      // JLPT 공부 (1시간)
      'r0-4': { start: '11:00', end: '12:00' },      // 토익스피킹 (1시간)
      'r0-5': { start: '13:00', end: '14:00' },      // 취업루틴 (1시간, 점심 후)
    }

    const batchEvents = todayRoutine.items
      .filter(item => scheduleMap[item.id])
      .map(item => ({
        title: `🎯 ${item.label}`,
        startTime: scheduleMap[item.id].start,
        endTime: scheduleMap[item.id].end,
      }))

    const result = await addBatchEvents(today, batchEvents)

    setIsAddingToCalendar(false)

    if (result.success > 0) {
      alert(`${result.success}개 루틴이 캘린더에 추가되었습니다!`)
    } else {
      alert('캘린더 추가에 실패했습니다.')
    }
  }

  // 로그인되지 않은 경우 로그인 버튼 표시
  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-bold text-white">오늘 카드</h2>
          <p className="text-gray-400 text-sm">
            Google Tasks와 연동하여 오늘 할 일을 관리하세요
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
          <h2 className="text-xl font-bold text-white">오늘 카드</h2>
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
          <span className="text-lg font-bold text-white">오늘 카드</span>
        </button>
        <div className="flex items-center gap-2">
          {/* 항목 추가 */}
          {isSignedIn && (
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
          )}
          {/* 캘린더에 추가 */}
          {isSignedIn && (
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
          )}
          <span className="text-xs text-gray-500">{totalItems}개</span>
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

      {/* Routine */}
      {isExpanded && todayRoutine && (
        <div className="space-y-4">
          <div className="rounded-xl p-3 bg-gray-700/30">
            {/* Routine Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{todayRoutine.emoji}</span>
              <span className="font-medium text-gray-300">
                {todayRoutine.title}
              </span>
            </div>

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
                  placeholder="새 항목 입력 (Enter로 추가)"
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

            {/* Items - 단순 리스트 */}
            <div className="space-y-1.5">
              {todayRoutine.items.map(item => {
                const hasInternalPage = item.actionUrl && !item.actionUrl.startsWith('http')
                const hasExternalLink = item.actionUrl && item.actionUrl.startsWith('http')

                return (
                  <div
                    key={item.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                  >
                    <span className="text-blue-400">•</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        {item.label}
                      </div>
                      {item.detail && (
                        <div className="text-xs mt-0.5 text-gray-400">
                          {item.detail}
                        </div>
                      )}
                    </div>

                    {/* 내부 페이지 링크 버튼 */}
                    {hasInternalPage && (
                      <button
                        onClick={() => navigate(item.actionUrl!)}
                        className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-lg transition-colors bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white"
                      >
                        {item.actionLabel || '이동'}
                      </button>
                    )}

                    {/* 외부 링크 버튼 */}
                    {hasExternalLink && (
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>{item.actionLabel || '시작'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="삭제"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
