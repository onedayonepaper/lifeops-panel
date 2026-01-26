import { Link } from 'react-router-dom'

interface Company {
  id: string
  name: string
  tier: 'tier1' | 'tier2' | 'tier3'
  status: 'target' | 'preparing' | 'applied' | 'document' | 'interview1' | 'interview2' | 'offer' | 'rejected'
}

// Same initial data as ApplyPage for consistency
const COMPANIES: Company[] = [
  { id: '1', name: '네이버', tier: 'tier1', status: 'target' },
  { id: '2', name: '카카오', tier: 'tier1', status: 'target' },
  { id: '3', name: '라인', tier: 'tier1', status: 'target' },
  { id: '4', name: '쿠팡', tier: 'tier1', status: 'target' },
  { id: '5', name: '토스', tier: 'tier1', status: 'target' },
  { id: '6', name: '배달의민족', tier: 'tier2', status: 'target' },
  { id: '7', name: '당근', tier: 'tier2', status: 'target' },
  { id: '8', name: '토스페이먼츠', tier: 'tier2', status: 'target' },
  { id: '9', name: '카카오뱅크', tier: 'tier2', status: 'target' },
  { id: '10', name: '크래프톤', tier: 'tier2', status: 'target' },
  { id: '11', name: '야놀자', tier: 'tier3', status: 'target' },
  { id: '12', name: '무신사', tier: 'tier3', status: 'target' },
  { id: '13', name: '직방', tier: 'tier3', status: 'target' },
  { id: '14', name: '리디', tier: 'tier3', status: 'target' },
  { id: '15', name: '버킷플레이스', tier: 'tier3', status: 'target' },
]

const STATUS_CONFIG = {
  target: { label: '목표', color: 'bg-gray-500' },
  preparing: { label: '준비 중', color: 'bg-yellow-500' },
  applied: { label: '지원 완료', color: 'bg-blue-500' },
  document: { label: '서류 전형', color: 'bg-purple-500' },
  interview1: { label: '1차 면접', color: 'bg-indigo-500' },
  interview2: { label: '2차 면접', color: 'bg-pink-500' },
  offer: { label: '합격', color: 'bg-green-500' },
  rejected: { label: '불합격', color: 'bg-red-500' },
}

const TIER_LABELS = {
  tier1: { label: 'Tier 1', color: 'text-yellow-400' },
  tier2: { label: 'Tier 2', color: 'text-blue-400' },
  tier3: { label: 'Tier 3', color: 'text-gray-400' },
}

export function ApplyCard() {
  // In real app, this would come from shared state/context
  const companies = COMPANIES

  const stats = {
    total: companies.length,
    applied: companies.filter(c => !['target', 'preparing'].includes(c.status)).length,
    inProgress: companies.filter(c => ['document', 'interview1', 'interview2'].includes(c.status)).length,
    offers: companies.filter(c => c.status === 'offer').length,
  }

  // Get companies in active stages (not just target)
  const activeCompanies = companies.filter(c => c.status !== 'target').slice(0, 3)

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/apply" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">📝</span>
          <span className="text-lg sm:text-xl text-blue-400 font-bold">지원 현황</span>
        </Link>
        <Link
          to="/apply"
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="전체 보기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">타겟</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.applied}</div>
          <div className="text-xs text-gray-400">지원</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">{stats.inProgress}</div>
          <div className="text-xs text-gray-400">진행</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.offers}</div>
          <div className="text-xs text-gray-400">합격</div>
        </div>
      </div>

      {/* Active Applications or Tier Summary */}
      {activeCompanies.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">진행 중인 지원</div>
          {activeCompanies.map(company => (
            <div key={company.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${TIER_LABELS[company.tier].color}`}>
                  {TIER_LABELS[company.tier].label}
                </span>
                <span className="text-white text-sm font-medium">{company.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs text-white ${STATUS_CONFIG[company.status].color}`}>
                {STATUS_CONFIG[company.status].label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">타겟 회사</div>
          <div className="flex flex-wrap gap-1.5">
            {companies.slice(0, 5).map(company => (
              <span
                key={company.id}
                className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300"
              >
                {company.name}
              </span>
            ))}
            {companies.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{companies.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>지원 진행률</span>
          <span>{stats.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
            style={{ width: `${stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}
