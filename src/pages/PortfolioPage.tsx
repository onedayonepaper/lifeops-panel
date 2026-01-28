import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { markTaskComplete } from '../utils/roundTaskUtils'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

interface ProjectRecord {
  id: string
  date: string
  projectName: string
  problem: string    // 문제
  action: string     // 내가 한 일
  tech: string       // 기술
  result: string     // 결과
  link: string       // 프로젝트 링크
  screenshots: string // 데모 스크린샷 URL
  demoVideo: string   // 데모 영상 URL
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
    problem: row[3] || '',
    action: row[4] || '',
    tech: row[5] || '',
    result: row[6] || '',
    link: row[7] || '',
    screenshots: row[8] || '',
    demoVideo: row[9] || ''
  }
}

function recordToRow(record: ProjectRecord): string[] {
  return [
    record.id,
    record.date,
    record.projectName,
    record.problem,
    record.action,
    record.tech,
    record.result,
    record.link,
    record.screenshots,
    record.demoVideo
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
  const [problem, setProblem] = useState('')
  const [action, setAction] = useState('')
  const [tech, setTech] = useState('')
  const [result, setResult] = useState('')
  const [link, setLink] = useState('')
  const [screenshots, setScreenshots] = useState('')
  const [demoVideo, setDemoVideo] = useState('')

  const todayKey = getTodayKey()

  const clearForm = () => {
    setProjectName('')
    setProblem('')
    setAction('')
    setTech('')
    setResult('')
    setLink('')
    setScreenshots('')
    setDemoVideo('')
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
      problem: problem.trim(),
      action: action.trim(),
      tech: tech.trim(),
      result: result.trim(),
      link: link.trim(),
      screenshots: screenshots.trim(),
      demoVideo: demoVideo.trim()
    }

    const success = await addItem(newRecord)

    if (success) {
      // 라운드 태스크 완료 처리
      await markTaskComplete('r1-3')
      // 폼 초기화
      clearForm()
    }
  }, [projectName, problem, action, tech, result, link, screenshots, demoVideo, todayKey, addItem])

  const handleCopy = useCallback((record: ProjectRecord) => {
    const text = `[${record.projectName}]
- 문제: ${record.problem || '-'}
- 내가 한 일: ${record.action || '-'}
- 기술: ${record.tech || '-'}
- 결과: ${record.result || '-'}
- 링크: ${record.link || '-'}
- 스크린샷: ${record.screenshots || '-'}
- 데모영상: ${record.demoVideo || '-'}`

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
                    <span className="font-bold text-gray-900 dark:text-white">
                      {record.projectName}
                    </span>
                    {record.date === todayKey && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
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

        {/* 프로젝트명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            프로젝트명 *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="프로젝트명"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* 4줄 입력 */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
              문제: (어떤 문제/니즈가 있었나?)
            </label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              내가 한 일: (구체적으로 뭘 했나?)
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              기술: (사용한 기술 스택)
            </label>
            <input
              type="text"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              결과: (어떤 성과/결과가 있었나?)
            </label>
            <input
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-1">
              링크: (프로젝트 URL)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
              스크린샷: (데모 스크린샷 URL)
            </label>
            <input
              type="url"
              value={screenshots}
              onChange={(e) => setScreenshots(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
              데모영상: (30초 영상/GIF URL)
            </label>
            <input
              type="url"
              value={demoVideo}
              onChange={(e) => setDemoVideo(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

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
