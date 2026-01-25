import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: '대시보드', icon: '🏠' },
  { path: '/calendar', label: '캘린더', icon: '📅' },
  { path: '/goals', label: '목표', icon: '🎯' },
  { path: '/spec', label: '스펙', icon: '📋' },
  { path: '/tasks', label: '할일', icon: '✅' },
  { path: '/bucket-list', label: '버킷리스트', icon: '🪣' },
  { path: '/study-journal', label: '공부장', icon: '📚' },
]

interface SidebarProps {
  isNightMode?: boolean
}

export function Sidebar({ isNightMode }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
