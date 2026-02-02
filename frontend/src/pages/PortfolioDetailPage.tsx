import { useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: records,
    isLoading,
    error,
    isSignedIn,
    signIn,
    deleteItem
  } = useLifeOpsSheets<ProjectRecord>(
    SHEET_CONFIGS.portfolio,
    rowToRecord,
    recordToRow
  )

  const record = records.find(r => r.id === id)

  const handleCopy = useCallback(() => {
    if (!record) return
    const text = `[${record.projectName}]
${record.problem || ''}
${record.link ? `링크: ${record.link}` : ''}`

    navigator.clipboard.writeText(text.trim())
    alert('클립보드에 복사되었습니다!')
  }, [record])

  const handleDelete = useCallback(async () => {
    if (!record) return
    if (confirm('이 프로젝트를 삭제할까요?')) {
      await deleteItem(record.id)
      navigate('/portfolio')
    }
  }, [record, deleteItem, navigate])

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">프로젝트 상세</h1>
          <Link to="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← 목록
          </Link>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">로그인이 필요합니다</h2>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">프로젝트 상세</h1>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 프로젝트를 찾을 수 없음
  if (!record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">프로젝트 상세</h1>
          <Link to="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← 목록
          </Link>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">프로젝트를 찾을 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          💼 포트폴리오
        </h1>
        <Link
          to="/portfolio"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← 목록
        </Link>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 프로젝트 상세 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 섹션 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {record.projectName}
            </h2>
            {record.tech && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                {record.tech}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {record.date}
          </p>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4">
          {record.link && (
            <a
              href={record.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:underline"
            >
              🔗 {record.link}
            </a>
          )}

          {record.problem && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {record.problem}
              </p>
            </div>
          )}
        </div>

        {/* 섹션 푸터 - 버튼들 */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            복사
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
