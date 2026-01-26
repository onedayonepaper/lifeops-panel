import { Link } from 'react-router-dom'

const PROFILE = {
  name: '하늘',
  github: 'https://github.com/onedayonepaper',
  intro: '매일 한 장씩, 꾸준히 성장하는 개발자',
}

const TECH_HIGHLIGHTS = ['React', 'TypeScript', 'Next.js', 'Node.js', 'Kotlin', 'Go']

const STUDY_PROGRESS = [
  { name: 'Algorithm', progress: 30 },
  { name: 'Go', progress: 20 },
  { name: 'JLPT N2', progress: 40 },
]

const STATS = {
  repos: 62,
  projects: 6,
  topics: 3,
}

export function SpecCard() {
  const avgProgress = Math.round(
    STUDY_PROGRESS.reduce((sum, s) => sum + s.progress, 0) / STUDY_PROGRESS.length
  )

  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/spec" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">📋</span>
          <span className="text-lg sm:text-xl text-green-400 font-bold">나의 스펙</span>
        </Link>
        <Link
          to="/spec"
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="전체 보기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Profile Summary */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
          🧑‍💻
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold">{PROFILE.name}</div>
          <div className="text-gray-400 text-xs truncate">{PROFILE.intro}</div>
        </div>
        <a
          href={PROFILE.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-400">{STATS.repos}</div>
          <div className="text-xs text-gray-400">Repos</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-400">{STATS.projects}</div>
          <div className="text-xs text-gray-400">Projects</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{STATS.topics}</div>
          <div className="text-xs text-gray-400">TIL</div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Tech Stack</div>
        <div className="flex flex-wrap gap-1.5">
          {TECH_HIGHLIGHTS.map(tech => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Study Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>공부 진행률</span>
          <span>평균 {avgProgress}%</span>
        </div>
        <div className="space-y-1.5">
          {STUDY_PROGRESS.map(study => (
            <div key={study.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-16 truncate">{study.name}</span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  style={{ width: `${study.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{study.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
