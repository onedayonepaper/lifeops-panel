import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs, type ProjectDocData } from '../hooks/useGoogleDocs'

const initialData: ProjectDocData = {
  title: '',
  content: ''
}

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSignedIn, accessToken } = useGoogleAuth()
  const {
    documents,
    isLoading,
    createProject,
    updateProject,
    getDocumentUrl,
  } = useGoogleDocs(accessToken)

  const isNewMode = id === 'new' || !id
  const existingProject = id && id !== 'new' ? documents.find(d => d.id === id) : null

  const [data, setData] = useState<ProjectDocData>(initialData)
  const [isSaving, setIsSaving] = useState(false)

  // 기존 프로젝트 데이터 로드
  useEffect(() => {
    if (existingProject) {
      // Google Docs에서 제목은 있지만, 내용은 별도로 가져와야 함
      // 현재는 제목만 설정
      setData(prev => ({
        ...prev,
        title: existingProject.title
      }))
    }
  }, [existingProject])

  const handleSave = async () => {
    if (!data.title.trim()) {
      alert('프로젝트 제목을 입력해주세요')
      return
    }

    if (!isSignedIn) {
      alert('Google 로그인이 필요합니다')
      return
    }

    setIsSaving(true)

    try {
      if (isNewMode) {
        // 새 프로젝트 생성
        const newId = await createProject(data)
        if (newId) {
          alert('프로젝트가 생성되었습니다')
          navigate(`/project/${newId}`)
        } else {
          alert('프로젝트 생성에 실패했습니다')
        }
      } else if (existingProject) {
        // 기존 프로젝트 수정
        const updated = await updateProject(existingProject.id, data)
        if (updated) {
          alert('프로젝트가 수정되었습니다')
          navigate(`/project/${existingProject.id}`)
        } else {
          alert('프로젝트 수정에 실패했습니다')
        }
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  // 로그인 안된 상태
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="🚀" title="프로젝트" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-white text-lg font-medium mb-2">로그인 필요</h3>
          <p className="text-gray-400 mb-6">
            프로젝트를 생성하려면 Google 로그인이 필요합니다
          </p>
          <Link
            to="/job-document"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            취업서류 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🚀" title={isNewMode ? "새 프로젝트" : "프로젝트 수정"}>
        <div className="flex items-center gap-2">
          {existingProject && (
            <a
              href={getDocumentUrl(existingProject.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
            >
              Google Docs에서 열기
            </a>
          )}
          <Link
            to="/job-document"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>
      </PageHeader>

      <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
        {/* 안내 메시지 */}
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-orange-400 text-sm">
            📁 프로젝트는 Google Drive의 <strong>취업서류 &gt; 프로젝트</strong> 폴더에 저장됩니다
          </p>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">프로젝트 제목 *</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="예: HomePulse - 스마트홈 모니터링 시스템"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">프로젝트 설명</label>
          <textarea
            value={data.content}
            onChange={e => setData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="프로젝트에 대한 상세 설명을 작성하세요.

- 프로젝트 개요
- 사용 기술 스택
- 주요 기능
- 성과 및 결과
- 배운 점"
            rows={15}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm"
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-3 pt-4">
          <Link
            to="/job-document"
            className="flex-1 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold text-lg text-center transition-colors"
          >
            취소
          </Link>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving || !data.title.trim()}
            className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
          >
            {isLoading || isSaving ? (
              '저장 중...'
            ) : isNewMode ? (
              '🚀 프로젝트 생성'
            ) : (
              '💾 프로젝트 수정'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
