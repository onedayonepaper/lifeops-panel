import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

interface NavGroup {
  label: string
  icon: string
  path: string
  children: NavItem[]
}

type NavEntry = NavItem | NavGroup

const isNavGroup = (entry: NavEntry): entry is NavGroup => {
  return 'children' in entry
}

const navItems: NavEntry[] = [
  {
    label: '생활',
    icon: '📋',
    path: '/plan',
    children: [
      { path: '/today', label: '오늘 카드', icon: '🌅' },
      { path: '/calendar', label: '캘린더', icon: '📅' },
      { path: '/tasks', label: '할일', icon: '✅' },
      { path: '/life-anchors', label: '반복 일정', icon: '🔔' },
      { path: '/house-finding', label: '방구하기', icon: '🏠' },
      { path: '/api-keys', label: 'API 키', icon: '🔑' },
      { path: '/study-journal', label: '공부장', icon: '📚' },
    ]
  },
  {
    label: '이력관리',
    icon: '📝',
    path: '/profile',
    children: [
      { path: '/profile', label: '프로필', icon: '🧠' },
      { path: '/resume', label: '이력서', icon: '📃' },
      { path: '/career-description', label: '경력기술서', icon: '📋' },
      { path: '/portfolio', label: '포트폴리오', icon: '💼' },
      { path: '/job-document', label: '취업서류', icon: '📄' },
      { path: '/self-introduction', label: '자기소개서', icon: '✍️' },
      { path: '/external-profiles', label: '외부 이력 관리', icon: '🔗' },
      { path: '/weak-points', label: '부족한점', icon: '💪' },
    ]
  },
  {
    label: '구직활동',
    icon: '🚀',
    path: '/career',
    children: [
      { path: '/apply', label: '채용공고', icon: '🎯' },
      { path: '/applied-company', label: '지원회사', icon: '📨' },
      { path: '/job-documents', label: '취업지원모음', icon: '📂' },
    ]
  },
  {
    label: '정보',
    icon: 'ℹ️',
    path: '/company',
    children: [
      { path: '/company', label: '회사', icon: '🏢' },
      { path: '/public-sector-it', label: '공공기관 IT', icon: '🏛️' },
    ]
  },
  {
    label: '재테크',
    icon: '💰',
    path: '/finance',
    children: [
      { path: '/finance', label: '자산현황', icon: '📊' },
      { path: '/savings', label: '적금', icon: '🏦' },
      { path: '/insurance', label: '보험', icon: '🛡️' },
      { path: '/subscriptions', label: '구독서비스', icon: '📱' },
      { path: '/fixed-expenses', label: '고정지출', icon: '📋' },
      { path: '/cards', label: '카드', icon: '💳' },
    ]
  },
]

interface SidebarProps {
  isNightMode?: boolean
}

export function Sidebar({ isNightMode }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['이력관리', '구직활동', '정보', '재테크'])

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label)
        ? prev.filter(g => g !== label)
        : [...prev, label]
    )
  }

  const isChildActive = (children: NavItem[]) => {
    return children.some(child => location.pathname === child.path)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-800 text-white shadow-lg"
        aria-label="메뉴 열기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          ${isNightMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-700'}
          border-r transition-all duration-300
          ${isCollapsed ? 'w-16' : 'w-56'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Header */}
        <div className={`p-4 border-b ${isNightMode ? 'border-gray-800' : 'border-gray-700'}`}>
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">🚀</span>
            {!isCollapsed && (
              <span className="text-white font-bold text-lg">LifeOps</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (isNavGroup(item)) {
                const isExpanded = expandedGroups.includes(item.label)
                const hasActiveChild = isChildActive(item.children)
                const isGroupActive = location.pathname === item.path

                return (
                  <li key={item.label}>
                    {/* Group Header */}
                    <div className="flex items-center">
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                          ${isGroupActive
                            ? 'bg-blue-600 text-white'
                            : hasActiveChild
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </Link>
                      {!isCollapsed && (
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Children */}
                    {!isCollapsed && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => {
                          const isChildItemActive = location.pathname === child.path
                          return (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                  ${isChildItemActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }
                                `}
                              >
                                <span className="text-lg">{child.icon}</span>
                                <span className="font-medium">{child.label}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              }

              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Toggle (Desktop only) */}
        <div className={`hidden lg:block p-2 border-t ${isNightMode ? 'border-gray-800' : 'border-gray-700'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!isCollapsed && <span className="text-sm">접기</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`} />
    </>
  )
}
