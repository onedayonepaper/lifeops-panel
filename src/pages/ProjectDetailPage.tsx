import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs } from '../hooks/useGoogleDocs'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useGoogleAuth()
  const { resumes, getProjectData, getDocumentUrl, deleteResume } = useGoogleDocs(accessToken)

  const meta = resumes.find(r => r.id === id && r.type === 'project')
  const data = getProjectData()

  if (!id || !meta || !data) {
    return (
      <div>
        <PageHeader icon="🚀" title="프로젝트" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-400 mb-4">프로젝트를 찾을 수 없습니다</p>
          <Link
            to="/resume"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('이 프로젝트를 삭제하시겠습니까?')) {
      deleteResume(id)
      navigate('/resume')
    }
  }

  return (
    <div>
      <PageHeader icon="🚀" title="프로젝트">
        <div className="flex items-center gap-2">
          <Link
            to="/resume"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ← 목록
          </Link>
          <Link
            to={`/project/${id}/edit`}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정하기
          </Link>
          <a
            href={getDocumentUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google 문서로 보기
          </a>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </PageHeader>

      {/* Project Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-8">
          <h1 className="text-3xl font-bold">{data.title}</h1>
        </div>

        <div className="p-8 text-gray-800">
          {data.content ? (
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {data.content}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">내용이 없습니다</p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-4 text-center text-gray-500 text-sm">
          생성일: {new Date(meta.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}
