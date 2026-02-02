import { useState, useEffect } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useApiKeysSheet, type ApiKeyEntry } from '../hooks/useApiKeysSheet'

const FOLDER_ID_KEY = 'lifeops_folder_id'

export default function ApiKeysPage() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const {
    entries,
    isLoading,
    error,
    isInitialized,
    initializeSheet,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh
  } = useApiKeysSheet(accessToken)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    serviceName: '',
    keyName: '',
    apiKey: '',
    description: ''
  })
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string | null>(null)

  useEffect(() => {
    setFolderId(localStorage.getItem(FOLDER_ID_KEY))
  }, [isInitialized])

  const handleSubmit = async () => {
    if (!formData.serviceName || !formData.apiKey) return

    let success = false
    if (editingId) {
      success = await updateEntry(editingId, formData)
      setEditingId(null)
    } else {
      success = await addEntry(formData)
    }

    if (success) {
      setFormData({ serviceName: '', keyName: '', apiKey: '', description: '' })
      setShowAddForm(false)
    }
  }

  const handleEdit = (entry: ApiKeyEntry) => {
    setFormData({
      serviceName: entry.serviceName,
      keyName: entry.keyName,
      apiKey: entry.apiKey,
      description: entry.description || ''
    })
    setEditingId(entry.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('삭제할까요?')) {
      await deleteEntry(id)
    }
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyToClipboard = async (id: string, apiKey: string) => {
    await navigator.clipboard.writeText(apiKey)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 4) + '••••••••' + key.slice(-4)
  }

  // 로그인 필요
  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="🔑" title="API 키 관리" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-bold text-white mb-2">Google 로그인 필요</h2>
            <p className="text-gray-400 text-sm mb-6">
              API 키를 안전하게 Google Sheets에 저장합니다
            </p>
            <button
              onClick={signIn}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Google 로그인
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 초기화 필요
  if (!isInitialized) {
    return (
      <div>
        <PageHeader icon="🔑" title="API 키 관리" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-white mb-2">스프레드시트 설정</h2>
            <p className="text-gray-400 text-sm mb-6">
              API 키를 저장할 Google Sheets를 생성합니다
            </p>
            <button
              onClick={initializeSheet}
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '생성 중...' : '스프레드시트 생성'}
            </button>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🔑" title="API 키 관리">
        {folderId && (
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            title="Google Drive 폴더 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </a>
        )}
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"
          title="새로고침"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={() => {
            setFormData({ serviceName: '', keyName: '', apiKey: '', description: '' })
            setEditingId(null)
            setShowAddForm(true)
          }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="API 키 추가"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4">
        {/* 안내 메시지 */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-300 mb-1">보안 안내</h3>
              <p className="text-sm text-gray-400">
                API 키는 Google Sheets에 저장됩니다. 민감한 키는 별도의 보안 저장소 사용을 권장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 추가/수정 폼 */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'API 키 수정' : '새 API 키 추가'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="서비스명 (예: OpenAI, Anthropic)"
                value={formData.serviceName}
                onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="키 이름 (예: Production, Development)"
                value={formData.keyName}
                onChange={e => setFormData({ ...formData, keyName: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="API Key"
                value={formData.apiKey}
                onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm md:col-span-2 font-mono"
              />
              <input
                type="text"
                placeholder="설명 (선택)"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm md:col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData({ serviceName: '', keyName: '', apiKey: '', description: '' })
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* API 키 목록 */}
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🔑</div>
            <p>등록된 API 키가 없습니다</p>
            <p className="text-sm mt-2">상단의 + 버튼으로 API 키를 추가하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{entry.serviceName}</h3>
                      {entry.keyName && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {entry.keyName}
                        </span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-gray-400 mt-1">{entry.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* API Key 표시 영역 */}
                <div className="flex items-center gap-2 mt-3 p-2 bg-gray-900 rounded-lg">
                  <code className="flex-1 text-sm font-mono text-gray-300 overflow-hidden">
                    {visibleKeys.has(entry.id) ? entry.apiKey : maskApiKey(entry.apiKey)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(entry.id)}
                    className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                    title={visibleKeys.has(entry.id) ? '숨기기' : '보기'}
                  >
                    {visibleKeys.has(entry.id) ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(entry.id, entry.apiKey)}
                    className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${
                      copiedId === entry.id ? 'text-green-400' : 'text-gray-400 hover:text-white'
                    }`}
                    title="복사"
                  >
                    {copiedId === entry.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* 날짜 정보 */}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>생성: {new Date(entry.createdAt).toLocaleDateString()}</span>
                  {entry.updatedAt !== entry.createdAt && (
                    <span>수정: {new Date(entry.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
