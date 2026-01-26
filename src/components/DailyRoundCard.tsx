import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDailyRoundTasks } from '../hooks/useDailyRoundTasks'

export function DailyRoundCard() {
  const {
    rounds,
    isSyncing,
    lastSynced,
    error,
    isSignedIn,
    toggleItem,
    resetToday,
    syncWithGoogle
  } = useDailyRoundTasks()

  const [isExpanded, setIsExpanded] = useState(true)

  // Calculate progress
  const round1 = rounds.find(r => r.id === 'round-1')
  const round1Complete = round1?.items.every(item => item.checked) ?? false
  const round1Progress = round1 ? round1.items.filter(i => i.checked).length : 0
  const round1Total = round1?.items.length ?? 0

  const totalChecked = rounds.reduce((sum, r) => sum + r.items.filter(i => i.checked).length, 0)
  const totalItems = rounds.reduce((sum, r) => sum + r.items.length, 0)

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">
            {round1Complete ? '🏆' : '📋'}
          </span>
          <span className="text-lg font-bold text-white">오늘 카드</span>
          {round1Complete && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              오늘 성공!
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
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
            {totalChecked}/{totalItems}
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

      {/* Sync status indicator */}
      {isSignedIn && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
          <div className="text-xs text-blue-300 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Google Tasks 연동됨</span>
          </div>
          {lastSynced && (
            <span className="text-xs text-gray-500">
              {lastSynced.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Rules reminder */}
      <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="text-xs text-purple-300">
          <span className="font-medium">규칙:</span> 시계 금지, 타이머만, 라운드1만 끝나도 성공
        </div>
      </div>

      {/* Round 1 Progress (always visible) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>오늘 성공 기준 (라운드1)</span>
          <span className={round1Complete ? 'text-green-400' : ''}>{round1Progress}/{round1Total}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              round1Complete
                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${round1Total > 0 ? (round1Progress / round1Total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Rounds */}
      {isExpanded && (
        <div className="space-y-4">
          {rounds.map((round, roundIndex) => {
            const roundComplete = round.items.every(item => item.checked)
            const roundProgress = round.items.filter(i => i.checked).length

            return (
              <div
                key={round.id}
                className={`rounded-xl p-3 transition-all ${
                  round.isSuccess
                    ? roundComplete
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-blue-500/10 border border-blue-500/30'
                    : 'bg-gray-700/30'
                }`}
              >
                {/* Round Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{round.emoji}</span>
                    <span className={`font-medium ${
                      round.isSuccess ? 'text-blue-300' : 'text-gray-300'
                    }`}>
                      라운드 {roundIndex}) {round.title}
                    </span>
                    {roundComplete && (
                      <span className="text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {roundProgress}/{round.items.length}
                  </span>
                </div>

                {round.description && (
                  <div className={`text-xs mb-2 ${
                    round.isSuccess ? 'text-green-400/80' : 'text-gray-500'
                  }`}>
                    {round.description}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1.5">
                  {round.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        item.checked
                          ? 'bg-green-500/10'
                          : 'hover:bg-gray-700/50'
                      }`}
                    >
                      {/* 체크 버튼 */}
                      <button
                        onClick={() => toggleItem(round.id, item.id)}
                        className="flex items-start gap-2 flex-1 text-left"
                      >
                        <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                          item.checked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500'
                        }`}>
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            item.checked ? 'text-green-400 line-through opacity-70' : 'text-white'
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

                      {/* 시작하기 버튼 */}
                      {item.actionUrl && !item.checked && (
                        item.actionUrl.startsWith('http') ? (
                          <a
                            href={item.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{item.actionLabel || '시작'}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            to={item.actionUrl}
                            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{item.actionLabel || '시작'}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* Success message for round 1 */}
                {round.isSuccess && roundComplete && (
                  <div className="mt-3 p-2 bg-green-500/20 rounded-lg text-center">
                    <span className="text-green-400 text-sm font-medium">
                      오늘 끝! 여기서 쉬어도 됨
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* End section */}
          <div className="rounded-xl p-3 bg-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌙</span>
              <span className="font-medium text-gray-300">종료 (2분)</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>- 저장/커밋 확인</div>
              <div>- 내일 할 일 1줄만 적기</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
