import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyRoutineTasks } from '../hooks/useDailyRoutineTasks'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

export function DailyRoutineCard() {
  const {
    routines,
    isSyncing,
    isLoading,
    lastSynced,
    error,
    isSignedIn,
    signIn,
    toggleItem,
    resetToday,
    syncWithGoogle,
    togglingItemId
  } = useDailyRoutineTasks()

  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
  const { addBatchEvents } = useGoogleCalendar()

  // Calculate progress
  const todayRoutine = routines[0]
  const isComplete = todayRoutine?.items.every(item => item.checked) ?? false
  const checkedCount = todayRoutine ? todayRoutine.items.filter(i => i.checked).length : 0
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

  // 페이지에서 태스크 완료 이벤트 리스닝
  const handleTaskUpdated = useCallback(() => {
    // Google Tasks에서 다시 동기화
    syncWithGoogle()
  }, [syncWithGoogle])

  useEffect(() => {
    window.addEventListener('routineTaskUpdated', handleTaskUpdated)
    return () => window.removeEventListener('routineTaskUpdated', handleTaskUpdated)
  }, [handleTaskUpdated])

  // 항목 클릭 핸들러 - 항상 토글
  const handleItemClick = (roundId: string, itemId: string) => {
    toggleItem(roundId, itemId)
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
          <span className="text-xl">
            {isComplete ? '🏆' : '📋'}
          </span>
          <span className="text-lg font-bold text-white">오늘 카드</span>
          {isComplete && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              오늘 성공!
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
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
          {/* 동기화 상태 */}
          {isSignedIn && (
            <button
              onClick={syncWithGoogle}
              disabled={isSyncing}
              className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
                isSyncing ? 'text-blue-400 animate-pulse' : 'text-gray-400 hover:text-white'
              }`}
              title={lastSynced ? `마지막 동기화: ${lastSynced.toLocaleTimeString()}` : 'Google Tasks 동기화'}
            >
              <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <span className="text-xs text-gray-500">
            {checkedCount}/{totalItems}
          </span>
          <button
            onClick={resetToday}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="초기화"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
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

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-red-400">{error}</div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>오늘의 진행률</span>
          <span className={isComplete ? 'text-green-400' : ''}>{checkedCount}/{totalItems}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Routine */}
      {isExpanded && todayRoutine && (
        <div className="space-y-4">
          <div
            className={`rounded-xl p-3 transition-all ${
              isComplete
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-gray-700/30'
            }`}
          >
            {/* Routine Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{todayRoutine.emoji}</span>
                <span className="font-medium text-gray-300">
                  {todayRoutine.title}
                </span>
                {isComplete && (
                  <span className="text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {checkedCount}/{totalItems}
              </span>
            </div>

            {todayRoutine.description && (
              <div className="text-xs mb-2 text-gray-500">
                {todayRoutine.description}
              </div>
            )}

            {/* Items */}
            <div className="space-y-1.5">
              {todayRoutine.items.map(item => {
                const hasInternalPage = item.actionUrl && !item.actionUrl.startsWith('http')
                const hasExternalLink = item.actionUrl && item.actionUrl.startsWith('http')
                const isToggling = togglingItemId === item.id

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                      isToggling
                        ? 'bg-blue-500/10 opacity-70'
                        : item.checked
                          ? 'bg-green-500/10'
                          : 'hover:bg-gray-700/50'
                    }`}
                  >
                    {/* 항목 전체 클릭 영역 */}
                    <button
                      onClick={() => handleItemClick(todayRoutine.id, item.id)}
                      disabled={isToggling}
                      className={`flex items-start gap-2 flex-1 text-left ${isToggling ? 'cursor-wait' : ''}`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                        isToggling
                          ? 'border-blue-400 bg-blue-500/20'
                          : item.checked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500 hover:border-gray-400'
                      }`}>
                        {isToggling ? (
                          <svg className="w-3 h-3 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : item.checked ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          item.checked
                            ? 'text-green-400 line-through opacity-70'
                            : 'text-white'
                        }`}>
                          {item.label}
                        </div>
                        {item.detail && (
                          <div className={`text-xs mt-0.5 ${
                            item.checked ? 'text-gray-500 line-through' : 'text-gray-400'
                          }`}>
                            {item.detail}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* 내부 페이지 링크 버튼 - 체크 여부와 관계없이 항상 표시 */}
                    {hasInternalPage && (
                      <button
                        onClick={() => navigate(item.actionUrl!)}
                        className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                          item.checked
                            ? 'bg-green-500/20 text-white hover:bg-green-500/30'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
                        }`}
                      >
                        {item.actionLabel || '이동'}
                      </button>
                    )}

                    {/* 외부 링크 버튼 */}
                    {hasExternalLink && !item.checked && (
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
                  </div>
                )
              })}
            </div>

            {/* Success message */}
            {isComplete && (
              <div className="mt-3 p-2 bg-green-500/20 rounded-lg text-center">
                <span className="text-green-400 text-sm font-medium">
                  오늘 끝! 🎉
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
