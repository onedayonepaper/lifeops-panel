import { useState } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGSESheet } from '../hooks/useGSESheet'
import { PageHeader } from '../components/PageHeader'

export function GSEPage() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const {
    data,
    isLoading,
    isSaving,
    error,
    isInitialized,
    updateData,
    toggleRoutine,
    updateIndicator,
    refresh,
    openSheet
  } = useGSESheet(accessToken)

  const [editMode, setEditMode] = useState<'goal' | 'twoWeek' | 'milestone' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null)

  const handleUpdateGoal = async () => {
    if (editMode === 'goal' && editValue.trim()) {
      await updateData({ goal: editValue.trim() })
    }
    setEditMode(null)
    setEditValue('')
  }

  const handleUpdateTwoWeekGoal = async () => {
    if (editMode === 'twoWeek' && editValue.trim()) {
      await updateData({ twoWeekGoal: editValue.trim() })
    }
    setEditMode(null)
    setEditValue('')
  }

  const handleUpdateMilestone = async () => {
    if (editMode === 'milestone' && editValue.trim()) {
      await updateData({ milestone: editValue.trim() })
    }
    setEditMode(null)
    setEditValue('')
  }

  const handleIndicatorChange = async (id: string, progress: number) => {
    await updateIndicator(id, progress)
  }

  const completedCount = data.routines.filter(r => r.completed).length
  const totalCount = data.routines.length
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="🎯" title="Goal Tracker" />
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-4">Goal Tracker</h2>
          <p className="text-gray-400 mb-6">목표를 설정하고 매일 루틴을 실행하세요</p>
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
        <PageHeader icon="🎯" title="Goal Tracker">
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
      <PageHeader icon="🎯" title="Goal Tracker">
        <button onClick={openSheet} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="시트 열기">
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

      <div className="space-y-4">
        {/* Saving Indicator */}
        {isSaving && (
          <div className="fixed top-20 right-4 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            저장 중...
          </div>
        )}

        {/* Main Goal */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <span className="text-sm text-purple-400 font-medium uppercase tracking-wide">Main Goal</span>
          </div>
          {editMode === 'goal' ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateGoal()}
              />
              <button
                onClick={handleUpdateGoal}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium"
              >
                저장
              </button>
              <button
                onClick={() => { setEditMode(null); setEditValue('') }}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300"
              >
                취소
              </button>
            </div>
          ) : (
            <p
              onClick={() => { setEditMode('goal'); setEditValue(data.goal) }}
              className="text-white font-bold text-xl cursor-pointer hover:text-purple-300 transition-colors"
            >
              {data.goal}
            </p>
          )}
        </div>

        {/* 2 Week Goal */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📆</span>
            <span className="text-sm text-blue-400 font-medium">2주 목표</span>
          </div>
          {editMode === 'twoWeek' ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTwoWeekGoal()}
              />
              <button
                onClick={handleUpdateTwoWeekGoal}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium"
              >
                저장
              </button>
              <button
                onClick={() => { setEditMode(null); setEditValue('') }}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300"
              >
                취소
              </button>
            </div>
          ) : (
            <p
              onClick={() => { setEditMode('twoWeek'); setEditValue(data.twoWeekGoal) }}
              className="text-white text-lg cursor-pointer hover:text-blue-300 transition-colors"
            >
              {data.twoWeekGoal}
            </p>
          )}
        </div>

        {/* Milestone */}
        <div className="bg-gray-800 rounded-xl p-4">
          {editMode === 'milestone' ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateMilestone()}
              />
              <button
                onClick={handleUpdateMilestone}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm"
              >
                저장
              </button>
            </div>
          ) : (
            <div
              onClick={() => { setEditMode('milestone'); setEditValue(data.milestone) }}
              className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
            >
              <span>📅</span>
              <span>{data.milestone}</span>
            </div>
          )}
        </div>

        {/* Today's Routine */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="text-sm text-green-400 font-medium">오늘의 루틴</span>
            </div>
            <span className="text-sm text-gray-500">{completedCount}/{totalCount} 완료</span>
          </div>

          <div className="space-y-2">
            {data.routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => toggleRoutine(routine.id)}
                disabled={isSaving}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                  routine.completed
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                } ${isSaving ? 'opacity-50' : ''}`}
              >
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  routine.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500'
                }`}>
                  {routine.completed && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-base ${
                  routine.completed ? 'text-green-400 line-through opacity-70' : 'text-white'
                }`}>
                  {routine.title}
                </span>
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">진행률</span>
              <span className="text-green-400 font-medium">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <span className="text-sm text-orange-400 font-medium">핵심 지표</span>
          </div>

          <div className="space-y-4">
            {data.indicators.map(indicator => (
              <div key={indicator.id} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{indicator.title}</span>
                  {editingIndicator === indicator.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={indicator.progress}
                        onChange={(e) => handleIndicatorChange(indicator.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded bg-gray-600 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                        min={0}
                        max={100}
                        autoFocus
                      />
                      <span className="text-sm text-gray-400">%</span>
                      <button
                        onClick={() => setEditingIndicator(null)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        완료
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingIndicator(indicator.id)}
                      className="text-orange-400 font-medium hover:text-orange-300"
                    >
                      {indicator.progress}%
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${indicator.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  목표: {indicator.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-900/30 text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
