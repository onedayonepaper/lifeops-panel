import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs, type DocumentType, type DriveFile } from '../hooks/useGoogleDocs'

// 섹션 설정
const SECTIONS = [
  { type: 'resume' as DocumentType, label: '이력서', icon: '📄', color: 'blue' as const },
  { type: 'career' as DocumentType, label: '경력기술서', icon: '📋', color: 'green' as const },
  { type: 'project' as DocumentType, label: '포트폴리오', icon: '💼', color: 'orange' as const },
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    button: 'bg-blue-600 hover:bg-blue-500',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    button: 'bg-green-600 hover:bg-green-500',
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    button: 'bg-orange-600 hover:bg-orange-500',
  },
}

// 파일 아이콘 결정
function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎬'
  if (mimeType.includes('audio')) return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦'
  return '📄'
}

// 파일 크기 포맷
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 외부 링크 아이콘
function ExternalLinkIcon() {
  return (
    <svg className="w-3 h-3 ml-0.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

interface FileSectionProps {
  type: DocumentType
  label: string
  icon: string
  color: 'blue' | 'green' | 'orange'
  files: DriveFile[]
  folderId: string | null
  onUpload: (file: File, type: DocumentType) => Promise<void>
  onDelete: (fileId: string) => Promise<void>
  isUploading: boolean
}

function FileSection({ type, label, icon, color, files, folderId, onUpload, onDelete, isUploading }: FileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colors = colorClasses[color]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file, type)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    if (confirm(`"${fileName}"을(를) 삭제하시겠습니까?\n\n※ Google Drive 휴지통으로 이동됩니다.`)) {
      await onDelete(fileId)
    }
  }

  const folderUrl = folderId ? `https://drive.google.com/drive/folders/${folderId}` : null

  return (
    <div className={`bg-gray-700/50 rounded-xl border ${colors.border}`}>
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-600/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${colors.text}`}>{label}</h3>
          <span className="text-gray-500 text-sm">({files.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {folderUrl && (
            <a
              href={folderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
              title="폴더 열기"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </a>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-3 py-1.5 ${colors.button} text-white text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50`}
          >
            {isUploading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                업로드 중...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                업로드
              </>
            )}
          </button>
        </div>
      </div>

      {/* 파일 목록 */}
      <div className="p-3">
        {files.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 opacity-50">{icon}</div>
            <p className="text-gray-500 text-sm">{label}가 없습니다</p>
            <p className="text-gray-600 text-xs mt-1">파일을 업로드해주세요</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{getFileIcon(file.mimeType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate" title={file.name}>{file.name}</p>
                    <p className="text-gray-500 text-xs">{formatDate(file.modifiedTime || file.createdTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      title="열기"
                    >
                      <ExternalLinkIcon />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    className="p-1.5 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResumePage() {
  const { isSignedIn, signIn, accessToken } = useGoogleAuth()
  const {
    subfolderIds,
    getFolderUrl,
    getFilesInFolder,
    uploadFile,
    deleteFile,
    syncWithDrive,
    isLoading,
    error,
  } = useGoogleDocs(accessToken)

  const [files, setFiles] = useState<Record<DocumentType, DriveFile[]>>({
    resume: [],
    career: [],
    project: [],
  })
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null)

  // 파일 목록 로드
  useEffect(() => {
    async function loadFiles() {
      if (!accessToken) return

      const newFiles: Record<DocumentType, DriveFile[]> = {
        resume: [],
        career: [],
        project: [],
      }

      for (const section of SECTIONS) {
        const folderId = subfolderIds[section.type]
        if (folderId) {
          const folderFiles = await getFilesInFolder(folderId)
          newFiles[section.type] = folderFiles
        }
      }

      setFiles(newFiles)
    }

    loadFiles()
  }, [accessToken, subfolderIds, getFilesInFolder])

  // 파일 업로드 핸들러
  const handleUpload = async (file: File, type: DocumentType) => {
    setUploadingType(type)
    try {
      const fileId = await uploadFile(file, type)
      if (fileId) {
        // 해당 폴더 파일 목록 새로고침
        const folderId = subfolderIds[type]
        if (folderId) {
          const folderFiles = await getFilesInFolder(folderId)
          setFiles(prev => ({ ...prev, [type]: folderFiles }))
        }
      }
    } finally {
      setUploadingType(null)
    }
  }

  // 파일 삭제 핸들러
  const handleDelete = async (fileId: string) => {
    const success = await deleteFile(fileId)
    if (success) {
      // 모든 섹션에서 해당 파일 제거
      setFiles(prev => ({
        resume: prev.resume.filter(f => f.id !== fileId),
        career: prev.career.filter(f => f.id !== fileId),
        project: prev.project.filter(f => f.id !== fileId),
      }))
    }
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
            이력서, 경력기술서, 포트폴리오를 관리할 수 있습니다
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
        <div className="flex items-center gap-2">
          <button
            onClick={syncWithDrive}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="새로고침"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
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
        </div>
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

        {/* 3개 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SECTIONS.map(section => (
            <FileSection
              key={section.type}
              type={section.type}
              label={section.label}
              icon={section.icon}
              color={section.color}
              files={files[section.type]}
              folderId={subfolderIds[section.type]}
              onUpload={handleUpload}
              onDelete={handleDelete}
              isUploading={uploadingType === section.type}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
