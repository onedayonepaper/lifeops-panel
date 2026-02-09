import { Link } from 'react-router-dom'
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

export function PortfolioContent() {
  const {
    data: records,
    isLoading,
    error,
    isSignedIn,
    signIn,
    spreadsheetUrl
  } = useLifeOpsSheets<ProjectRecord>(
    SHEET_CONFIGS.portfolio,
    rowToRecord,
    recordToRow
  )

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
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
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 상단 액션 버튼 */}
      <div className="flex items-center justify-end gap-2">
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
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 프로젝트 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">프로젝트</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{records.length}개</span>
        </div>

        {records.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map(record => (
              <Link
                key={record.id}
                to={`/portfolio/${record.id}`}
                className="group block bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {/* 썸네일 */}
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {record.screenshots ? (
                    <img
                      src={record.screenshots}
                      alt={record.projectName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/80">
                        {record.projectName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* 언어 뱃지 */}
                  {record.tech && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm">
                      {record.tech}
                    </span>
                  )}
                </div>

                {/* 프로젝트 정보 */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {record.projectName}
                  </h3>
                  {record.problem && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {record.problem}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {record.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              아직 등록된 프로젝트가 없습니다
            </p>
          </div>
        )}

        {/* 추가 버튼 */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/portfolio/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            프로젝트 추가
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        💼 포트폴리오
      </h1>
      <PortfolioContent />
    </div>
  )
}
