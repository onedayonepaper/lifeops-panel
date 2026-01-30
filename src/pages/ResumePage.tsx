import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs, type DocumentMeta, type DocumentType } from '../hooks/useGoogleDocs'

// 문서 타입별 설정
const DOC_CONFIG = {
  resume: {
    name: '이력서',
    icon: '📄',
    color: 'blue',
    viewPath: '/resume',
    editPath: '/resume/edit/new',
    single: true, // 1개만 허용
  },
  career: {
    name: '경력기술서',
    icon: '📋',
    color: 'green',
    viewPath: '/career',
    editPath: '/career/edit/new',
    single: true,
  },
  project: {
    name: '프로젝트',
    icon: '🚀',
    color: 'orange',
    viewPath: '/project',
    editPath: '/project/edit/new',
    single: false, // 여러 개 허용
  },
} as const

// 색상 클래스 매핑
const colorClasses = {
  blue: {
    badge: 'bg-blue-500/20 text-blue-400',
    icon: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500',
    border: 'border-blue-500/30',
  },
  green: {
    badge: 'bg-green-500/20 text-green-400',
    icon: 'text-green-400',
    button: 'bg-green-600 hover:bg-green-500',
    border: 'border-green-500/30',
  },
  orange: {
    badge: 'bg-orange-500/20 text-orange-400',
    icon: 'text-orange-400',
    button: 'bg-orange-600 hover:bg-orange-500',
    border: 'border-orange-500/30',
  },
}

// 외부 링크 아이콘
function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3 ml-0.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// 단일 문서 카드 (이력서, 경력기술서)
interface SingleDocCardProps {
  type: 'resume' | 'career'
  doc: DocumentMeta | undefined
  onDelete: (id: string) => void
  getDocumentUrl: (id: string) => string
}

function SingleDocCard({ type, doc, onDelete, getDocumentUrl }: SingleDocCardProps) {
  const config = DOC_CONFIG[type]
  const colors = colorClasses[config.color]

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          <span className={colors.icon}>{config.icon}</span> {config.name}
        </h4>
        {doc && (
          <span className={`px-2 py-0.5 ${colors.badge} text-xs rounded`}>생성됨</span>
        )}
      </div>

      {doc ? (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm truncate" title={doc.title}>{doc.title}</p>
          <p className="text-gray-500 text-xs">
            {new Date(doc.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </p>
          <div className="grid grid-cols-4 gap-1">
            <Link
              to={`${config.viewPath}/${doc.id}`}
              className={`px-2 py-2 ${colors.button} text-white text-xs rounded-lg text-center transition-colors`}
            >
              보기
            </Link>
            <Link
              to={`${config.viewPath}/${doc.id}/edit`}
              className="px-2 py-2 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg text-center transition-colors"
            >
              수정
            </Link>
            <a
              href={getDocumentUrl(doc.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg text-center transition-colors flex items-center justify-center"
              title="Google 문서에서 열기"
            >
              Docs<ExternalLinkIcon />
            </a>
            <button
              onClick={() => onDelete(doc.id)}
              className="px-2 py-2 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg text-center transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm mb-3">{config.name}가 없습니다</p>
          <Link
            to={config.editPath}
            className={`px-4 py-2 ${colors.button} text-white text-sm rounded-lg inline-block transition-colors`}
          >
            + {config.name} 추가
          </Link>
        </div>
      )}
    </div>
  )
}

// 프로젝트 목록 카드 (여러 개 지원)
interface ProjectListCardProps {
  projects: DocumentMeta[]
  onDelete: (id: string) => void
  getDocumentUrl: (id: string) => string
  getFolderUrl: (type: DocumentType) => string
}

function ProjectListCard({ projects, onDelete, getDocumentUrl, getFolderUrl }: ProjectListCardProps) {
  const config = DOC_CONFIG.project
  const colors = colorClasses[config.color]

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          <span className={colors.icon}>{config.icon}</span> {config.name}
          {projects.length > 0 && (
            <span className={`px-2 py-0.5 ${colors.badge} text-xs rounded`}>{projects.length}개</span>
          )}
        </h4>
        <div className="flex items-center gap-2">
          <a
            href={getFolderUrl('project')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-xs flex items-center"
            title="프로젝트 폴더 열기"
          >
            폴더<ExternalLinkIcon />
          </a>
          <Link
            to={config.editPath}
            className={`px-3 py-1 ${colors.button} text-white text-xs rounded-lg transition-colors`}
          >
            + 추가
          </Link>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`bg-gray-800/50 border ${colors.border} rounded-lg p-3`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-medium truncate flex-1" title={project.title}>
                  {project.title}
                </p>
                <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                  {new Date(project.modifiedAt || project.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <Link
                  to={`${config.viewPath}/${project.id}`}
                  className={`px-2 py-1.5 ${colors.button} text-white text-xs rounded text-center transition-colors`}
                >
                  보기
                </Link>
                <Link
                  to={`${config.viewPath}/${project.id}/edit`}
                  className="px-2 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded text-center transition-colors"
                >
                  수정
                </Link>
                <a
                  href={getDocumentUrl(project.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded text-center transition-colors flex items-center justify-center"
                >
                  Docs<ExternalLinkIcon />
                </a>
                <button
                  onClick={() => onDelete(project.id)}
                  className="px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded text-center transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-3">프로젝트가 없습니다</p>
          <p className="text-gray-600 text-xs mb-4">포트폴리오에 보여줄 프로젝트를 추가하세요</p>
          <Link
            to={config.editPath}
            className={`px-4 py-2 ${colors.button} text-white text-sm rounded-lg inline-block transition-colors`}
          >
            + 첫 프로젝트 추가
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ResumePage() {
  const { isSignedIn, signIn, accessToken } = useGoogleAuth()
  const {
    documents,
    error,
    isLoading,
    getFolderUrl,
    getDocumentUrl,
    deleteDocument,
    getDocumentsByType,
  } = useGoogleDocs(accessToken)

  const resumeDoc = documents.find(d => d.type === 'resume')
  const careerDoc = documents.find(d => d.type === 'career')
  const projectDocs = getDocumentsByType('project')

  const handleDelete = async (id: string) => {
    const doc = documents.find(d => d.id === id)
    const typeName = doc ? DOC_CONFIG[doc.type].name : '문서'

    if (!confirm(`${typeName}를 삭제하시겠습니까?\n\n※ Google Drive 휴지통으로 이동됩니다.`)) return

    await deleteDocument(id)
  }

  // 로그인 안된 상태
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="📄" title="취업서류" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-white text-lg font-medium mb-2">취업서류 관리</h3>
          <p className="text-gray-400 mb-6">
            Google 계정으로 로그인하면<br />
            이력서, 경력기술서, 프로젝트를 관리할 수 있습니다
          </p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="📄" title="취업서류">
        <a
          href={getFolderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          title="취업서류 폴더 열기"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <ExternalLinkIcon />
        </a>
      </PageHeader>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-4">
          <p className="text-blue-400">Google Drive와 동기화 중...</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-4">
        {/* 폴더 구조 안내 */}
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
          <p className="text-gray-400 text-xs">
            📁 Google Drive 폴더 구조: <span className="text-white">취업서류</span> &gt;
            <span className="text-blue-400"> 이력서</span>,
            <span className="text-green-400"> 경력기술서</span>,
            <span className="text-orange-400"> 프로젝트</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 이력서 */}
          <SingleDocCard
            type="resume"
            doc={resumeDoc}
            onDelete={handleDelete}
            getDocumentUrl={getDocumentUrl}
          />

          {/* 경력기술서 */}
          <SingleDocCard
            type="career"
            doc={careerDoc}
            onDelete={handleDelete}
            getDocumentUrl={getDocumentUrl}
          />

          {/* 프로젝트 목록 */}
          <ProjectListCard
            projects={projectDocs}
            onDelete={handleDelete}
            getDocumentUrl={getDocumentUrl}
            getFolderUrl={getFolderUrl}
          />
        </div>
      </div>
    </div>
  )
}
