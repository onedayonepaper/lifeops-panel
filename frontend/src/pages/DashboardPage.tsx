import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDayState } from '../hooks/useDayState'
import { useToast } from '../components/Toast'
import { requestNotificationPermission } from '../utils/notifications'
import { PageHeader } from '../components/PageHeader'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'
import { useDailyRoutineSheet } from '../hooks/useDailyRoutineSheet'
import { useTodayTasksSheet } from '../hooks/useTodayTasksSheet'
import { buildDashboardSummary } from '../hooks/useDashboardData'
import { api } from '../lib/api'

// AppliedCompany minimal type for dashboard
interface AppliedCompany {
  id: string
  companyName: string
  position: string
  appliedDate: string
  status: string
  deadline: string
  notes: string
  result: string
  url: string
  driveUrl: string
  schedule: string
}

const INITIAL_COMPANIES: AppliedCompany[] = [
  { id: '3', companyName: '라인정보통신', position: '나주혁신도시 한전KDN 웹 개발자', appliedDate: '2026-02-06', status: 'applied', deadline: '2026-03-14', notes: '', result: '', url: '', driveUrl: '', schedule: '' },
  { id: '2', companyName: '국가직 9급 전산개발', position: '전산직 / 전산개발 (75명)', appliedDate: '2026-02-05', status: 'applied', deadline: '2026-02-06', notes: '', result: '', url: '', driveUrl: '', schedule: '' },
  { id: '1', companyName: '현대오토에버', position: '[EnIT] Backend Developer', appliedDate: '2026-02-04', status: 'rejected', deadline: '', notes: '', result: '서류불합격', url: '', driveUrl: '', schedule: '' },
]

function rowToCompany(row: string[], headers: string[]): AppliedCompany {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => { record[header] = row[index] || '' })
  return {
    id: record.id || '', companyName: record.companyName || '', position: record.position || '',
    appliedDate: record.appliedDate || '', status: record.status || 'applied', deadline: record.deadline || '',
    notes: record.notes || '', result: record.result || '', url: record.url || '',
    driveUrl: record.driveUrl || '', schedule: record.schedule || ''
  }
}

function companyToRow(item: AppliedCompany): string[] {
  return [item.id, item.companyName, item.position, item.appliedDate, item.status, item.deadline, item.notes, item.result, item.url, item.driveUrl, item.schedule]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { error, clearError } = useDayState()
  const { showToast } = useToast()

  const [evalResult, setEvalResult] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('lifeops_eval_result')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [evalLoading, setEvalLoading] = useState(false)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Data hooks
  const { data: companiesFromSheet, isLoading: companiesLoading, isSignedIn } = useLifeOpsSheets<AppliedCompany>(
    SHEET_CONFIGS.appliedCompany, rowToCompany, companyToRow
  )
  const { stats: routineStats, todayLogs } = useDailyRoutineSheet()
  const { tasks, isLoading: tasksLoading, toggleTask, addTask, deleteAllTasks } = useTodayTasksSheet()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Merge companies
  const companies = useMemo(() => {
    if (!isSignedIn || companiesLoading) return INITIAL_COMPANIES
    if (companiesFromSheet.length === 0) return INITIAL_COMPANIES
    // ID 기준 중복 제거
    const seen = new Set<string>()
    return companiesFromSheet.filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }, [companiesFromSheet, companiesLoading, isSignedIn])

  // Build summary
  const summary = useMemo(() => buildDashboardSummary({
    appliedCompanies: companies,
    routineStats,
    tasks: tasks.map(t => ({ completed: t.completed })),
  }), [companies, routineStats, tasks])

  useEffect(() => {
    if (error) { showToast(error, 'error'); clearError() }
  }, [error, showToast, clearError])

  useEffect(() => { requestNotificationPermission() }, [])

  const handleGenerateReport = async () => {
    setIsGeneratingPdf(true)
    try {
      await api.downloadReportPdf(summary as unknown as Record<string, unknown>)
      showToast('보고서 PDF가 다운로드되었습니다', 'success')
    } catch {
      showToast('PDF 생성 실패', 'error')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleEvaluate = () => {
    if (evalLoading) return
    fetchEvaluation()
  }

  const fetchEvaluation = async () => {
    setEvalLoading(true)
    setEvalError(null)
    setEvalResult(null)
    try {
      const result = await api.evaluateStatus(summary as unknown as Record<string, unknown>)
      setEvalResult(result)
      localStorage.setItem('lifeops_eval_result', JSON.stringify(result))
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'AI 평가 요청 실패')
    } finally {
      setEvalLoading(false)
    }
  }

  const isLoading = companiesLoading || tasksLoading

  return (
    <div>
      <PageHeader icon="📊" title="대시보드">
        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingPdf}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {isGeneratingPdf ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              생성 중...
            </>
          ) : (
            <>📄 보고서</>
          )}
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 오늘의 시간표 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🕐</span>
              <span className="text-sm font-medium text-white">오늘의 시간표</span>
              <span className="text-[10px] text-gray-500 ml-1">05:00 기상 → 21:00 취침</span>
            </div>
            <div className="space-y-0.5">
              {(() => {
                const filtered = [...todayLogs]
                  .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                const exerciseLogs = filtered.filter(l => l.label.startsWith('(건강)'))
                const studyLogs = filtered.filter(l => l.label.startsWith('(스펙)'))
                const jobLogs = filtered.filter(l => l.label.startsWith('(취업)'))
                const bizLogs = filtered.filter(l => l.label.startsWith('(수익화)'))
                const groupEntries: { id: string; time: string; label: string; isGroup: boolean; completed: boolean; location?: string; sortTime: string }[] = []
                if (exerciseLogs.length > 0) {
                  groupEntries.push({ id: 'tt-exercise', time: exerciseLogs[0].time || '--:--', label: '💪 운동루틴', isGroup: true, completed: exerciseLogs.every(l => l.completed), sortTime: exerciseLogs[0].time || '' })
                }
                if (studyLogs.length > 0) {
                  groupEntries.push({ id: 'tt-study', time: studyLogs[0].time || '--:--', label: '📚 공부루틴', isGroup: true, completed: studyLogs.every(l => l.completed), sortTime: studyLogs[0].time || '' })
                }
                if (jobLogs.length > 0) {
                  groupEntries.push({ id: 'tt-job', time: jobLogs[0].time || '--:--', label: '💼 취업루틴', isGroup: true, completed: jobLogs.every(l => l.completed), sortTime: jobLogs[0].time || '' })
                }
                if (bizLogs.length > 0) {
                  groupEntries.push({ id: 'tt-biz', time: bizLogs[0].time || '--:--', label: '🛠️ 프로젝트루틴', isGroup: true, completed: bizLogs.every(l => l.completed), sortTime: bizLogs[0].time || '' })
                }
                const allEntries = [...groupEntries].sort((a, b) => a.sortTime.localeCompare(b.sortTime))
                return allEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                      entry.completed ? 'opacity-40' : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <span className={`font-mono w-[90px] flex-shrink-0 ${
                      entry.completed ? 'text-gray-600' : 'text-emerald-400'
                    }`}>
                      {entry.time}
                    </span>
                    <span className={`flex-1 truncate ${
                      entry.completed ? 'text-gray-600 line-through' : entry.isGroup ? 'text-orange-300' : 'text-gray-300'
                    }`}>
                      {entry.label}
                    </span>
                    {'location' in entry && entry.location && (
                      <span className={`text-[9px] px-1 py-0.5 rounded flex-shrink-0 ${
                        entry.location === '독서실' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {entry.location}
                      </span>
                    )}
                    {entry.completed && <span className="text-[10px]">✅</span>}
                  </div>
                ))
              })()}
              {(
                <>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-xs text-gray-500">
                    <span className="font-mono w-[90px] flex-shrink-0 text-yellow-500/60">20:30~21:00</span>
                    <span>🚿 샤워 + 취침 준비</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded text-xs text-gray-500">
                    <span className="font-mono w-[90px] flex-shrink-0 text-yellow-500/60">21:00~21:30</span>
                    <span>😴 취침</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 전체 루틴 */}
          <div className="bg-gray-800/50 rounded-xl p-3 mb-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📋</span>
              <span className="text-sm font-medium text-white">전체 루틴</span>
              {(() => {
                const done = todayLogs.filter(l => l.completed).length
                const pct = todayLogs.length > 0 ? Math.round((done / todayLogs.length) * 100) : 0
                return (
                  <>
                    <span className={`text-xs font-bold ml-1 ${
                      pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{pct}%</span>
                    <span className="text-[10px] text-gray-500">({done}/{todayLogs.length})</span>
                  </>
                )
              })()}
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
              {(() => {
                const done = todayLogs.filter(l => l.completed).length
                const pct = todayLogs.length > 0 ? Math.round((done / todayLogs.length) * 100) : 0
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

          {/* 운동 루틴 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💪</span>
              <span className="text-sm font-medium text-white">운동 루틴</span>
              <span className="text-[10px] text-gray-500">{todayLogs.filter(l => l.label.startsWith('(건강)')).length}개</span>
            </div>
            <div className="space-y-1">
              {todayLogs.filter(log => log.label.startsWith('(건강)')).map(log => (
                <div key={log.id} className="flex items-start gap-1.5 text-xs py-0.5">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <div>
                    <span className="text-gray-300">{log.label.replace('(건강) ', '')}</span>
                    {log.detail && <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{log.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 공부 루틴 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📚</span>
              <span className="text-sm font-medium text-white">공부 루틴</span>
              <span className="text-[10px] text-gray-500">{todayLogs.filter(l => l.label.startsWith('(스펙)')).length}개</span>
            </div>
            <div className="space-y-1">
              {todayLogs
                .filter(log => log.label.startsWith('(스펙)'))
                .map(log => (
                <div key={log.id} className="flex items-start gap-1.5 text-xs py-0.5">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <div>
                    <span className="text-gray-300">{log.label.replace('(스펙) ', '')}</span>
                    {log.detail && <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{log.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 취업 루틴 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💼</span>
              <span className="text-sm font-medium text-white">취업 루틴</span>
              <span className="text-[10px] text-gray-500">{todayLogs.filter(l => l.label.startsWith('(취업)')).length}개</span>
            </div>
            <div className="space-y-1">
              {todayLogs.filter(log => log.label.startsWith('(취업)')).map(log => (
                <div key={log.id} className="flex items-start gap-1.5 text-xs py-0.5">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <div>
                    <span className="text-gray-300">{log.label.replace('(취업) ', '')}</span>
                    {log.detail && <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{log.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 프로젝트 루틴 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛠️</span>
              <span className="text-sm font-medium text-white">프로젝트 루틴</span>
              <span className="text-[10px] text-gray-500">{todayLogs.filter(l => l.label.startsWith('(수익화)')).length}개</span>
            </div>
            <div className="space-y-1">
              {todayLogs.filter(log => log.label.startsWith('(수익화)')).map(log => (
                <div key={log.id} className="flex items-start gap-1.5 text-xs py-0.5">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <div>
                    <span className="text-gray-300">{log.label.replace('(수익화) ', '')}</span>
                    {log.detail && <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">{log.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          </div>
          {/* 전체 루틴 끝 */}

          {/* 오늘 할일 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/plan')}>
              <span className="text-lg">✅</span>
              <span className="text-sm font-medium text-white">오늘 할일</span>
              <span className="text-xs font-bold text-white ml-1">{summary.routine.taskCompleted}/{summary.routine.taskTotal}</span>
              {tasks.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAllTasks() }}
                  className="ml-auto text-[10px] text-gray-500 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                >
                  전체삭제
                </button>
              )}
              <span className="text-gray-500 text-xs">›</span>
            </div>
            {tasks.length > 0 && (
              <div className="space-y-1 mb-2">
                {tasks.map(task => (
                  <button key={task.id} onClick={() => toggleTask(task.id, !task.completed)} className="flex items-center gap-1.5 text-xs w-full text-left hover:opacity-80 transition-opacity">
                    <span className={task.completed ? 'text-green-400' : 'text-gray-600'}>{task.completed ? '✓' : '○'}</span>
                    <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-400'}>{task.title}</span>
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={async (e) => { e.preventDefault(); if (!newTaskTitle.trim()) return; await addTask(newTaskTitle.trim()); setNewTaskTitle('') }} className="flex gap-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="할일 추가..."
                className="flex-1 min-w-0 bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button type="submit" className="text-blue-400 text-xs px-1.5 hover:text-blue-300 flex-shrink-0">+</button>
            </form>
          </div>

          {/* 구직활동 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/applied-company')}>
              <span className="text-lg">📨</span>
              <span className="text-sm font-medium text-white">구직활동</span>
              <span className="text-gray-500 text-xs ml-auto">›</span>
            </div>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="text-white font-bold">{summary.jobSearch.totalApplied} 지원</span>
              <span className="text-purple-400">{summary.jobSearch.inProgress} 진행</span>
              <span className="text-green-400">{summary.jobSearch.offers} 합격</span>
              <span className="text-red-400">{summary.jobSearch.rejected} 불합격</span>
            </div>
            <div className="space-y-2">
              {companies.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-shrink-0">
                    {c.status === 'rejected' ? '❌' :
                     c.status === 'offer' ? '🎉' :
                     c.status === 'interview' ? '🗣️' : '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={c.status === 'rejected' ? 'text-gray-500 line-through' : 'text-gray-300'}>{c.companyName}</div>
                    <div className="text-[10px] text-gray-600 truncate">{c.position}</div>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                    c.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    c.status === 'offer' ? 'bg-green-500/20 text-green-400' :
                    c.status === 'interview' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {c.status === 'rejected' ? '불합격' :
                     c.status === 'offer' ? '합격' :
                     c.status === 'interview' ? '면접' : '지원'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 스펙/자격증 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/spec-schedule')}>
              <span className="text-lg">🎓</span>
              <span className="text-sm font-medium text-white">스펙/자격증</span>
              <span className="text-gray-500 text-xs ml-auto">›</span>
            </div>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="text-green-400 font-bold">{summary.spec.passed} 취득</span>
              <span className="text-blue-400">{summary.spec.registered} 접수</span>
              <span className="text-gray-400">{summary.spec.notStarted} 미시작</span>
            </div>
            <div className="space-y-1.5">
              {summary.spec.items.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0">
                    {item.status === 'passed' ? '✅' :
                     item.status === 'registered' ? '📝' :
                     item.status === 'studying' ? '📖' : '⬜'}
                  </span>
                  <span className={
                    item.status === 'passed' ? 'text-green-400' :
                    item.status === 'registered' ? 'text-blue-400' :
                    'text-gray-400'
                  }>
                    {item.name}
                  </span>
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                    item.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'registered' ? 'bg-blue-500/20 text-blue-400' :
                    item.status === 'studying' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {item.status === 'passed' ? '취득' :
                     item.status === 'registered' ? '접수' :
                     item.status === 'studying' ? '준비중' : '미시작'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 재테크 */}
          <div className="bg-gray-800 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/finance')}>
              <span className="text-lg">💰</span>
              <span className="text-sm font-medium text-white">재테크</span>
              <span className="text-gray-500 text-xs ml-auto">›</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-sm font-bold text-white">{summary.finance.netAsset}</div>
                <div className="text-xs text-gray-500">순자산</div>
              </div>
              <div>
                <div className="text-sm font-bold text-blue-400">{summary.finance.monthlySaving}</div>
                <div className="text-xs text-gray-500">월 저축</div>
              </div>
              <div>
                <div className="text-sm font-bold text-purple-400">{summary.finance.investmentRatio}</div>
                <div className="text-xs text-gray-500">투자 비중</div>
              </div>
            </div>
          </div>

          {/* AI 평가 섹션 */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-medium text-white">AI 평가</span>
              {!evalLoading && (
                <button
                  onClick={handleEvaluate}
                  className="ml-auto px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition-colors"
                >
                  {evalResult ? '다시 평가' : '평가하기'}
                </button>
              )}
            </div>

            {/* 로딩 */}
            {evalLoading && (
              <div className="text-center py-6 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400 text-xs">AI가 현재 상태를 분석 중...</p>
              </div>
            )}

            {/* 에러 */}
            {evalError && !evalLoading && (
              <div className="text-center py-4 space-y-2">
                <p className="text-red-400 text-sm">평가 실패</p>
                <p className="text-gray-500 text-xs">{evalError}</p>
              </div>
            )}

            {/* 평가 전 */}
            {!evalResult && !evalLoading && !evalError && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-xs">평가하기 버튼을 눌러 현재 상태를 분석하세요</p>
              </div>
            )}

            {/* 결과 */}
            {evalResult && !evalLoading && (
              <div className="space-y-3">
                {/* 종합 점수 */}
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${
                    evalResult.overallScore >= 80 ? 'text-green-400' :
                    evalResult.overallScore >= 60 ? 'text-yellow-400' :
                    evalResult.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {evalResult.overallScore}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">종합 점수 / 100</div>
                    <div className={`text-xs font-medium ${
                      evalResult.overallScore >= 80 ? 'text-green-400' :
                      evalResult.overallScore >= 60 ? 'text-yellow-400' :
                      evalResult.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {evalResult.overallScore >= 90 ? '우수' :
                       evalResult.overallScore >= 80 ? '양호' :
                       evalResult.overallScore >= 60 ? '보통' :
                       evalResult.overallScore >= 40 ? '개선 필요' : '위험'}
                    </div>
                  </div>
                </div>

                {/* 카테고리별 점수 */}
                <div className="space-y-2">
                  {evalResult.categories?.map((cat: any) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{cat.name}</span>
                        <span className={`font-bold ${
                          cat.score >= 80 ? 'text-green-400' :
                          cat.score >= 60 ? 'text-yellow-400' :
                          cat.score >= 40 ? 'text-orange-400' : 'text-red-400'
                        }`}>{cat.score}</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cat.score >= 80 ? 'bg-green-500' :
                            cat.score >= 60 ? 'bg-yellow-500' :
                            cat.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs">{cat.suggestion}</p>
                    </div>
                  ))}
                </div>

                {/* 강점 */}
                {evalResult.strengths?.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <h4 className="text-green-400 text-xs font-medium mb-1.5">강점</h4>
                    <ul className="space-y-0.5">
                      {evalResult.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                          <span className="text-green-400 flex-shrink-0">+</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 개선점 */}
                {evalResult.improvements?.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <h4 className="text-orange-400 text-xs font-medium mb-1.5">개선점</h4>
                    <ul className="space-y-0.5">
                      {evalResult.improvements.map((s: string, i: number) => (
                        <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                          <span className="text-orange-400 flex-shrink-0">!</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 액션 아이템 */}
                {evalResult.actionItems?.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-blue-400 text-xs font-medium mb-1.5">액션 아이템</h4>
                    <ul className="space-y-0.5">
                      {evalResult.actionItems.map((s: string, i: number) => (
                        <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                          <span className="text-blue-400 flex-shrink-0">{i + 1}.</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
