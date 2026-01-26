import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

type ApplicationStatus =
  | 'target'      // 타겟 회사
  | 'preparing'   // 준비 중
  | 'applied'     // 지원 완료
  | 'document'    // 서류 통과
  | 'interview1'  // 1차 면접
  | 'interview2'  // 2차/최종 면접
  | 'offer'       // 합격
  | 'rejected'    // 불합격

interface Company {
  id: string
  name: string
  logo: string
  tier: 'tier1' | 'tier2' | 'tier3'
  position: string
  status: ApplicationStatus
  deadline?: string
  appliedDate?: string
  notes: string
  salary?: string
  techStack: string[]
  url?: string
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  target: { label: '타겟', color: 'text-gray-400', bgColor: 'bg-gray-600' },
  preparing: { label: '준비 중', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  applied: { label: '지원 완료', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  document: { label: '서류 통과', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  interview1: { label: '1차 면접', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  interview2: { label: '최종 면접', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  offer: { label: '합격', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  rejected: { label: '불합격', color: 'text-red-400', bgColor: 'bg-red-500/20' },
}

const INITIAL_COMPANIES: Company[] = [
  // Tier 1 - 최상위 IT 대기업
  {
    id: '1',
    name: 'Naver',
    logo: '🟢',
    tier: 'tier1',
    position: '프론트엔드 개발자',
    status: 'target',
    notes: '네이버 신입 공채, 연봉 5000만+',
    salary: '5,000만+',
    techStack: ['React', 'TypeScript', 'Node.js'],
    url: 'https://recruit.navercorp.com',
  },
  {
    id: '2',
    name: 'Kakao',
    logo: '💬',
    tier: 'tier1',
    position: '소프트웨어 엔지니어',
    status: 'target',
    notes: '카카오 상시 채용',
    salary: '5,000만+',
    techStack: ['Kotlin', 'Spring', 'React'],
    url: 'https://careers.kakao.com',
  },
  {
    id: '3',
    name: 'Line',
    logo: '💚',
    tier: 'tier1',
    position: '서버 개발자',
    status: 'target',
    notes: '라인 플러스 신입',
    salary: '5,500만+',
    techStack: ['Java', 'Kotlin', 'Spring Boot'],
    url: 'https://careers.linecorp.com',
  },
  {
    id: '4',
    name: 'Coupang',
    logo: '🚀',
    tier: 'tier1',
    position: 'Software Engineer',
    status: 'target',
    notes: '쿠팡 상시 채용, 영어 면접',
    salary: '6,000만+',
    techStack: ['Java', 'AWS', 'React'],
    url: 'https://www.coupang.jobs',
  },
  {
    id: '5',
    name: 'Toss',
    logo: '💙',
    tier: 'tier1',
    position: '프론트엔드 개발자',
    status: 'target',
    notes: '토스 NEXT 개발자 채용',
    salary: '5,500만+',
    techStack: ['React', 'TypeScript', 'Next.js'],
    url: 'https://toss.im/career',
  },
  // Tier 2 - 대기업/유니콘
  {
    id: '6',
    name: '배달의민족',
    logo: '🍔',
    tier: 'tier2',
    position: '백엔드 개발자',
    status: 'target',
    notes: '우아한형제들',
    salary: '5,000만+',
    techStack: ['Java', 'Kotlin', 'Spring'],
    url: 'https://career.woowahan.com',
  },
  {
    id: '7',
    name: '당근',
    logo: '🥕',
    tier: 'tier2',
    position: '소프트웨어 엔지니어',
    status: 'target',
    notes: '당근마켓 채용',
    salary: '5,000만+',
    techStack: ['Go', 'Kotlin', 'React Native'],
    url: 'https://about.daangn.com/jobs',
  },
  {
    id: '8',
    name: '토스페이먼츠',
    logo: '💳',
    tier: 'tier2',
    position: '결제 시스템 개발자',
    status: 'target',
    notes: 'PG사 최고 연봉',
    salary: '5,500만+',
    techStack: ['Java', 'Kotlin', 'Spring Boot'],
    url: 'https://tosspayments-career.oopy.io',
  },
  {
    id: '9',
    name: '카카오뱅크',
    logo: '🏦',
    tier: 'tier2',
    position: '풀스택 개발자',
    status: 'target',
    notes: '금융권 IT',
    salary: '5,000만+',
    techStack: ['Java', 'Spring', 'React'],
    url: 'https://kakaobank.recruiter.co.kr',
  },
  {
    id: '10',
    name: '크래프톤',
    logo: '🎮',
    tier: 'tier2',
    position: '게임 클라이언트 개발자',
    status: 'target',
    notes: '배틀그라운드',
    salary: '5,500만+',
    techStack: ['C++', 'Unreal Engine'],
    url: 'https://careers.krafton.com',
  },
  // Tier 3 - 성장 스타트업
  {
    id: '11',
    name: '야놀자',
    logo: '🏨',
    tier: 'tier3',
    position: '백엔드 개발자',
    status: 'target',
    notes: '여행/숙박 플랫폼',
    salary: '4,500만+',
    techStack: ['Java', 'Spring', 'AWS'],
    url: 'https://careers.yanolja.co',
  },
  {
    id: '12',
    name: '무신사',
    logo: '👕',
    tier: 'tier3',
    position: '프론트엔드 개발자',
    status: 'target',
    notes: '패션 커머스 1위',
    salary: '4,500만+',
    techStack: ['React', 'TypeScript', 'Next.js'],
    url: 'https://career.musinsa.com',
  },
  {
    id: '13',
    name: '직방',
    logo: '🏠',
    tier: 'tier3',
    position: '소프트웨어 엔지니어',
    status: 'target',
    notes: '부동산 프롭테크',
    salary: '4,500만+',
    techStack: ['TypeScript', 'React', 'Node.js'],
    url: 'https://zigbang.recruiter.co.kr',
  },
  {
    id: '14',
    name: '리디',
    logo: '📖',
    tier: 'tier3',
    position: '웹 개발자',
    status: 'target',
    notes: '전자책 플랫폼',
    salary: '4,500만+',
    techStack: ['React', 'TypeScript', 'Python'],
    url: 'https://ridi.career.greetinghr.com',
  },
  {
    id: '15',
    name: '버킷플레이스',
    logo: '🏡',
    tier: 'tier3',
    position: '프론트엔드 개발자',
    status: 'target',
    notes: '오늘의집',
    salary: '4,500만+',
    techStack: ['React', 'TypeScript', 'GraphQL'],
    url: 'https://careers.bucketplace.net',
  },
]

export function ApplyPage() {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [selectedTier, setSelectedTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    if (selectedTier !== 'all' && c.tier !== selectedTier) return false
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false
    return true
  })

  // Stats
  const stats = {
    total: companies.length,
    applied: companies.filter(c => !['target', 'preparing'].includes(c.status)).length,
    inProgress: companies.filter(c => ['document', 'interview1', 'interview2'].includes(c.status)).length,
    offers: companies.filter(c => c.status === 'offer').length,
  }

  // Update company status
  const updateStatus = (id: string, status: ApplicationStatus) => {
    setCompanies(prev => prev.map(c =>
      c.id === id ? { ...c, status, appliedDate: status === 'applied' ? new Date().toISOString().split('T')[0] : c.appliedDate } : c
    ))
  }

  // Update company notes
  const updateNotes = (id: string, notes: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, notes } : c))
    setEditingId(null)
  }

  // Get tier label
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'tier1': return { label: 'Tier 1', color: 'text-yellow-400', desc: '최상위 IT 대기업' }
      case 'tier2': return { label: 'Tier 2', color: 'text-blue-400', desc: '대기업/유니콘' }
      case 'tier3': return { label: 'Tier 3', color: 'text-green-400', desc: '성장 스타트업' }
      default: return { label: '', color: '', desc: '' }
    }
  }

  return (
    <div>
      <PageHeader icon="🎯" title="지원 관리">
        <button
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="회사 추가 (준비 중)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      {/* Goal Banner */}
      <div className="mb-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="text-white font-bold text-lg">최종 목표: IT 대기업 입사</div>
            <div className="text-gray-400 text-sm">체계적인 준비와 지원으로 꿈의 회사에 도전합니다</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500">타겟 회사</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.applied}</div>
          <div className="text-xs text-gray-500">지원 완료</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.inProgress}</div>
          <div className="text-xs text-gray-500">진행 중</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.offers}</div>
          <div className="text-xs text-gray-500">합격</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value as typeof selectedTier)}
          className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 티어</option>
          <option value="tier1">Tier 1 - 최상위</option>
          <option value="tier2">Tier 2 - 대기업</option>
          <option value="tier3">Tier 3 - 스타트업</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
          className="px-3 py-2 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 상태</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Company List */}
      <div className="space-y-3">
        {filteredCompanies.map(company => {
          const tierInfo = getTierLabel(company.tier)
          const statusConfig = STATUS_CONFIG[company.status]

          return (
            <div key={company.id} className="bg-gray-800 rounded-2xl p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{company.logo}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{company.name}</span>
                      <span className={`text-xs ${tierInfo.color}`}>{tierInfo.label}</span>
                    </div>
                    <div className="text-sm text-gray-400">{company.position}</div>
                  </div>
                </div>
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {company.techStack.map(tech => (
                  <span key={tech} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                    {tech}
                  </span>
                ))}
                {company.salary && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                    {company.salary}
                  </span>
                )}
              </div>

              {/* Notes */}
              {editingId === company.id ? (
                <div className="mb-3">
                  <textarea
                    defaultValue={company.notes}
                    onBlur={(e) => updateNotes(company.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  onClick={() => setEditingId(company.id)}
                  className="mb-3 text-sm text-gray-400 cursor-pointer hover:text-gray-300"
                >
                  {company.notes || '메모를 추가하세요...'}
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <div className="flex gap-1">
                  {company.status === 'target' && (
                    <button
                      onClick={() => updateStatus(company.id, 'preparing')}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/30"
                    >
                      준비 시작
                    </button>
                  )}
                  {company.status === 'preparing' && (
                    <button
                      onClick={() => updateStatus(company.id, 'applied')}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30"
                    >
                      지원 완료
                    </button>
                  )}
                  {company.status === 'applied' && (
                    <>
                      <button
                        onClick={() => updateStatus(company.id, 'document')}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30"
                      >
                        서류 통과
                      </button>
                      <button
                        onClick={() => updateStatus(company.id, 'rejected')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
                      >
                        불합격
                      </button>
                    </>
                  )}
                  {company.status === 'document' && (
                    <>
                      <button
                        onClick={() => updateStatus(company.id, 'interview1')}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30"
                      >
                        1차 면접
                      </button>
                      <button
                        onClick={() => updateStatus(company.id, 'rejected')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
                      >
                        불합격
                      </button>
                    </>
                  )}
                  {company.status === 'interview1' && (
                    <>
                      <button
                        onClick={() => updateStatus(company.id, 'interview2')}
                        className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-xs hover:bg-pink-500/30"
                      >
                        최종 면접
                      </button>
                      <button
                        onClick={() => updateStatus(company.id, 'rejected')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
                      >
                        불합격
                      </button>
                    </>
                  )}
                  {company.status === 'interview2' && (
                    <>
                      <button
                        onClick={() => updateStatus(company.id, 'offer')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30"
                      >
                        합격!
                      </button>
                      <button
                        onClick={() => updateStatus(company.id, 'rejected')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30"
                      >
                        불합격
                      </button>
                    </>
                  )}
                  {(company.status === 'offer' || company.status === 'rejected') && (
                    <button
                      onClick={() => updateStatus(company.id, 'target')}
                      className="px-3 py-1 bg-gray-600 text-gray-300 rounded-lg text-xs hover:bg-gray-500"
                    >
                      리셋
                    </button>
                  )}
                </div>
              </div>

              {/* Applied Date */}
              {company.appliedDate && (
                <div className="mt-2 text-xs text-gray-500">
                  지원일: {company.appliedDate}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Pipeline */}
      <div className="mt-6 bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-4">지원 파이프라인</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = companies.filter(c => c.status === status).length
            return (
              <div key={status} className={`flex-shrink-0 w-24 p-3 rounded-xl ${config.bgColor}`}>
                <div className={`text-2xl font-bold ${config.color}`}>{count}</div>
                <div className="text-xs text-gray-400">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">취업 준비 체크리스트</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <span>☐</span> 이력서/자기소개서 작성 및 첨삭
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>☐</span> 포트폴리오 정리 (GitHub, 프로젝트)
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>☐</span> 코딩테스트 준비 (알고리즘, 자료구조)
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>☐</span> 기술 면접 준비 (CS 기초, 프로젝트 경험)
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>☐</span> 인성 면접 준비 (STAR 기법)
          </div>
        </div>
      </div>
    </div>
  )
}
