import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSESheet } from '../hooks/useGSESheet'

interface GSECardProps {
  accessToken: string | null
  isSignedIn: boolean
  onSignIn: () => void
}

export function GSECard({ accessToken, isSignedIn, onSignIn }: GSECardProps) {
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
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
          <span>🎯</span>
          <span>GSE</span>
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
          <span>🎯</span>
          <span>GSE</span>
        </h2>
        <div className="text-center py-4">
          {error ? (
            <>
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <p className="text-gray-500 text-xs">권한 문제일 수 있습니다.</p>
            </>
          ) : (
            <div className="animate-pulse text-gray-400">로딩 중...</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/goals" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-lg">🎯</span>
          <span className="text-xs text-purple-400 font-medium">GOAL</span>
          {isSaving && (
            <span className="text-xs text-gray-500">저장 중...</span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="새로고침"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={openSheet}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="시트 열기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Goal */}
      <div className="mb-3">
        {editMode === 'goal' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateGoal()}
            />
            <button onClick={handleUpdateGoal} className="px-2 py-1 bg-purple-600 rounded text-xs text-white">저장</button>
          </div>
        ) : (
          <p
            onClick={() => { setEditMode('goal'); setEditValue(data.goal) }}
            className="text-white font-bold text-sm sm:text-base cursor-pointer hover:text-purple-300 transition-colors"
          >
            {data.goal}
          </p>
        )}
      </div>

      {/* 2 Week Goal */}
      <div className="mb-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="text-xs text-blue-400 mb-1">2주 목표</div>
        {editMode === 'twoWeek' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTwoWeekGoal()}
            />
            <button onClick={handleUpdateTwoWeekGoal} className="px-2 py-1 bg-blue-600 rounded text-xs text-white">저장</button>
          </div>
        ) : (
          <p
            onClick={() => { setEditMode('twoWeek'); setEditValue(data.twoWeekGoal) }}
            className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors"
          >
            {data.twoWeekGoal}
          </p>
        )}
      </div>

      {/* Milestone */}
      <div className="mb-3">
        {editMode === 'milestone' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateMilestone()}
            />
            <button onClick={handleUpdateMilestone} className="px-2 py-1 bg-gray-600 rounded text-xs text-white">저장</button>
          </div>
        ) : (
          <div
            onClick={() => { setEditMode('milestone'); setEditValue(data.milestone) }}
            className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
          >
            📅 {data.milestone}
          </div>
        )}
      </div>

      {/* Today's Routine */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-green-400 font-medium">오늘의 루틴</span>
          <span className="text-xs text-gray-500">{completedCount}/{totalCount}</span>
        </div>
        <div className="space-y-1">
          {data.routines.map(routine => (
            <button
              key={routine.id}
              onClick={() => toggleRoutine(routine.id)}
              disabled={isSaving}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                routine.completed
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              } ${isSaving ? 'opacity-50' : ''}`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                routine.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-500'
              }`}>
                {routine.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${routine.completed ? 'line-through opacity-70' : ''}`}>
                {routine.title}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div>
        <div className="text-xs text-orange-400 font-medium mb-2">지표</div>
        <div className="space-y-2">
          {data.indicators.map(indicator => (
            <div key={indicator.id} className="bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{indicator.title}</span>
                {editingIndicator === indicator.id ? (
                  <input
                    type="number"
                    value={indicator.progress}
                    onChange={(e) => handleIndicatorChange(indicator.id, parseInt(e.target.value) || 0)}
                    onBlur={() => setEditingIndicator(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingIndicator(null)}
                    className="w-12 px-1 py-0.5 rounded bg-gray-600 text-white text-xs text-center focus:outline-none"
                    autoFocus
                    min={0}
                    max={100}
                  />
                ) : (
                  <span
                    onClick={() => setEditingIndicator(indicator.id)}
                    className="text-xs text-orange-400 cursor-pointer hover:text-orange-300"
                  >
                    {indicator.progress}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${indicator.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{indicator.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-3 p-2 rounded-lg bg-red-900/30 text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
