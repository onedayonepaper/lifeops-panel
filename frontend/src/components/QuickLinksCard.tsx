interface QuickLink {
  name: string
  url: string
  icon: string
  color: string
}

interface LinkCategory {
  title: string
  links: QuickLink[]
}

const LINK_CATEGORIES: LinkCategory[] = [
  {
    title: '내 프로필',
    links: [
      { name: 'GitHub', url: 'https://github.com/onedayonepaper', icon: '🐙', color: 'hover:bg-gray-600' },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', color: 'hover:bg-blue-900/50' },
      { name: 'TIL Blog', url: 'https://github.com/onedayonepaper/til', icon: '✏️', color: 'hover:bg-gray-600' },
      { name: 'Notion', url: 'https://notion.so', icon: '📝', color: 'hover:bg-gray-600' },
    ]
  },
  {
    title: '채용 플랫폼',
    links: [
      { name: '원티드', url: 'https://wanted.co.kr', icon: '🎯', color: 'hover:bg-blue-800/50' },
      { name: '잡코리아', url: 'https://jobkorea.co.kr', icon: '📋', color: 'hover:bg-yellow-900/50' },
      { name: '사람인', url: 'https://saramin.co.kr', icon: '👔', color: 'hover:bg-blue-700/50' },
      { name: '로켓펀치', url: 'https://rocketpunch.com', icon: '🚀', color: 'hover:bg-indigo-900/50' },
    ]
  },
  {
    title: '코딩테스트',
    links: [
      { name: '프로그래머스', url: 'https://programmers.co.kr', icon: '💻', color: 'hover:bg-purple-900/50' },
      { name: '백준', url: 'https://acmicpc.net', icon: '🏆', color: 'hover:bg-blue-900/50' },
      { name: 'LeetCode', url: 'https://leetcode.com', icon: '🧩', color: 'hover:bg-orange-900/50' },
    ]
  },
  {
    title: '기업 정보',
    links: [
      { name: 'Blind', url: 'https://blind.co.kr', icon: '👁️', color: 'hover:bg-green-900/50' },
      { name: '잡플래닛', url: 'https://jobplanet.co.kr', icon: '🌍', color: 'hover:bg-green-800/50' },
    ]
  },
]

export function QuickLinksCard() {
  return (
    <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔗</span>
        <span className="text-lg font-bold text-white">커리어 관리</span>
        <span className="text-xs text-gray-500 ml-auto">바로가기</span>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {LINK_CATEGORIES.map((category) => (
          <div key={category.title}>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{category.title}</div>
            <div className="flex flex-wrap gap-2">
              {category.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-700/30 ${link.color} transition-all group`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="text-sm text-gray-300 font-medium">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
