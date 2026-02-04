import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface ProfileSite {
  id: string
  name: string
  url: string
  description: string
  category: '필수' | '채용플랫폼' | '개발자' | '네트워킹'
  icon: string
  color: string
}

const PROFILE_SITES: ProfileSite[] = [
  {
    id: 'kosa',
    name: 'KOSA (SW기술자 경력관리)',
    url: 'https://career.sw.or.kr',
    description: '한국소프트웨어산업협회 – SW기술자 경력 증명·관리, 공공 프로젝트 참여 시 필수',
    category: '필수',
    icon: '🏛️',
    color: 'blue',
  },
  {
    id: 'worknet',
    name: '워크넷',
    url: 'https://www.work.go.kr',
    description: '고용노동부 공공 취업 포털 – 이력서 등록, 공공기관·정부 채용 공고 확인',
    category: '필수',
    icon: '🇰🇷',
    color: 'blue',
  },
  {
    id: 'saramin',
    name: '사람인',
    url: 'https://www.saramin.co.kr',
    description: '국내 최대 채용 플랫폼 – 이력서·경력기술서 관리, 기업 지원, AI 매칭',
    category: '채용플랫폼',
    icon: '💼',
    color: 'emerald',
  },
  {
    id: 'jobkorea',
    name: '잡코리아',
    url: 'https://www.jobkorea.co.kr',
    description: '대기업·공채 중심 – 이력서 등록, 채용 공고 확인, 기업 리뷰',
    category: '채용플랫폼',
    icon: '🏢',
    color: 'emerald',
  },
  {
    id: 'wanted',
    name: '원티드',
    url: 'https://www.wanted.co.kr',
    description: 'IT/스타트업 중심 – 이력서 관리, 합격보상금, 직군별 채용 정보',
    category: '채용플랫폼',
    icon: '🎯',
    color: 'emerald',
  },
  {
    id: 'incruit',
    name: '인크루트',
    url: 'https://www.incruit.com',
    description: '종합 채용 포털 – 이력서 등록, 채용 공고, 연봉 정보',
    category: '채용플랫폼',
    icon: '📋',
    color: 'emerald',
  },
  {
    id: 'rocketpunch',
    name: '로켓펀치',
    url: 'https://www.rocketpunch.com',
    description: '스타트업 특화 – 프로필 관리, 네트워킹, 스타트업 채용 공고',
    category: '채용플랫폼',
    icon: '🚀',
    color: 'emerald',
  },
  {
    id: 'programmers',
    name: '프로그래머스',
    url: 'https://programmers.co.kr',
    description: '개발자 코딩테스트·채용 플랫폼 – 프로필 관리, 스킬 인증, 기업 매칭',
    category: '개발자',
    icon: '💻',
    color: 'purple',
  },
  {
    id: 'rallit',
    name: '랠릿',
    url: 'https://www.rallit.com',
    description: 'IT 전문 이력서 플랫폼 – 경력 프로필 관리, 이력서 공유, 스카우트',
    category: '개발자',
    icon: '📄',
    color: 'purple',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    description: '코드 포트폴리오 – 프로필 README, 기여 활동, 오픈소스 프로젝트',
    category: '개발자',
    icon: '🐙',
    color: 'purple',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com',
    description: '글로벌 비즈니스 네트워크 – 영문 이력서, 글로벌 채용, 인맥 관리',
    category: '네트워킹',
    icon: '🌐',
    color: 'cyan',
  },
]

const CATEGORY_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  '필수': { label: '필수 관리', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  '채용플랫폼': { label: '채용 플랫폼', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
  '개발자': { label: '개발자 특화', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  '네트워킹': { label: '네트워킹', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' },
}

const CARD_COLORS: Record<string, string> = {
  blue: 'border-blue-500/30 hover:border-blue-500/50',
  emerald: 'border-emerald-500/30 hover:border-emerald-500/50',
  purple: 'border-purple-500/30 hover:border-purple-500/50',
  cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
}

export default function ExternalProfilesPage() {
  const [filter, setFilter] = useState<string>('전체')
  const categories = ['전체', '필수', '채용플랫폼', '개발자', '네트워킹']

  const filteredSites = filter === '전체'
    ? PROFILE_SITES
    : PROFILE_SITES.filter(s => s.category === filter)

  const grouped = filteredSites.reduce<Record<string, ProfileSite[]>>((acc, site) => {
    if (!acc[site.category]) acc[site.category] = []
    acc[site.category].push(site)
    return acc
  }, {})

  return (
    <div>
      <PageHeader icon="🔗" title="외부 이력 관리" />

      {/* 안내 */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-4 mb-4">
        <div className="text-white font-bold text-lg mb-1">외부 프로필 관리 허브</div>
        <p className="text-gray-400 text-sm">
          각 사이트의 이력서·프로필을 최신 상태로 유지하세요. 경력기술서 업데이트 시 아래 사이트들도 함께 갱신하면 좋습니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {cat === '전체' ? '전체' : CATEGORY_CONFIG[cat]?.label || cat}
          </button>
        ))}
      </div>

      {/* 사이트 목록 */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, sites]) => {
          const config = CATEGORY_CONFIG[category]
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config?.bgColor} ${config?.textColor}`}>
                  {config?.label || category}
                </span>
                <span className="text-gray-600 text-xs">{sites.length}개</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sites.map(site => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-gray-800 rounded-xl p-4 border transition-all hover:bg-gray-750 ${CARD_COLORS[site.color]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{site.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-sm truncate">{site.name}</span>
                          <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{site.description}</p>
                        <div className="mt-2 text-gray-600 text-xs truncate">{site.url}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
