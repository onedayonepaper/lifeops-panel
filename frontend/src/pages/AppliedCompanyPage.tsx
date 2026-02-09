import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

type ApplyStatus = 'applied' | 'document' | 'interview1' | 'interview2' | 'offer' | 'rejected' | 'waiting'

interface AppliedCompany {
  id: string
  companyName: string
  position: string
  appliedDate: string
  status: ApplyStatus
  deadline: string
  notes: string
  result: string
  url: string
  driveUrl: string
  schedule: string
}

const STATUS_CONFIG: Record<ApplyStatus, { label: string; color: string; bgColor: string }> = {
  applied: { label: '지원 완료', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  document: { label: '서류 통과', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  interview1: { label: '1차 면접', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  interview2: { label: '최종 면접', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  offer: { label: '합격', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  rejected: { label: '불합격', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  waiting: { label: '결과 대기', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
}

const INITIAL_DATA: AppliedCompany[] = [
  {
    id: '3',
    companyName: '라인정보통신',
    position: '나주혁신도시 한전KDN 웹 개발자',
    appliedDate: '2026-02-06',
    status: 'applied',
    deadline: '2026-03-14',
    notes: '한전KDN 파견 | Java/JSP/Oracle | 연봉 3,000~8,000만원',
    result: '',
    url: 'https://www.jobkorea.co.kr/Recruit/GI_Read/48401715',
    driveUrl: '',
    schedule: ''
  },
  {
    id: '2',
    companyName: '국가직 9급 전산개발',
    position: '전산직 / 전산개발 (75명)',
    appliedDate: '2026-02-05',
    status: 'applied',
    deadline: '2026-02-06',
    notes: '결제완료 | 필기 4/4 | 가산점: 정보처리기사 3%',
    result: '',
    url: 'https://gongmuwon.gosi.kr',
    driveUrl: '',
    schedule: '2026-04-01~04-07 가산점 등록 (정보처리기사)\n2026-04-04 필기시험\n2026-05-08 필기합격자 발표\n2026-05-28~06-02 면접시험\n2026-06-19 최종합격자 발표'
  },
  {
    id: '1',
    companyName: '현대오토에버',
    position: '[EnIT] Backend Developer',
    appliedDate: '2026-02-04',
    status: 'rejected',
    deadline: '',
    notes: '',
    result: '서류불합격',
    url: 'https://career.hyundai-autoever.com/ko/apply',
    driveUrl: 'https://drive.google.com/drive/folders/129rsS_B_rszK5RTBk47stfDY5JUUH7KV',
    schedule: ''
  }
]

function rowToAppliedCompany(row: string[], headers: string[]): AppliedCompany {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => {
    record[header] = row[index] || ''
  })
  return {
    id: record.id || Date.now().toString(),
    companyName: record.companyName || '',
    position: record.position || '',
    appliedDate: record.appliedDate || '',
    status: (record.status as ApplyStatus) || 'applied',
    deadline: record.deadline || '',
    notes: record.notes || '',
    result: record.result || '',
    url: record.url || '',
    driveUrl: record.driveUrl || '',
    schedule: record.schedule || ''
  }
}

function appliedCompanyToRow(item: AppliedCompany): string[] {
  return [
    item.id,
    item.companyName,
    item.position,
    item.appliedDate,
    item.status,
    item.deadline,
    item.notes,
    item.result,
    item.url,
    item.driveUrl,
    item.schedule
  ]
}

export default function AppliedCompanyPage() {
  const {
    data: dataFromSheet,
    isLoading,
    isSaving,
    isSignedIn,
    signIn,
    addItem,
    updateItem,
    deleteItem,
    spreadsheetUrl
  } = useLifeOpsSheets<AppliedCompany>(
    SHEET_CONFIGS.appliedCompany,
    rowToAppliedCompany,
    appliedCompanyToRow
  )

  const [items, setItems] = useState<AppliedCompany[]>(INITIAL_DATA)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    appliedDate: new Date().toISOString().split('T')[0],
    deadline: '',
    notes: '',
    url: '',
    driveUrl: '',
    schedule: ''
  })

  // Sheets 데이터와 INITIAL_DATA 병합
  useEffect(() => {
    if (!isLoading && isSignedIn && !isInitialized) {
      const existingIds = new Set(dataFromSheet.map(d => d.id))
      const missing = INITIAL_DATA.filter(d => !existingIds.has(d.id))

      if (missing.length > 0) {
        const saveMissing = async () => {
          for (const item of missing) {
            await addItem(item)
          }
        }
        saveMissing()
      }

      setItems([...dataFromSheet, ...missing])
      setIsInitialized(true)
    }
  }, [isLoading, dataFromSheet, isSignedIn, isInitialized, addItem])

  const handleAdd = async () => {
    if (!formData.companyName.trim()) return

    const newItem: AppliedCompany = {
      id: Date.now().toString(),
      companyName: formData.companyName.trim(),
      position: formData.position.trim(),
      appliedDate: formData.appliedDate,
      status: 'applied',
      deadline: formData.deadline,
      notes: formData.notes.trim(),
      result: '',
      url: formData.url.trim(),
      driveUrl: formData.driveUrl.trim(),
      schedule: formData.schedule.trim()
    }

    const success = await addItem(newItem)
    if (success) {
      setItems(prev => [newItem, ...prev])
      setFormData({ companyName: '', position: '', appliedDate: new Date().toISOString().split('T')[0], deadline: '', notes: '', url: '', driveUrl: '', schedule: '' })
      setShowForm(false)
    }
  }

  const handleStatusChange = async (id: string, status: ApplyStatus) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const updated = { ...item, status }
    setItems(prev => prev.map(i => i.id === id ? updated : i))
    await updateItem(id, updated)
  }

  const handleFieldUpdate = async (id: string, field: keyof AppliedCompany, value: string) => {
    const item = items.find(i => i.id === id)
    if (!item || item[field] === value) return

    const updated = { ...item, [field]: value }
    setItems(prev => prev.map(i => i.id === id ? updated : i))
    await updateItem(id, updated)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id)
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id))
      if (expandedId === id) setExpandedId(null)
    }
  }

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">📨</div>
          <h1 className="text-2xl font-bold text-white">지원회사</h1>
          <p className="text-gray-400">
            지원한 회사의 진행 상황을 Google Sheets에 저장하여 관리합니다.
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
          <Link
            to="/"
            className="block text-gray-500 hover:text-gray-400 text-sm"
          >
            &larr; 메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: items.length,
    inProgress: items.filter(i => ['document', 'interview1', 'interview2'].includes(i.status)).length,
    waiting: items.filter(i => i.status === 'waiting').length,
    offers: items.filter(i => i.status === 'offer').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  }

  return (
    <div>
      <PageHeader icon="📨" title="지원회사">
        {spreadsheetUrl && (
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-green-400 transition-colors"
            title="Google Sheets에서 보기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
            </svg>
          </a>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="새 지원 추가"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 bg-gray-800 rounded-xl px-4 py-2">
        <span className="text-lg">📊</span>
        <div className="flex gap-4 text-sm">
          <span className="text-white"><span className="font-bold">{stats.total}</span> 전체</span>
          <span className="text-purple-400"><span className="font-bold">{stats.inProgress}</span> 진행</span>
          <span className="text-yellow-400"><span className="font-bold">{stats.waiting}</span> 대기</span>
          <span className="text-green-400"><span className="font-bold">{stats.offers}</span> 합격</span>
          <span className="text-red-400"><span className="font-bold">{stats.rejected}</span> 불합격</span>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-4 bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="회사명 *"
              value={formData.companyName}
              onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="포지션"
              value={formData.position}
              onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={formData.appliedDate}
              onChange={e => setFormData(prev => ({ ...prev, appliedDate: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="마감일"
              value={formData.deadline}
              onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="채용 URL"
              value={formData.url}
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Google Drive 서류 URL"
              value={formData.driveUrl}
              onChange={e => setFormData(prev => ({ ...prev, driveUrl: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="메모"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
            />
            <textarea
              placeholder="이후 일정 (한 줄에 하나씩, 예: 2026-04-04 필기시험)"
              value={formData.schedule}
              onChange={e => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
              rows={3}
              className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none sm:col-span-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={!formData.companyName.trim() || isSaving}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '저장 중...' : '추가'}
            </button>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && !showForm && (
        <div className="mb-4 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm text-center">
          저장 중...
        </div>
      )}

      {/* List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            아직 지원한 회사가 없습니다. + 버튼으로 추가해보세요.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {items.map(item => {
              const statusConfig = STATUS_CONFIG[item.status]
              const isExpanded = expandedId === item.id
              const scheduleLines = item.schedule ? item.schedule.split('\n').filter(l => l.trim()) : []

              return (
                <div key={item.id}>
                  {/* Main row */}
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 transition-colors">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                      title={isExpanded ? '접기' : '펼치기'}
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Company info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm truncate">{item.companyName}</span>
                        {item.position && (
                          <span className="text-xs text-gray-500 truncate hidden sm:inline">{item.position}</span>
                        )}
                        {scheduleLines.length > 0 && (
                          <span className="text-xs text-gray-600 flex-shrink-0" title={`일정 ${scheduleLines.length}건`}>
                            📅 {scheduleLines.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.appliedDate}</span>
                        {item.deadline && <span>~ {item.deadline}</span>}
                        {item.notes && <span className="truncate">{item.notes}</span>}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>

                    {/* Status change actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      {item.status === 'applied' && (
                        <>
                          <button onClick={() => handleStatusChange(item.id, 'document')} className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded" title="서류 통과">&#10003;</button>
                          <button onClick={() => handleStatusChange(item.id, 'waiting')} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded" title="결과 대기">&#8987;</button>
                          <button onClick={() => handleStatusChange(item.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">&#10007;</button>
                        </>
                      )}
                      {item.status === 'waiting' && (
                        <>
                          <button onClick={() => handleStatusChange(item.id, 'document')} className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded" title="서류 통과">&#10003;</button>
                          <button onClick={() => handleStatusChange(item.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">&#10007;</button>
                        </>
                      )}
                      {item.status === 'document' && (
                        <>
                          <button onClick={() => handleStatusChange(item.id, 'interview1')} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded" title="1차 면접">1</button>
                          <button onClick={() => handleStatusChange(item.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">&#10007;</button>
                        </>
                      )}
                      {item.status === 'interview1' && (
                        <>
                          <button onClick={() => handleStatusChange(item.id, 'interview2')} className="p-1 text-pink-400 hover:bg-pink-500/20 rounded" title="최종 면접">2</button>
                          <button onClick={() => handleStatusChange(item.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">&#10007;</button>
                        </>
                      )}
                      {item.status === 'interview2' && (
                        <>
                          <button onClick={() => handleStatusChange(item.id, 'offer')} className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="합격">&#127881;</button>
                          <button onClick={() => handleStatusChange(item.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">&#10007;</button>
                        </>
                      )}
                      {(item.status === 'offer' || item.status === 'rejected') && (
                        <button onClick={() => handleStatusChange(item.id, 'applied')} className="p-1 text-gray-400 hover:bg-gray-600 rounded" title="리셋">&#8634;</button>
                      )}
                    </div>

                    {/* Drive docs link */}
                    {item.driveUrl ? (
                      <a
                        href={item.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-green-400 hover:text-green-300 flex-shrink-0"
                        title="지원 서류 (Google Drive)"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm-.28 1h4.07L5.43 15H1.36l6.07-10.5zm1 0h7.14l6.07 10.5h-4.07L8.43 4.5zm8.14 1l5.57 9.5h-4.07l-5.57-9.5h4.07zM6.43 16h11.14l-3.28 5.5H9.71L6.43 16z"/>
                        </svg>
                      </a>
                    ) : (
                      <button
                        onClick={() => setExpandedId(item.id)}
                        className="p-1 text-gray-600 hover:text-gray-400 flex-shrink-0"
                        title="서류 링크 추가"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" opacity={0.4}>
                          <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm-.28 1h4.07L5.43 15H1.36l6.07-10.5zm1 0h7.14l6.07 10.5h-4.07L8.43 4.5zm8.14 1l5.57 9.5h-4.07l-5.57-9.5h4.07zM6.43 16h11.14l-3.28 5.5H9.71L6.43 16z"/>
                        </svg>
                      </button>
                    )}

                    {/* URL link */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-500 hover:text-white flex-shrink-0"
                        title="채용 페이지"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded flex-shrink-0"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700/50">
                      <div className="space-y-4 pl-6">
                        {/* Schedule */}
                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            📅 이후 일정 / 할 것
                          </label>
                          {scheduleLines.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {scheduleLines.map((line, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
                                  <span className="text-gray-300">{line.trim()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <textarea
                            defaultValue={item.schedule}
                            onBlur={e => handleFieldUpdate(item.id, 'schedule', e.target.value)}
                            placeholder="한 줄에 하나씩 입력 (예: 2026-04-04 필기시험)"
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-600"
                          />
                        </div>

                        {/* Drive URL */}
                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            📁 지원 서류 (Google Drive)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={item.driveUrl}
                              onBlur={e => handleFieldUpdate(item.id, 'driveUrl', e.target.value)}
                              placeholder="Google Drive 링크를 붙여넣기"
                              className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                            />
                            {item.driveUrl && (
                              <a
                                href={item.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors flex items-center gap-1 flex-shrink-0"
                              >
                                열기
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Notes (editable) */}
                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                            📝 메모
                          </label>
                          <input
                            type="text"
                            defaultValue={item.notes}
                            onBlur={e => handleFieldUpdate(item.id, 'notes', e.target.value)}
                            placeholder="메모"
                            className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pipeline */}
      <div className="mt-4 bg-gray-800 rounded-xl p-3">
        <div className="flex gap-1 overflow-x-auto">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = items.filter(i => i.status === status).length
            return (
              <div key={status} className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${config.bgColor} text-center min-w-16`}>
                <div className={`text-lg font-bold ${config.color}`}>{count}</div>
                <div className="text-xs text-gray-400">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
