import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { QuickLinksCard } from '../components/QuickLinksCard'

interface MenuCard {
  path: string
  icon: string
  label: string
  description: string
  color: string
}

const menuCards: MenuCard[] = [
  {
    path: '/spec',
    icon: '📋',
    label: '스펙',
    description: '자격증, 어학, 기술 스택 관리',
    color: 'from-purple-600 to-purple-800'
  },
  {
    path: '/job-document',
    icon: '📄',
    label: '취업서류',
    description: '이력서, 자기소개서, 경력기술서',
    color: 'from-blue-600 to-blue-800'
  },
  {
    path: '/apply',
    icon: '📝',
    label: '지원',
    description: '지원 현황 및 일정 관리',
    color: 'from-green-600 to-green-800'
  },
  {
    path: '/company',
    icon: '🏢',
    label: '회사',
    description: '관심 기업 정보 및 분석',
    color: 'from-orange-600 to-orange-800'
  }
]

export default function EmploymentPage() {
  return (
    <div>
      <PageHeader icon="💼" title="취업" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className={`
              block p-6 rounded-2xl bg-gradient-to-br ${card.color}
              hover:scale-[1.02] transition-transform shadow-lg
            `}
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">{card.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{card.label}</h2>
                <p className="text-white/80 mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Career Links */}
      <div className="mt-8">
        <QuickLinksCard />
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">취업 현황 요약</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-gray-400 text-sm">스펙</div>
            <div className="text-white font-bold">관리중</div>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">📄</div>
            <div className="text-gray-400 text-sm">서류</div>
            <div className="text-white font-bold">준비중</div>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-gray-400 text-sm">지원</div>
            <div className="text-white font-bold">진행중</div>
          </div>
          <div className="bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-gray-400 text-sm">관심기업</div>
            <div className="text-white font-bold">분석중</div>
          </div>
        </div>
      </div>
    </div>
  )
}
