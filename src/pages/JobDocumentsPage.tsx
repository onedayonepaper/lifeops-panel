import { useState, useRef } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useGoogleDrive, type DriveFile, type DriveFolder } from '../hooks/useGoogleDrive'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const FOLDER_NAME = '취업지원모음'

// Check if file is a folder
function isFolder(file: DriveFile): boolean {
  return file.mimeType === 'application/vnd.google-apps.folder'
}

// Get file icon based on mime type
function getFileIcon(mimeType: string): string {
  if (mimeType.includes('document') || mimeType.includes('word')) return '📄'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('folder')) return '📁'
  if (mimeType.includes('video')) return '🎬'
  if (mimeType.includes('audio')) return '🎵'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️'
  return '📎'
}

// Format file size
function formatFileSize(bytes: string | undefined): string {
  if (!bytes) return ''
  const size = parseInt(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// Check if file is markdown
function isMarkdownFile(file: DriveFile): boolean {
  return file.name.endsWith('.md') || file.name.endsWith('.markdown')
}

// Markdown Preview Modal
function MarkdownPreviewModal({
  isOpen,
  onClose,
  title,
  content,
  isLoading
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  isLoading: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">마크다운 불러오는 중...</span>
            </div>
          ) : (
            <article className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-3xl prose-h1:border-b prose-h1:border-gray-700 prose-h1:pb-3 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-2 prose-h2:mb-3
              prose-h3:text-xl
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-pink-400 prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-li:marker:text-gray-500
              prose-table:border-collapse
              prose-th:bg-gray-700 prose-th:text-white prose-th:p-3 prose-th:border prose-th:border-gray-600
              prose-td:p-3 prose-td:border prose-td:border-gray-600 prose-td:text-gray-300
              prose-hr:border-gray-700
              prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-900/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}

function FileItem({
  file,
  onDelete,
  onRename,
  onFolderClick,
  onMarkdownClick
}: {
  file: DriveFile
  onDelete: (fileId: string) => void
  onRename: (fileId: string, newName: string) => void
  onFolderClick?: (folder: DriveFolder) => void
  onMarkdownClick?: (file: DriveFile) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const fileIsFolder = isFolder(file)
  const fileIsMarkdown = isMarkdownFile(file)

  const handleRename = () => {
    const newName = prompt('새 이름을 입력하세요:', file.name)
    if (newName && newName !== file.name) {
      onRename(file.id, newName)
    }
    setShowMenu(false)
  }

  const handleClick = () => {
    if (fileIsFolder && onFolderClick) {
      onFolderClick({ id: file.id, name: file.name })
    }
  }

  const handleTitleClick = (e: React.MouseEvent) => {
    if (fileIsMarkdown && onMarkdownClick) {
      e.preventDefault()
      e.stopPropagation()
      onMarkdownClick(file)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors group ${fileIsFolder ? 'cursor-pointer' : ''}`}
      onClick={fileIsFolder ? handleClick : undefined}
    >
      <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>

      <div className="flex-1 min-w-0">
        {fileIsFolder ? (
          <span className="text-white font-medium hover:text-blue-400 block truncate">
            {file.name}
          </span>
        ) : fileIsMarkdown ? (
          <button
            onClick={handleTitleClick}
            className="text-white font-medium hover:text-blue-400 block truncate text-left w-full"
          >
            {file.name}
          </button>
        ) : (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium hover:text-blue-400 block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {file.name}
          </a>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
          {file.modifiedTime && (
            <span>{format(new Date(file.modifiedTime), 'M월 d일 HH:mm', { locale: ko })}</span>
          )}
          {!fileIsFolder && file.size && <span>• {formatFileSize(file.size)}</span>}
          {fileIsFolder && <span className="text-blue-400">폴더</span>}
        </div>
      </div>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-600 text-gray-400 hover:text-white transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-gray-600 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
              {fileIsFolder ? (
                <button
                  onClick={() => {
                    if (onFolderClick) onFolderClick({ id: file.id, name: file.name })
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-500 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  열기
                </button>
              ) : (
                <>
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-500 flex items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    열기
                  </a>
                  {file.webContentLink && (
                    <a
                      href={file.webContentLink}
                      className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-500 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </a>
                  )}
                </>
              )}
              <button
                onClick={handleRename}
                className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-500 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                이름 변경
              </button>
              <button
                onClick={() => {
                  const message = fileIsFolder
                    ? `"${file.name}" 폴더를 삭제하시겠습니까? (폴더 안의 모든 파일도 함께 삭제됩니다)`
                    : `"${file.name}" 파일을 삭제하시겠습니까?`
                  if (confirm(message)) {
                    onDelete(file.id)
                  }
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-500 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CreateMenu({
  onCreateDoc,
  onCreateSheet,
  onCreateFolder,
  onUpload
}: {
  onCreateDoc: () => void
  onCreateSheet: () => void
  onCreateFolder: () => void
  onUpload: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        새로 만들기
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-gray-700 rounded-xl shadow-lg z-50 py-2 min-w-[180px]">
            <button
              onClick={() => {
                onCreateFolder()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-3"
            >
              <span className="text-lg">📁</span>
              새 폴더
            </button>
            <hr className="my-2 border-gray-600" />
            <button
              onClick={() => {
                onCreateDoc()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-3"
            >
              <span className="text-lg">📄</span>
              Google 문서
            </button>
            <button
              onClick={() => {
                onCreateSheet()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-3"
            >
              <span className="text-lg">📊</span>
              Google 스프레드시트
            </button>
            <hr className="my-2 border-gray-600" />
            <button
              onClick={() => {
                onUpload()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-3"
            >
              <span className="text-lg">📤</span>
              파일 업로드
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function JobDocumentsPage() {
  const {
    files,
    currentFolder,
    folderPath,
    isLoading,
    error,
    isSignedIn,
    signIn,
    refresh,
    uploadFile,
    deleteFile,
    renameFile,
    createGoogleDoc,
    createGoogleSheet,
    createSubFolder,
    navigateToFolder,
    navigateBack,
    navigateToPathIndex
  } = useGoogleDrive(FOLDER_NAME)
  const { accessToken } = useGoogleAuth()

  const [isUploading, setIsUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Markdown preview state
  const [markdownPreview, setMarkdownPreview] = useState<{
    isOpen: boolean
    title: string
    content: string
    isLoading: boolean
  }>({
    isOpen: false,
    title: '',
    content: '',
    isLoading: false
  })

  // Fetch markdown content from Google Drive
  const handleMarkdownClick = async (file: DriveFile) => {
    if (!accessToken) return

    setMarkdownPreview({
      isOpen: true,
      title: file.name,
      content: '',
      isLoading: true
    })

    try {
      // Fetch file content using Google Drive API
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('파일을 불러올 수 없습니다')
      }

      const content = await response.text()
      setMarkdownPreview(prev => ({
        ...prev,
        content,
        isLoading: false
      }))
    } catch (err) {
      console.error('Markdown fetch error:', err)
      setMarkdownPreview(prev => ({
        ...prev,
        content: '마크다운 파일을 불러오는데 실패했습니다.',
        isLoading: false
      }))
    }
  }

  const closeMarkdownPreview = () => {
    setMarkdownPreview({
      isOpen: false,
      title: '',
      content: '',
      isLoading: false
    })
  }

  // Sort files: folders first, then files
  const sortedFiles = [...files].sort((a, b) => {
    const aIsFolder = isFolder(a)
    const bIsFolder = isFolder(b)
    if (aIsFolder && !bIsFolder) return -1
    if (!aIsFolder && bIsFolder) return 1
    return a.name.localeCompare(b.name)
  })

  const handleCreateFolder = async () => {
    const name = prompt('폴더 이름을 입력하세요:')
    if (!name) return

    setIsCreating(true)
    await createSubFolder(name)
    setIsCreating(false)
  }

  const handleCreateDoc = async () => {
    const name = prompt('문서 이름을 입력하세요:')
    if (!name) return

    setIsCreating(true)
    const doc = await createGoogleDoc(name)
    setIsCreating(false)

    if (doc?.webViewLink) {
      window.open(doc.webViewLink, '_blank')
    }
  }

  const handleCreateSheet = async () => {
    const name = prompt('스프레드시트 이름을 입력하세요:')
    if (!name) return

    setIsCreating(true)
    const sheet = await createGoogleSheet(name)
    setIsCreating(false)

    if (sheet?.webViewLink) {
      window.open(sheet.webViewLink, '_blank')
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    await uploadFile(file)
    setIsUploading(false)

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="📂" title="취업지원모음" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h2 className="text-xl font-bold text-white mb-2">Google Drive 연동 필요</h2>
          <p className="text-gray-400 mb-6">
            취업 관련 서류를 Google Drive에서 관리하세요
          </p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading && files.length === 0) {
    return (
      <div>
        <PageHeader icon="📂" title="취업지원모음" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">폴더를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div>
        <PageHeader icon="📂" title="취업지원모음" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="📂" title="취업지원모음" />

      {/* Breadcrumb Navigation */}
      {folderPath.length > 1 && (
        <div className="flex items-center gap-2 mb-4 bg-gray-800/50 rounded-xl p-3">
          <button
            onClick={navigateBack}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="뒤로 가기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-1 text-sm overflow-x-auto">
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-1 flex-shrink-0">
                {index > 0 && <span className="text-gray-500">/</span>}
                <button
                  onClick={() => navigateToPathIndex(index)}
                  disabled={isLoading || index === folderPath.length - 1}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    index === folderPath.length - 1
                      ? 'text-white font-medium bg-gray-700'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {index === 0 ? '📂' : '📁'} {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <a
              href={`https://drive.google.com/drive/folders/${currentFolder.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Google Drive에서 열기
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="새로고침"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <CreateMenu
            onCreateDoc={handleCreateDoc}
            onCreateSheet={handleCreateSheet}
            onCreateFolder={handleCreateFolder}
            onUpload={handleUploadClick}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload/Create indicator */}
      {(isUploading || isCreating) && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-blue-400 text-sm">
            {isUploading ? '파일 업로드 중...' : '문서 생성 중...'}
          </span>
        </div>
      )}

      {/* Files List */}
      <div className="bg-gray-800 rounded-2xl p-4">
        {sortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 mb-2">아직 파일이 없습니다</p>
            <p className="text-gray-500 text-sm">
              "새로 만들기" 버튼으로 폴더나 문서를 추가하세요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedFiles.map(file => (
              <FileItem
                key={file.id}
                file={file}
                onDelete={deleteFile}
                onRename={renameFile}
                onFolderClick={navigateToFolder}
                onMarkdownClick={handleMarkdownClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">💡 활용 팁</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• 이력서, 자기소개서, 포트폴리오 등을 이 폴더에 보관하세요</li>
          <li>• Google 문서로 만들면 어디서나 수정 가능합니다</li>
          <li>• 회사별 지원서류를 정리해두면 편리합니다</li>
        </ul>
      </div>

      {/* Markdown Preview Modal */}
      <MarkdownPreviewModal
        isOpen={markdownPreview.isOpen}
        onClose={closeMarkdownPreview}
        title={markdownPreview.title}
        content={markdownPreview.content}
        isLoading={markdownPreview.isLoading}
      />
    </div>
  )
}
