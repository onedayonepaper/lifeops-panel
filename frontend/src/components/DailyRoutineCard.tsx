import { useState } from 'react'
import { useDailyRoutineSheet } from '../hooks/useDailyRoutineSheet'
import type { RoutineLogItem } from '../hooks/useDailyRoutineSheet'

const SECTIONS = [
  { key: '건강', icon: '💪', title: '운동 루틴', prefix: '(건강) ' },
  { key: '스펙', icon: '📚', title: '공부 루틴', prefix: '(스펙) ' },
  { key: '취업', icon: '💼', title: '취업 루틴', prefix: '(취업) ' },
  { key: '수익화', icon: '🛠️', title: '프로젝트 루틴', prefix: '(수익화) ' },
] as const

function RoutineSection({
  icon,
  title,
  logs,
  prefix,
  toggleItem,
  isSaving,
}: {
  icon: string
  title: string
  logs: RoutineLogItem[]
  prefix: string
  toggleItem: (id: string) => void
  isSaving: boolean
}) {
  const completed = logs.filter(l => l.completed).length

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="text-[10px] text-gray-500">{completed}/{logs.length}</span>
      </div>
      <div className="space-y-1">
        {logs.map(log => (
          <div
            key={log.id}
            className={`group flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/50 transition-all ${
              log.completed ? 'opacity-50' : ''
            }`}
          >
            <button
              onClick={() => toggleItem(log.id)}
              disabled={isSaving}
              className={`w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                log.completed
                  ? 'bg-emerald-700 border-emerald-500 text-white'
                  : 'border-gray-500 hover:border-emerald-400'
              }`}
            >
              {log.completed && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-xs ${log.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                {log.label.replace(prefix, '')}
              </span>
              {log.detail && (
                <div className="text-[10px] text-gray-600 truncate mt-0.5">{log.detail}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DailyRoutineCard() {
  const {
    todayLogs,
    isLoading,
    isSaving,
    isSignedIn,
    signIn,
    toggleItem,
    resetToday,
    stats,
  } = useDailyRoutineSheet()

  const [isExpanded, setIsExpanded] = useState(true)

  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-bold text-white">오늘의 루틴</h2>
          <p className="text-gray-400 text-sm">Google Sheets와 연동하여 루틴을 관리하세요</p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">📋</div>
          <h2 className="text-xl font-bold text-white">오늘의 루틴</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 전체 루틴 헤더 */}
      <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">📋</span>
            <span className="text-sm font-medium text-white">전체 루틴</span>
          </button>
          {(() => {
            const pct = stats.percentage
            return (
              <>
                <span className={`text-xs font-bold ml-1 ${
                  pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>{pct}%</span>
                <span className="text-[10px] text-gray-500">({stats.completed}/{stats.total})</span>
              </>
            )
          })()}
          <button
            onClick={resetToday}
            className="ml-auto text-[10px] text-gray-500 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
          >
            초기화
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          {(() => {
            const pct = stats.percentage
            return (
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            )
          })()}
        </div>
      </div>

      {/* 카테고리별 섹션 */}
      {isExpanded && SECTIONS.map(section => {
        const logs = todayLogs.filter(l => l.label.startsWith(`(${section.key})`))
        if (logs.length === 0) return null
        return (
          <RoutineSection
            key={section.key}
            icon={section.icon}
            title={section.title}
            logs={logs}
            prefix={section.prefix}
            toggleItem={toggleItem}
            isSaving={isSaving}
          />
        )
      })}
    </div>
  )
}
