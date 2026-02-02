import { Link } from 'react-router-dom'

interface MenuItem {
  path: string
  label: string
  icon: string
  description: string
}

const menuItems: MenuItem[] = [
  {
    path: '/profile',
    label: '프로필',
    icon: '🧠',
    description: '나의 성향과 강점을 정리합니다'
  },
  {
    path: '/portfolio',
    label: '포트폴리오',
    icon: '💼',
    description: '프로젝트 경험을 관리합니다'
  },
  {
    path: '/resume',
    label: '취업서류',
    icon: '📄',
    description: '이력서와 자기소개서를 관리합니다'
  },
  {
    path: '/apply',
    label: '지원',
    icon: '📝',
    description: '지원 현황을 추적합니다'
  },
  {
    path: '/company',
    label: '회사',
    icon: '🏢',
    description: '관심 회사 정보를 관리합니다'
  },
  {
    path: '/public-sector-it',
    label: '공공기관 IT',
    icon: '🏛️',
    description: '공공기관 IT 채용 정보를 확인합니다'
  },
  {
    path: '/job-documents',
    label: '취업지원모음',
    icon: '📂',
    description: '취업 관련 문서를 모아봅니다'
  }
]

export default function CareerPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🚀 커리어
        </h1>
      </div>

      {/* 메뉴 소개 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">메뉴</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
