import { Link } from 'react-router-dom'

interface MenuItem {
  path: string
  label: string
  icon: string
  description: string
}

const menuItems: MenuItem[] = [
  {
    path: '/today',
    label: '오늘 카드',
    icon: '🌅',
    description: '오늘의 루틴과 할일을 확인하고 관리합니다'
  },
  {
    path: '/calendar',
    label: '캘린더',
    icon: '📅',
    description: '일정을 캘린더 형태로 확인합니다'
  },
  {
    path: '/tasks',
    label: '할일',
    icon: '✅',
    description: '할일 목록을 관리합니다'
  },
  {
    path: '/life-anchors',
    label: '반복 일정',
    icon: '🔔',
    description: '매일 반복되는 일정을 설정합니다'
  },
  {
    path: '/study-journal',
    label: '공부장',
    icon: '📚',
    description: '학습 기록을 관리합니다'
  }
]

export default function PlanPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📋 생활
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
