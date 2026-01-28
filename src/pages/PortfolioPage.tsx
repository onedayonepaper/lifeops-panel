import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { markTaskComplete } from '../utils/roundTaskUtils'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

interface ProjectRecord {
  id: string
  date: string
  projectName: string
  company: string     // 회사명
  problem: string    // 문제
  action: string     // 내가 한 일
  tech: string       // 기술
  result: string     // 결과
  metrics: string    // 정량적 성과 (예: 75% 개선)
  link: string       // 프로젝트 링크
  screenshots: string // 데모 스크린샷 URL
  demoVideo: string   // 데모 영상 URL
  flowDiagram: string // 기능 흐름도 URL
  documentation: string // 상세 문서 URL
  isRepresentative: boolean // 대표 프로젝트 여부
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// Row <-> Object 변환 함수
function rowToRecord(row: string[]): ProjectRecord {
  return {
    id: row[0] || '',
    date: row[1] || '',
    projectName: row[2] || '',
    company: row[3] || '',
    problem: row[4] || '',
    action: row[5] || '',
    tech: row[6] || '',
    result: row[7] || '',
    metrics: row[8] || '',
    link: row[9] || '',
    screenshots: row[10] || '',
    demoVideo: row[11] || '',
    flowDiagram: row[12] || '',
    documentation: row[13] || '',
    isRepresentative: row[14] === 'true'
  }
}

function recordToRow(record: ProjectRecord): string[] {
  return [
    record.id,
    record.date,
    record.projectName,
    record.company,
    record.problem,
    record.action,
    record.tech,
    record.result,
    record.metrics,
    record.link,
    record.screenshots,
    record.demoVideo,
    record.flowDiagram,
    record.documentation,
    record.isRepresentative ? 'true' : 'false'
  ]
}

export default function PortfolioPage() {
  const {
    data: records,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    addItem,
    deleteItem,
    spreadsheetUrl
  } = useLifeOpsSheets<ProjectRecord>(
    SHEET_CONFIGS.portfolio,
    rowToRecord,
    recordToRow
  )

  const [projectName, setProjectName] = useState('')
  const [company, setCompany] = useState('')
  const [problem, setProblem] = useState('')
  const [action, setAction] = useState('')
  const [tech, setTech] = useState('')
  const [result, setResult] = useState('')
  const [metrics, setMetrics] = useState('')
  const [link, setLink] = useState('')
  const [screenshots, setScreenshots] = useState('')
  const [demoVideo, setDemoVideo] = useState('')
  const [flowDiagram, setFlowDiagram] = useState('')
  const [documentation, setDocumentation] = useState('')
  const [isRepresentative, setIsRepresentative] = useState(false)

  const todayKey = getTodayKey()

  // 대표 프로젝트만 필터링
  const representativeProjects = records.filter(r => r.isRepresentative)

  const clearForm = () => {
    setProjectName('')
    setCompany('')
    setProblem('')
    setAction('')
    setTech('')
    setResult('')
    setMetrics('')
    setLink('')
    setScreenshots('')
    setDemoVideo('')
    setFlowDiagram('')
    setDocumentation('')
    setIsRepresentative(false)
  }

  const handleSave = useCallback(async () => {
    if (!projectName.trim()) {
      alert('프로젝트명을 입력해주세요!')
      return
    }

    const newRecord: ProjectRecord = {
      id: crypto.randomUUID(),
      date: todayKey,
      projectName: projectName.trim(),
      company: company.trim(),
      problem: problem.trim(),
      action: action.trim(),
      tech: tech.trim(),
      result: result.trim(),
      metrics: metrics.trim(),
      link: link.trim(),
      screenshots: screenshots.trim(),
      demoVideo: demoVideo.trim(),
      flowDiagram: flowDiagram.trim(),
      documentation: documentation.trim(),
      isRepresentative
    }

    const success = await addItem(newRecord)

    if (success) {
      // 라운드 태스크 완료 처리
      await markTaskComplete('r1-3')
      // 폼 초기화
      clearForm()
    }
  }, [projectName, company, problem, action, tech, result, metrics, link, screenshots, demoVideo, flowDiagram, documentation, isRepresentative, todayKey, addItem])

  const handleCopy = useCallback((record: ProjectRecord) => {
    const text = `[${record.projectName}] ${record.company ? `@ ${record.company}` : ''}
- 문제: ${record.problem || '-'}
- 내가 한 일: ${record.action || '-'}
- 기술: ${record.tech || '-'}
- 결과: ${record.result || '-'}
- 정량적 성과: ${record.metrics || '-'}
- 링크: ${record.link || '-'}
- 스크린샷: ${record.screenshots || '-'}
- 데모영상: ${record.demoVideo || '-'}
- 흐름도: ${record.flowDiagram || '-'}
- 문서: ${record.documentation || '-'}`

    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
  }, [])

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              💼 포트폴리오 작업
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              목표: 실제 운영서비스 프로젝트
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 오늘 카드
          </Link>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Google 계정으로 로그인하여 프로젝트 기록을 저장하세요
          </p>
          <button
            onClick={signIn}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Google 로그인
          </button>
        </div>
      </div>
    )
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              💼 포트폴리오 작업
            </h1>
          </div>
          <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← 오늘 카드
          </Link>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            💼 포트폴리오 작업
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            목표: 실제 운영서비스 프로젝트
          </p>
        </div>
        <div className="flex items-center gap-2">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Google Sheets에서 보기"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
              </svg>
            </a>
          )}
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 오늘 카드
          </Link>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 대표 프로젝트 (증거 포함) */}
      {representativeProjects.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⭐</span> 대표 프로젝트 ({representativeProjects.length}개)
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">- 이력서 증거 자료</span>
          </h3>
          <div className="space-y-4">
            {representativeProjects.map(record => (
              <div
                key={record.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      {record.projectName}
                      {record.metrics && (
                        <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          📊 {record.metrics}
                        </span>
                      )}
                    </h4>
                    {record.company && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">@ {record.company}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(record)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    복사
                  </button>
                </div>

                {/* STAR 형식 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="font-semibold text-orange-600 dark:text-orange-400">문제 (Situation)</span>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{record.problem || '-'}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">내가 한 일 (Action)</span>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{record.action || '-'}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">기술 (Tech)</span>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{record.tech || '-'}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="font-semibold text-green-600 dark:text-green-400">결과 (Result)</span>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{record.result || '-'}</p>
                  </div>
                </div>

                {/* 증거 자료 링크 */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">📎 증거 자료</p>
                  <div className="flex flex-wrap gap-2">
                    {record.screenshots && (
                      <a
                        href={record.screenshots}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-sm hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                      >
                        🖼️ 스크린샷
                      </a>
                    )}
                    {record.flowDiagram && (
                      <a
                        href={record.flowDiagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        📊 흐름도
                      </a>
                    )}
                    {record.documentation && (
                      <a
                        href={record.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                      >
                        📄 문서
                      </a>
                    )}
                    {record.demoVideo && (
                      <a
                        href={record.demoVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        🎬 데모영상
                      </a>
                    )}
                    {record.link && (
                      <a
                        href={record.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        🔗 프로젝트 링크
                      </a>
                    )}
                    {!record.screenshots && !record.flowDiagram && !record.documentation && !record.demoVideo && !record.link && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 italic">증거 자료 없음 - 추가 필요!</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 포트폴리오 모음 */}
      {records.length > 0 && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>📁</span> 포트폴리오 모음
            <span className="text-sm font-normal text-gray-500">({records.length}개)</span>
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {records.map(record => (
              <div
                key={record.id}
                className={`p-4 rounded-xl border ${
                  record.date === todayKey
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {record.isRepresentative && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {record.projectName}
                    </span>
                    {record.company && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        @ {record.company}
                      </span>
                    )}
                    {record.metrics && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {record.metrics}
                      </span>
                    )}
                    {record.date === todayKey && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        오늘
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                      {record.date}
                    </span>
                    <button
                      onClick={() => handleCopy(record)}
                      className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      복사
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('이 기록을 삭제할까요?')) {
                          await deleteItem(record.id)
                        }
                      }}
                      className="text-xs px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-orange-500 dark:text-orange-400 flex-shrink-0">문제:</span>
                    <span className="text-gray-700 dark:text-gray-300">{record.problem || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">한 일:</span>
                    <span className="text-gray-700 dark:text-gray-300">{record.action || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-500 dark:text-purple-400 flex-shrink-0">기술:</span>
                    <span className="text-gray-700 dark:text-gray-300">{record.tech || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-500 dark:text-green-400 flex-shrink-0">결과:</span>
                    <span className="text-gray-700 dark:text-gray-300">{record.result || '-'}</span>
                  </div>
                  {record.link && (
                    <div className="flex gap-2 sm:col-span-2">
                      <span className="text-cyan-500 dark:text-cyan-400 flex-shrink-0">링크:</span>
                      <a
                        href={record.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-300 hover:underline truncate"
                      >
                        {record.link}
                      </a>
                    </div>
                  )}
                  {record.screenshots && (
                    <div className="flex gap-2 sm:col-span-2">
                      <span className="text-pink-500 dark:text-pink-400 flex-shrink-0">스크린샷:</span>
                      <a
                        href={record.screenshots}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 dark:text-pink-300 hover:underline truncate"
                      >
                        {record.screenshots}
                      </a>
                    </div>
                  )}
                  {record.demoVideo && (
                    <div className="flex gap-2 sm:col-span-2">
                      <span className="text-red-500 dark:text-red-400 flex-shrink-0">데모영상:</span>
                      <a
                        href={record.demoVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 dark:text-red-300 hover:underline truncate"
                      >
                        {record.demoVideo}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 포트폴리오 입력 */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>✏️</span> 포트폴리오 입력
        </h2>

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              프로젝트명 *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="예: SQL 튜닝으로 조회 성능 개선"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              회사명
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="예: 다온플레이스"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* 대표 프로젝트 체크 */}
        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <input
            type="checkbox"
            id="isRepresentative"
            checked={isRepresentative}
            onChange={(e) => setIsRepresentative(e.target.checked)}
            className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
          />
          <label htmlFor="isRepresentative" className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white">⭐ 대표 프로젝트로 지정</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">이력서에 증거 자료로 사용할 핵심 프로젝트</p>
          </label>
        </div>

        {/* STAR 형식 입력 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">📝 STAR 형식 (문제 → 행동 → 결과)</h3>

          <div>
            <label className="block text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
              문제/상황 (Situation)
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="어떤 문제/니즈가 있었나?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              내가 한 일 (Action)
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="구체적으로 뭘 했나? (기술적 접근 방식)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              기술 스택 (Tech)
            </label>
            <input
              type="text"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder="예: Oracle SQL, PHP, JavaScript"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                결과 (Result)
              </label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="어떤 성과/결과가 있었나?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                📊 정량적 성과 (중요!)
              </label>
              <input
                type="text"
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                placeholder="예: 응답시간 75% 개선, 오류 70% 감소"
                className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 rounded-lg
                  bg-emerald-50 dark:bg-emerald-900/20 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 증거 자료 (대표 프로젝트용) */}
        {isRepresentative && (
          <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">📎 증거 자료 (대표 프로젝트)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                  🖼️ 스크린샷 URL
                </label>
                <input
                  type="url"
                  value={screenshots}
                  onChange={(e) => setScreenshots(e.target.value)}
                  placeholder="익명화된 화면 캡처 URL"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                  📊 흐름도 URL
                </label>
                <input
                  type="url"
                  value={flowDiagram}
                  onChange={(e) => setFlowDiagram(e.target.value)}
                  placeholder="기능 흐름도/아키텍처 다이어그램"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-1">
                  📄 문서 URL
                </label>
                <input
                  type="url"
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  placeholder="상세 설명 문서 (Notion/GitHub)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  🎬 데모영상 URL
                </label>
                <input
                  type="url"
                  value={demoVideo}
                  onChange={(e) => setDemoVideo(e.target.value)}
                  placeholder="30초 데모 영상/GIF"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                🔗 프로젝트 링크
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="GitHub 저장소 또는 배포 URL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        )}

        {/* 일반 프로젝트용 링크 */}
        {!isRepresentative && (
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              🔗 프로젝트 링크 (선택)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="GitHub 저장소 또는 배포 URL"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex gap-2">
          {projectName && (
            <button
              onClick={clearForm}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              취소
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!projectName.trim() || isSaving}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !projectName.trim() || isSaving
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 외부 링크 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔗 바로가기</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://github.com/onedayonepaper"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-600"
          >
            GitHub 열기
          </a>
          <a
            href="https://github.com/onedayonepaper?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            내 저장소 목록
          </a>
        </div>
      </div>
    </div>
  )
}
