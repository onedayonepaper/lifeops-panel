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
  const [language, setLanguage] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')

  const todayKey = getTodayKey()

  const clearForm = () => {
    setProjectName('')
    setLanguage('')
    setLink('')
    setDescription('')
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
      company: '',
      problem: description.trim(),
      action: '',
      tech: language.trim(),
      result: '',
      metrics: '',
      link: link.trim(),
      screenshots: '',
      demoVideo: '',
      flowDiagram: '',
      documentation: '',
      isRepresentative: false
    }

    const success = await addItem(newRecord)

    if (success) {
      await markTaskComplete('r1-3')
      clearForm()
      navigate('/portfolio')
    }
  }, [projectName, language, link, description, todayKey, addItem, navigate])

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
            ← 포트폴리오
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
        </div>
        <Link
          to="/portfolio"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← 포트폴리오
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            프로젝트명 *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="프로젝트 이름"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            언어
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="예: TypeScript, Python, Java"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            프로젝트 링크
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="GitHub 또는 배포 URL"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대해 자유롭게 작성하세요"
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </div>

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
