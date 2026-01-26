import { Link } from 'react-router-dom'

interface Project {
  name: string
  description: string
  tech: string[]
  url?: string
  isPublic: boolean
  emoji: string
}

const FEATURED_PROJECTS: Project[] = [
  {
    name: 'LifeOps Panel',
    description: '한 화면에서 오늘을 끝낸다 - 홈 대시보드 패널 PWA',
    tech: ['React', 'TypeScript', 'Tailwind'],
    url: 'https://github.com/onedayonepaper/lifeops-panel',
    isPublic: true,
    emoji: '🚀',
  },
  {
    name: 'Seat & Locker Kiosk',
    description: '스터디카페/독서실용 좌석 및 사물함 관리 키오스크',
    tech: ['Next.js', 'Prisma', 'SQLite'],
    url: 'https://github.com/onedayonepaper/seat-locker-kiosk',
    isPublic: true,
    emoji: '🪑',
  },
  {
    name: 'Clinic Queue',
    description: '병원 접수·대기실 DID 실시간 호출 시스템',
    tech: ['Next.js', 'WebSocket', 'SQLite'],
    url: 'https://github.com/onedayonepaper/clinic-queue',
    isPublic: true,
    emoji: '🏥',
  },
  {
    name: 'CareerDock',
    description: '커리어 운영 시스템 - 이력/포트폴리오/지원 관리',
    tech: ['Next.js', 'TypeScript'],
    isPublic: false,
    emoji: '💼',
  },
  {
    name: 'MediTime System',
    description: '고령자 친화적 약물 복용 관리 앱',
    tech: ['Flutter', 'Dart'],
    isPublic: false,
    emoji: '💊',
  },
  {
    name: 'ESP32 IoT Projects',
    description: 'ESP32 기반 IoT 프로젝트 (AirSense, Mini Keyboard)',
    tech: ['ESP32', 'C++', 'BLE'],
    isPublic: false,
    emoji: '🔌',
  },
]

export function ProjectsCard() {
  const publicProjects = FEATURED_PROJECTS.filter(p => p.isPublic)
  const privateProjects = FEATURED_PROJECTS.filter(p => !p.isPublic)

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💻</span>
          <span className="text-lg font-bold text-white">대표 프로젝트</span>
        </div>
        <Link
          to="/spec"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      {/* Public Projects */}
      <div className="space-y-2 mb-3">
        {publicProjects.map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-700/40 hover:bg-gray-700/70 rounded-xl p-3 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{project.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </span>
                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {project.tech.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Private Projects Summary */}
      <div className="border-t border-gray-700 pt-3">
        <div className="text-xs text-gray-500 mb-2">Private Projects</div>
        <div className="flex flex-wrap gap-2">
          {privateProjects.map((project) => (
            <div
              key={project.name}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/30 rounded-lg"
              title={project.description}
            >
              <span className="text-sm">{project.emoji}</span>
              <span className="text-xs text-gray-400">{project.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{publicProjects.length}</div>
            <div className="text-[10px] text-gray-500">Public</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">{privateProjects.length}</div>
            <div className="text-[10px] text-gray-500">Private</div>
          </div>
        </div>
        <a
          href="https://github.com/onedayonepaper?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>GitHub에서 더보기</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
