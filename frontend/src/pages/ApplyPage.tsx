import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

// 공고 타입
interface JobPosting {
  id: string
  date: string
  companyName: string
  position: string
  url: string
  deadline: string
  notes: string
  source?: string  // AI가 찾은 출처
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
    notes: record.notes || '',
    source: record.source || ''
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
    record.notes,
    record.source || ''
  ]
}

// 마감일 상태 계산
function getDeadlineStatus(deadline: string): { color: string; label: string } | null {
  if (!deadline || deadline === '상시채용') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(deadline.split(' ')[0])
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { color: 'text-gray-500', label: '마감됨' }
  if (diffDays === 0) return { color: 'text-red-400', label: '오늘 마감' }
  if (diffDays <= 3) return { color: 'text-orange-400', label: `D-${diffDays}` }
  if (diffDays <= 7) return { color: 'text-yellow-400', label: `D-${diffDays}` }
  return { color: 'text-green-400', label: `D-${diffDays}` }
}

export function ApplyPage() {
  // Google Sheets 연동
  const {
    data: jobPostings,
    isLoading,
    isSignedIn,
    signIn,
    spreadsheetUrl
  } = useLifeOpsSheets<JobPosting>(
    SHEET_CONFIGS.experience,
    jobPostingRowToRecord,
    jobPostingRecordToRow
  )

  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null)

  // 마감일순 정렬 (빠른 마감일 순)
  const sortedPostings = [...jobPostings].sort((a, b) => {
    if (!a.deadline || a.deadline === '상시채용') return 1
    if (!b.deadline || b.deadline === '상시채용') return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🎯</div>
          <h1 className="text-2xl font-bold text-white">채용공고</h1>
          <p className="text-gray-400">
            AI가 찾아주는 맞춤 채용공고를 확인하세요
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
          <Link to="/" className="block text-gray-500 hover:text-gray-400 text-sm">
            ← 메인으로 돌아가기
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
          <p className="text-gray-400">채용공고를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🎯" title="채용공고">
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

      {/* 검색 조건 요약 */}
      <div className="mb-4 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="text-white font-medium">AI 검색 조건</span>
          </div>
          <span className="text-xs text-gray-500">Claude Code에서 /job 명령어로 검색</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
            광주/전남
          </span>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
            일본
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
            IT/개발
          </span>
        </div>
      </div>

      {/* 공고 목록 */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>📋</span>
            채용공고
            <span className="text-sm font-normal text-gray-500">({jobPostings.length}개)</span>
          </h3>
        </div>

        {sortedPostings.length > 0 ? (
          <div className="space-y-2">
            {sortedPostings.map((posting) => {
              const deadlineStatus = getDeadlineStatus(posting.deadline)

              return (
                <button
                  key={posting.id}
                  onClick={() => setSelectedPosting(posting)}
                  className="w-full p-4 rounded-xl bg-gray-700/30 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-white">{posting.companyName}</span>
                        {deadlineStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${deadlineStatus.color}`}>
                            {deadlineStatus.label}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">{posting.position || '포지션 미정'}</p>
                      {posting.source && (
                        <p className="text-gray-500 text-xs mt-1">출처: {posting.source}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {posting.notes && (
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{posting.notes}</p>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 mb-2">아직 채용공고가 없습니다</p>
            <p className="text-gray-500 text-sm">Claude Code에서 <code className="bg-gray-700 px-2 py-0.5 rounded">/job</code> 명령어로 검색하세요</p>
          </div>
        )}
      </div>

      {/* 공고 상세 모달 */}
      {selectedPosting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedPosting(null)}
        >
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPosting.companyName}</h2>
                <p className="text-gray-400 text-sm">{selectedPosting.position || '포지션 미정'}</p>
              </div>
              <button
                onClick={() => setSelectedPosting(null)}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-4 space-y-4">
              {/* 마감일 */}
              {selectedPosting.deadline && (
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-gray-400 text-xs">지원마감</p>
                    <p className="text-white font-medium">{selectedPosting.deadline}</p>
                  </div>
                </div>
              )}

              {/* 조사내용 */}
              {selectedPosting.notes && (
                <div>
                  <h4 className="text-gray-400 text-xs mb-2">상세 정보</h4>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedPosting.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>수집일: {selectedPosting.date}</span>
                {selectedPosting.source && <span>출처: {selectedPosting.source}</span>}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700">
              {selectedPosting.url ? (
                <a
                  href={selectedPosting.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  공고 페이지 열기
                </a>
              ) : (
                <p className="text-center text-gray-500 text-sm">공고 링크가 없습니다</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
