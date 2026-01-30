import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { markTaskComplete } from '../utils/routineTaskUtils'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

interface ProjectRecord {
  id: string
  date: string
  projectName: string
  company: string
  problem: string
  action: string
  tech: string
  result: string
  metrics: string
  link: string
  screenshots: string
  demoVideo: string
  flowDiagram: string
  documentation: string
  isRepresentative: boolean
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

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

export default function ProjectInputPage() {
  const navigate = useNavigate()
  const {
    isSaving,
    error,
    isSignedIn,
    signIn,
    addItem
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
      await markTaskComplete('r1-3')
      clearForm()
      navigate('/portfolio')
    }
  }, [projectName, company, problem, action, tech, result, metrics, link, screenshots, demoVideo, flowDiagram, documentation, isRepresentative, todayKey, addItem, navigate])

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              ✏️ 프로젝트 입력
            </h1>
          </div>
          <Link
            to="/portfolio"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 프로젝트 관리
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ✏️ 프로젝트 입력
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            STAR 형식으로 프로젝트 기록
          </p>
        </div>
        <Link
          to="/portfolio"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← 프로젝트 관리
        </Link>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 프로젝트 입력 폼 */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
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
          <Link
            to="/portfolio"
            className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            취소
          </Link>
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
    </div>
  )
}
