import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface Project {
  name: string
  description: string
  tech: string[]
  url?: string
  isPublic: boolean
}

interface StudyItem {
  category: string
  items: string[]
  progress: number
}

const PROFILE = {
  name: '하늘',
  github: 'https://github.com/onedayonepaper',
  til: 'https://github.com/onedayonepaper/til',
  intro: '매일 한 장씩, 꾸준히 성장하는 개발자',
}

const TECH_STACK = {
  frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'React Native', 'Expo'],
  backend: ['Node.js', 'Kotlin', 'Rust', 'Go', 'Bun'],
  database: ['SQLite', 'Prisma', 'PostgreSQL'],
  infra: ['Vercel', 'Docker', 'GitHub Actions'],
  iot: ['ESP32', 'Arduino', 'PlatformIO'],
  tools: ['Git', 'VS Code', 'Claude Code', 'Figma'],
}

const PROJECTS: Project[] = [
  {
    name: 'LifeOps Panel',
    description: '한 화면에서 오늘을 끝낸다 - 홈 대시보드 패널 PWA',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Google Calendar API'],
    url: 'https://github.com/onedayonepaper/lifeops-panel',
    isPublic: true,
  },
  {
    name: 'Seat & Locker Kiosk',
    description: '스터디카페/독서실용 좌석 및 사물함 관리 키오스크 시스템',
    tech: ['Next.js', 'Prisma', 'SQLite', 'QR 스캔'],
    url: 'https://github.com/onedayonepaper/seat-locker-kiosk',
    isPublic: true,
  },
  {
    name: 'Clinic Queue',
    description: '병원 접수·진료실·대기실 DID를 통합한 실시간 대기 호출 시스템',
    tech: ['Next.js', 'WebSocket', 'SQLite'],
    url: 'https://github.com/onedayonepaper/clinic-queue',
    isPublic: true,
  },
  {
    name: 'CareerDock',
    description: '커리어 운영 시스템 - 이력/포트폴리오/지원 관리',
    tech: ['Next.js', 'TypeScript'],
    isPublic: false,
  },
  {
    name: 'MediTime System',
    description: '고령자 친화적 약물 복용 관리 Flutter 앱',
    tech: ['Flutter', 'Dart', 'Local Storage'],
    isPublic: false,
  },
  {
    name: 'ESP32 IoT Projects',
    description: 'ESP32 기반 다양한 IoT 프로젝트 (AirSense, Mini Keyboard 등)',
    tech: ['ESP32', 'C++', 'PlatformIO', 'BLE'],
    isPublic: false,
  },
]

const STUDY_ITEMS: StudyItem[] = [
  {
    category: 'Algorithm',
    items: ['자료구조', '정렬/탐색', '그래프', 'DP', '코딩테스트'],
    progress: 30,
  },
  {
    category: 'Go',
    items: ['기본 문법', 'Goroutine', 'Channel', 'Web Framework'],
    progress: 20,
  },
  {
    category: 'Japanese (JLPT N2)',
    items: ['히라가나/카타카나', '한자', '문법', '독해', '청해'],
    progress: 40,
  },
  {
    category: 'System Design',
    items: ['대규모 시스템 설계', 'API 설계', '데이터베이스 설계'],
    progress: 25,
  },
  {
    category: 'DevOps',
    items: ['Docker', 'Kubernetes', 'CI/CD', '모니터링'],
    progress: 35,
  },
]

export function SpecPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'study'>('profile')

  return (
    <div>
      <PageHeader icon="📋" title="나의 스펙">
        <a
          href={PROFILE.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="GitHub"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a
          href={PROFILE.til}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="TIL Blog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </a>
      </PageHeader>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          프로필
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'portfolio'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          포트폴리오
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'study'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          공부 계획
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                🧑‍💻
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{PROFILE.name}</h2>
                <p className="text-gray-400">{PROFILE.intro}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-center text-white text-sm font-medium transition-colors"
              >
                GitHub
              </a>
              <a
                href={PROFILE.til}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-center text-white text-sm font-medium transition-colors"
              >
                TIL Blog
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
            <div className="space-y-4">
              {Object.entries(TECH_STACK).map(([category, techs]) => (
                <div key={category}>
                  <div className="text-xs text-gray-500 uppercase mb-2">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {techs.map(tech => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">62</div>
              <div className="text-xs text-gray-500">Repositories</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">6</div>
              <div className="text-xs text-gray-500">Public Projects</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">3</div>
              <div className="text-xs text-gray-500">TIL Topics</div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-3">
          {PROJECTS.map((project, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    {project.isPublic ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Public</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-600 text-gray-400 text-xs rounded-full">Private</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Tab */}
      {activeTab === 'study' && (
        <div className="space-y-3">
          {STUDY_ITEMS.map((study, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{study.category}</h3>
                <span className="text-sm text-gray-400">{study.progress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${study.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {study.items.map(item => (
                  <span key={item} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* TIL Link */}
          <a
            href={PROFILE.til}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-4 hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-white font-bold">TIL (Today I Learned)</div>
                <div className="text-gray-400 text-sm">매일 배운 것을 기록합니다</div>
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}
