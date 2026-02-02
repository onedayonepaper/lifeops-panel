import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useLifeAnchors, type LifeAnchor } from '../hooks/useLifeAnchors'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

function AnchorItem({
  anchor,
  onUpdate,
  onRemove,
  isSyncing
}: {
  anchor: LifeAnchor
  onUpdate: (id: string, updates: Partial<Omit<LifeAnchor, 'id' | 'eventId'>>) => void
  onRemove: (id: string) => void
  isSyncing: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editSummary, setEditSummary] = useState(anchor.summary)
  const [editTime, setEditTime] = useState(anchor.time)
  const [editRecurrence, setEditRecurrence] = useState(anchor.recurrence)

  const handleSave = () => {
    onUpdate(anchor.id, {
      summary: editSummary,
      time: editTime,
      recurrence: editRecurrence
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditSummary(anchor.summary)
    setEditTime(anchor.time)
    setEditRecurrence(anchor.recurrence)
    setIsEditing(false)
  }

  const isCustom = anchor.id.startsWith('custom-')

  if (isEditing) {
    return (
      <div className="bg-gray-700 rounded-xl p-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">이름</label>
            <input
              type="text"
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="알림 이름"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">시간</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">반복</label>
              <select
                value={editRecurrence}
                onChange={(e) => setEditRecurrence(e.target.value as 'daily' | 'weekdays')}
                className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">매일</option>
                <option value="weekdays">평일만</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg bg-gray-600 text-gray-300 text-sm hover:bg-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!editSummary.trim() || isSyncing}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-xl p-4 transition-all ${!anchor.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Toggle */}
          <button
            onClick={() => onUpdate(anchor.id, { enabled: !anchor.enabled })}
            disabled={isSyncing}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              anchor.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              anchor.enabled ? 'left-6' : 'left-0.5'
            }`} />
          </button>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{anchor.summary}</span>
              {anchor.eventId && (
                <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                  연동됨
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span className="font-mono">{anchor.time}</span>
              <span className="text-gray-600">|</span>
              <span>{anchor.recurrence === 'daily' ? '매일' : '평일'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isSyncing}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50"
            title="수정"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {isCustom && (
            <button
              onClick={() => onRemove(anchor.id)}
              disabled={isSyncing}
              className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 disabled:opacity-50"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddAnchorForm({ onAdd }: { onAdd: (summary: string, time: string) => void }) {
  const [summary, setSummary] = useState('')
  const [time, setTime] = useState('12:00')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (summary.trim()) {
      onAdd(summary.trim(), time)
      setSummary('')
      setTime('12:00')
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        새 앵커 추가
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4">
      <div className="space-y-3">
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="앵커 이름 (예: 약 먹기)"
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!summary.trim()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>
    </form>
  )
}

export function LifeAnchorsPage() {
  const { signIn, isSignedIn } = useGoogleAuth()
  const {
    anchors,
    isSyncing,
    error,
    syncWithCalendar,
    updateAnchor,
    addAnchor,
    removeAnchor,
    resetToDefaults
  } = useLifeAnchors()

  const syncedCount = anchors.filter(a => a.eventId && a.enabled).length
  const enabledCount = anchors.filter(a => a.enabled).length

  return (
    <div>
      <PageHeader icon="🔔" title="반복 일정">
        {isSignedIn && (
          <>
            <button
              onClick={syncWithCalendar}
              disabled={isSyncing}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"
              title="캘린더 동기화"
            >
              <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm('기본값으로 초기화할까요? 캘린더의 기존 반복 일정도 삭제됩니다.')) {
                  resetToDefaults()
                }
              }}
              disabled={isSyncing}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"
              title="기본값 초기화"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </PageHeader>

      <div className="max-w-2xl mx-auto px-4">
        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-blue-300 mb-1">반복 일정이란?</h3>
              <p className="text-sm text-gray-400">
                시간표 대신 하루의 리듬을 잡아주는 핵심 알림입니다.
                기상, 물, 건강기능식품, 취침 준비 등 매일 반복되는 생활 알림을 Google Calendar에 등록합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Required */}
        {!isSignedIn && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Google Calendar와 연동하여 반복 알림을 설정하세요.</p>
            <button
              onClick={signIn}
              className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium inline-flex items-center gap-2"
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
        )}

        {/* Signed In Content */}
        {isSignedIn && (
          <>
            {/* Status */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">동기화 상태</span>
                {isSyncing && (
                  <span className="text-xs text-blue-400 animate-pulse">동기화 중...</span>
                )}
              </div>
              <div className="text-sm">
                <span className="text-green-400">{syncedCount}</span>
                <span className="text-gray-500">/{enabledCount} 연동됨</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Sync Button (prominent) */}
            {syncedCount < enabledCount && (
              <button
                onClick={syncWithCalendar}
                disabled={isSyncing}
                className="w-full mb-4 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? '동기화 중...' : 'Google Calendar에 동기화'}
              </button>
            )}

            {/* Anchors List */}
            <div className="space-y-3 mb-6">
              {anchors.map(anchor => (
                <AnchorItem
                  key={anchor.id}
                  anchor={anchor}
                  onUpdate={updateAnchor}
                  onRemove={removeAnchor}
                  isSyncing={isSyncing}
                />
              ))}
            </div>

            {/* Add New */}
            <AddAnchorForm onAdd={addAnchor} />

            {/* Help */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-300 mb-2">사용법</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 토글로 알림을 켜고 끌 수 있습니다.</li>
                <li>• 연필 아이콘으로 시간과 반복 주기를 수정합니다.</li>
                <li>• 수정 후 자동으로 캘린더에 반영됩니다.</li>
                <li>• "동기화" 버튼으로 캘린더와 상태를 맞춥니다.</li>
                <li>• 반복 일정은 한 번만 생성되고, 이후 수정만 됩니다.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
