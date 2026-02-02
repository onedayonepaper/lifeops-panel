import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { markTaskComplete } from '../utils/routineTaskUtils'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

// 오늘의 미션 - 공고 1개 찾기
interface JobPosting {
  id: string
  date: string
  companyName: string
  position: string
  url: string
  deadline: string  // 지원마감일
  notes: string  // 조사내용
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// Row 변환 함수들
function jobPostingRowToRecord(row: string[], headers: string[]): JobPosting {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => {
    record[header] = row[index] || ''
  })
  return {
    id: record.id || Date.now().toString(),
    date: record.date || '',
    companyName: record.companyName || '',
    position: record.position || '',
    url: record.url || '',
    deadline: record.deadline || '',
    notes: record.notes || ''
  }
}

function jobPostingRecordToRow(record: JobPosting): string[] {
  return [
    record.id,
    record.date,
    record.companyName,
    record.position,
    record.url,
    record.deadline,
    record.notes
  ]
}

export function ApplyPage() {
  const navigate = useNavigate()

  // Google Sheets 연동 - 공고 수집
  const {
    data: jobPostings,
    isLoading: expLoading,
    isSaving: expSaving,
    error: expError,
    isSignedIn,
    signIn,
    addItem: addJobPosting,
    updateItem: updateJobPosting,
    deleteItem: deleteJobPosting,
    spreadsheetUrl
  } = useLifeOpsSheets<JobPosting>(
    SHEET_CONFIGS.experience,
    jobPostingRowToRecord,
    jobPostingRecordToRow
  )

  // 오늘의 미션 상태
  const [currentJobPosting, setCurrentJobPosting] = useState({
    companyName: '한국인터넷진흥원(KISA)',
    position: '기간제근로자(전문계약직)',
    url: 'https://www.kisa.or.kr/404/form?postSeq=1383',
    deadline: '2026-02-02 17:00',
    notes: `[2026년 1차 기간제근로자(전문계약직) 채용]

■ 예상 모집분야 (2025년 기준 참고)
- 정책: 개인정보, 국제, 법제
- 기술: R&D, 보안 엔지니어, 정보보안, 보안컨설팅
- 경영: 경영, 경영정보, 사업기획

■ 자격 가산점
- 회계사/변호사/기술사/노무사: 5점
- CISSP, CISA, PMP, ISMS-P, 정보보안기사: 3점
- TOEIC 850점 이상: 2점

■ 근무지: 나주 본원 / 서울 사무소
■ 입사지원: https://kisa.applyin.co.kr`
  })
  const [isMissionExpanded, setIsMissionExpanded] = useState(true)
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingPosting, setEditingPosting] = useState<JobPosting | null>(null)

  // 오늘 작성한 공고 확인
  const todayJobPostings = jobPostings.filter(e => e.date === getTodayKey())
  const hasCompletedToday = todayJobPostings.length > 0

  // 공고 저장 (항상 새로 추가)
  const saveCurrentJobPosting = useCallback(async (shouldGoBack = false) => {
    if (!currentJobPosting.companyName.trim() || !currentJobPosting.url.trim()) return

    const newJobPosting: JobPosting = {
      id: Date.now().toString(),
      date: getTodayKey(),
      ...currentJobPosting
    }

    // 항상 새로 추가
    await addJobPosting(newJobPosting)

    // 라운드 태스크 완료 처리
    markTaskComplete('r1-1')

    // 입력 초기화
    setCurrentJobPosting({
      companyName: '',
      position: '',
      url: '',
      deadline: '',
      notes: ''
    })

    // 오늘 카드로 돌아가기
    if (shouldGoBack) {
      navigate('/')
    }
  }, [currentJobPosting, addJobPosting, navigate])

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🎯</div>
          <h1 className="text-2xl font-bold text-white">지원 관리</h1>
          <p className="text-gray-400">
            채용 공고를 수집하고 관리합니다. Google Sheets에 저장됩니다.
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
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 로딩 화면
  if (expLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🎯" title="지원 관리">
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
        <Link
          to="/company"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title="회사 관리"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </Link>
      </PageHeader>

      {/* 에러 표시 */}
      {expError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {expError}
        </div>
      )}

      {/* 내가 가고자 하는 곳 */}
      <div className="mb-4 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🎯</span>
          <h2 className="text-white font-bold text-lg">내가 가고자 하는 곳</h2>
        </div>
        <div className="space-y-2 text-gray-300 text-sm leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">▸</span>
            <p><span className="text-white font-medium">지역:</span> 광주광역시 또는 전라남도 내 규모 있는 기업</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">▸</span>
            <p><span className="text-white font-medium">해외:</span> 일본 소재 기업 (현지 취업)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">▸</span>
            <p><span className="text-white font-medium">직군:</span> IT · 전산 분야 (개발, 시스템 운영, 기술지원 등)</p>
          </div>
        </div>
      </div>

      {/* 오늘의 미션 - 공고 찾기 */}
      <div className={`mb-4 bg-gradient-to-r ${hasCompletedToday ? 'from-green-600/20 to-emerald-600/20 border-green-500/30' : 'from-orange-600/20 to-yellow-600/20 border-orange-500/30'} border rounded-2xl overflow-hidden`}>
        {/* 헤더 */}
        <button
          onClick={() => setIsMissionExpanded(!isMissionExpanded)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{hasCompletedToday ? '✅' : '🔍'}</span>
            <div className="text-left">
              <div className="text-white font-bold flex items-center gap-2">
                공고 찾기
                {hasCompletedToday && (
                  <span className="text-xs font-normal px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                    오늘 {todayJobPostings.length}개 저장
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                공고 링크 저장 + 요구사항 3줄
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs hover:bg-gray-600/50"
            >
              ← 오늘 카드
            </Link>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isMissionExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* 입력 폼 */}
        {isMissionExpanded && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-orange-400 mb-1 block">회사명</label>
                    <input
                      type="text"
                      placeholder="예: 네이버"
                      value={currentJobPosting.companyName}
                      onChange={(e) => setCurrentJobPosting(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-400 mb-1 block">포지션</label>
                    <input
                      type="text"
                      placeholder="예: 프론트엔드 개발자"
                      value={currentJobPosting.position}
                      onChange={(e) => setCurrentJobPosting(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-purple-400 mb-1 block">공고 링크</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={currentJobPosting.url}
                      onChange={(e) => setCurrentJobPosting(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-red-400 mb-1 block">지원마감일</label>
                    <input
                      type="text"
                      placeholder="예: 2025-02-28 또는 상시채용"
                      value={currentJobPosting.deadline}
                      onChange={(e) => setCurrentJobPosting(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-green-400 mb-1 block">조사내용</label>
                  <textarea
                    placeholder="요구사항, 우대사항, 회사 정보 등 자유롭게 기록..."
                    value={currentJobPosting.notes}
                    onChange={(e) => setCurrentJobPosting(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {currentJobPosting.companyName && (
                    <button
                      onClick={() => setCurrentJobPosting({ companyName: '', position: '', url: '', deadline: '', notes: '' })}
                      className="px-4 py-2 text-gray-400 text-sm hover:text-white"
                    >
                      취소
                    </button>
                  )}
                  <button
                    onClick={() => saveCurrentJobPosting(false)}
                    disabled={!currentJobPosting.companyName.trim() || !currentJobPosting.url.trim() || expSaving}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {expSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => saveCurrentJobPosting(false)}
                    disabled={!currentJobPosting.companyName.trim() || !currentJobPosting.url.trim() || expSaving}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    ✅ 완료
                  </button>
                </div>
          </div>
        )}
      </div>

      {/* 수집한 공고 모음 */}
      <div className="mt-4 bg-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>📋</span> 저장한 공고
            <span className="text-sm font-normal text-gray-500">({jobPostings.length}개)</span>
          </h3>
        </div>
        {jobPostings.length > 0 ? (
          <div className="space-y-2">
            {jobPostings.map((posting) => (
              <button
                key={posting.id}
                onClick={() => setSelectedPosting(posting)}
                className={`w-full p-3 rounded-xl border text-left transition-colors hover:bg-gray-700/50 ${
                  posting.date === getTodayKey()
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-700/30 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{posting.companyName}</span>
                    <span className="text-gray-500 text-sm">| {posting.position || '포지션 미입력'}</span>
                    {posting.date === getTodayKey() && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        오늘
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-gray-500">{posting.date}</span>
                  {posting.deadline && (
                    <span className="text-red-400 flex items-center gap-1">
                      <span>⏰</span> 마감: {posting.deadline}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>아직 저장한 공고가 없습니다</p>
            <p className="text-sm mt-1">위에서 공고를 찾아 저장해보세요</p>
          </div>
        )}
      </div>

      {/* 회사 찾기 - 취업 사이트 바로가기 */}
      <div className="mt-4 bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
          <span>🔍</span> 회사 찾기
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <a
            href="https://www.saramin.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">💼</span>
            <span className="text-white text-sm font-medium">사람인</span>
          </a>
          <a
            href="https://www.jobkorea.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">🏢</span>
            <span className="text-white text-sm font-medium">잡코리아</span>
          </a>
          <a
            href="https://www.wanted.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">🚀</span>
            <span className="text-white text-sm font-medium">원티드</span>
          </a>
          <a
            href="https://www.jumpit.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">💻</span>
            <span className="text-white text-sm font-medium">점핏</span>
          </a>
          <a
            href="https://programmers.co.kr/job"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">👨‍💻</span>
            <span className="text-white text-sm font-medium">프로그래머스</span>
          </a>
          <a
            href="https://www.rocketpunch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">🎯</span>
            <span className="text-white text-sm font-medium">로켓펀치</span>
          </a>
          <a
            href="https://www.linkedin.com/jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <span className="text-xl">💙</span>
            <span className="text-white text-sm font-medium">링크드인</span>
          </a>
        </div>
      </div>

      {/* 공고 상세 모달 */}
      {selectedPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => { setSelectedPosting(null); setIsEditing(false); setEditingPosting(null); }}>
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                {isEditing && editingPosting ? (
                  <input
                    type="text"
                    value={editingPosting.companyName}
                    onChange={(e) => setEditingPosting({ ...editingPosting, companyName: e.target.value })}
                    className="text-xl font-bold text-white bg-gray-700 rounded-lg px-2 py-1 w-full"
                    placeholder="회사명"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{selectedPosting.companyName}</h2>
                )}
                {isEditing && editingPosting ? (
                  <input
                    type="text"
                    value={editingPosting.position}
                    onChange={(e) => setEditingPosting({ ...editingPosting, position: e.target.value })}
                    className="text-sm text-gray-300 bg-gray-700 rounded-lg px-2 py-1 w-full mt-1"
                    placeholder="포지션"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">{selectedPosting.position || '포지션 미입력'}</p>
                )}
              </div>
              <button
                onClick={() => { setSelectedPosting(null); setIsEditing(false); setEditingPosting(null); }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-4 space-y-4">
              {/* 날짜 */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">수집일:</span>
                <span className={selectedPosting.date === getTodayKey() ? 'text-green-400' : 'text-gray-300'}>
                  {selectedPosting.date}
                  {selectedPosting.date === getTodayKey() && ' (오늘)'}
                </span>
              </div>

              {/* 공고 링크 */}
              <div>
                <label className="text-xs text-purple-400 block mb-1">공고 링크</label>
                {isEditing && editingPosting ? (
                  <input
                    type="url"
                    value={editingPosting.url}
                    onChange={(e) => setEditingPosting({ ...editingPosting, url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                    placeholder="https://..."
                  />
                ) : selectedPosting.url ? (
                  <a
                    href={selectedPosting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 break-all"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {selectedPosting.url}
                  </a>
                ) : (
                  <span className="text-gray-500">(미입력)</span>
                )}
              </div>

              {/* 지원마감일 */}
              <div>
                <label className="text-xs text-red-400 block mb-1">지원마감일</label>
                {isEditing && editingPosting ? (
                  <input
                    type="text"
                    value={editingPosting.deadline}
                    onChange={(e) => setEditingPosting({ ...editingPosting, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                    placeholder="예: 2025-02-28 또는 상시채용"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {selectedPosting.deadline || '(미입력)'}
                  </span>
                )}
              </div>

              {/* 조사내용 */}
              <div>
                <label className="text-xs text-green-400 block mb-2">조사내용</label>
                {isEditing && editingPosting ? (
                  <textarea
                    value={editingPosting.notes}
                    onChange={(e) => setEditingPosting({ ...editingPosting, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm resize-none"
                    placeholder="요구사항, 우대사항, 회사 정보 등..."
                  />
                ) : (
                  <div className="bg-gray-700/30 rounded-xl p-3">
                    {selectedPosting.notes ? (
                      <div className="text-gray-300 whitespace-pre-wrap">{selectedPosting.notes}</div>
                    ) : (
                      <div className="text-gray-500">(미입력)</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 space-y-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setEditingPosting(null); }}
                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      if (editingPosting) {
                        await updateJobPosting(editingPosting.id, editingPosting)
                        setSelectedPosting(editingPosting)
                        setIsEditing(false)
                        setEditingPosting(null)
                      }
                    }}
                    disabled={expSaving}
                    className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {expSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setEditingPosting({ ...selectedPosting })
                      }}
                      className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      수정
                    </button>
                    <button
                      onClick={() => {
                        const text = `[${selectedPosting.companyName} - ${selectedPosting.position}]\n링크: ${selectedPosting.url}${selectedPosting.deadline ? `\n마감: ${selectedPosting.deadline}` : ''}${selectedPosting.notes ? `\n\n조사내용:\n${selectedPosting.notes}` : ''}`
                        navigator.clipboard.writeText(text)
                        alert('클립보드에 복사되었습니다!')
                      }}
                      className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      복사
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {selectedPosting.url && (
                      <a
                        href={selectedPosting.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        공고 보기
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm('이 공고를 삭제할까요?')) {
                          await deleteJobPosting(selectedPosting.id)
                          setSelectedPosting(null)
                        }
                      }}
                      className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
        </div>
      )}
    </div>
  )
}
