import { Link } from 'react-router-dom'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

interface JapaneseRecord {
  id: string
  date: string
  characters: string
  practiceCount: number
  note?: string
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function rowToRecord(row: string[]): JapaneseRecord {
  return {
    id: row[0] || '',
    date: row[1] || '',
    characters: row[2] || '',
    practiceCount: parseInt(row[3]) || 1,
    note: row[4] || undefined
  }
}

function recordToRow(record: JapaneseRecord): string[] {
  return [
    record.id,
    record.date,
    record.characters,
    record.practiceCount.toString(),
    record.note || ''
  ]
}

export default function JapanesePage() {
  const {
    data: records,
    isLoading,
    isSignedIn,
    signIn,
    spreadsheetUrl
  } = useLifeOpsSheets<JapaneseRecord>(
    SHEET_CONFIGS.japanese,
    rowToRecord,
    recordToRow
  )

  const todayKey = getTodayKey()
  const todayRecord = records.find(r => r.date === todayKey)
  const totalCharsLearned = records.reduce((sum, r) => sum + r.characters.length, 0)
  const totalPractice = records.reduce((sum, r) => sum + r.practiceCount, 0)

  // 학습 활동 목록
  const activities = [
    {
      id: 'hiragana',
      emoji: 'あ',
      title: '히라가나 연습',
      description: '히라가나 10개 읽고 1번 쓰기',
      link: '/japanese/hiragana',
      isCompleted: todayRecord !== undefined,
      badge: todayRecord ? '오늘 완료' : '오늘 미완료'
    },
    {
      id: 'katakana',
      emoji: 'ア',
      title: '카타카나 연습',
      description: '카타카나 10개 읽고 1번 쓰기',
      link: null, // 아직 미구현
      isCompleted: false,
      badge: '준비중'
    },
    {
      id: 'vocabulary',
      emoji: '📝',
      title: 'JLPT N5 단어',
      description: '기초 단어 암기',
      link: null,
      isCompleted: false,
      badge: '준비중'
    },
    {
      id: 'grammar',
      emoji: '📖',
      title: '기초 문법',
      description: '~です, ~ます 문형 연습',
      link: null,
      isCompleted: false,
      badge: '준비중'
    }
  ]

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🇯🇵 일본어 학습
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              목표: JLPT N2 자격증 취득
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 오늘 카드
          </Link>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Google 계정으로 로그인하여 학습 기록을 저장하세요
          </p>
          <button
            onClick={signIn}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Google 로그인
          </button>
        </div>
      </div>
    )
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🇯🇵 일본어 학습
            </h1>
          </div>
          <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← 오늘 카드
          </Link>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🇯🇵 일본어 학습
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            목표: JLPT N2 자격증 취득
          </p>
        </div>
        <div className="flex items-center gap-2">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Google Sheets에서 보기"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
              </svg>
            </a>
          )}
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 오늘 카드
          </Link>
        </div>
      </div>

      {/* 학습 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-500">{records.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">학습 일수</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-500">{totalCharsLearned}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">총 학습 문자</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-purple-500">{totalPractice}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">총 쓰기 연습</div>
        </div>
      </div>

      {/* 학습 활동 목록 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📚 학습 활동</h2>

        {activities.map(activity => (
          activity.link ? (
            <Link
              key={activity.id}
              to={activity.link}
              className={`block p-4 rounded-xl border-2 transition-all ${
                activity.isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activity.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {activity.title}
                      {activity.isCompleted && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                          {activity.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div
              key={activity.id}
              className="block p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl grayscale">{activity.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      {activity.title}
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {activity.badge}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {activity.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* 최근 학습 기록 */}
      {records.length > 0 && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            📅 최근 학습 기록
          </h3>
          <div className="space-y-2">
            {records.slice(0, 5).map(record => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {record.date === todayKey && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      오늘
                    </span>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">{record.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {record.characters.length}개 × {record.practiceCount}회
                  </span>
                </div>
              </div>
            ))}
          </div>
          {records.length > 5 && (
            <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              외 {records.length - 5}개 기록...
            </div>
          )}
        </div>
      )}

      {/* 외부 링크 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔗 학습 리소스</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.duolingo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            Duolingo 열기
          </a>
          <a
            href="https://www.youtube.com/results?search_query=히라가나+쓰기"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            YouTube 학습영상
          </a>
        </div>
      </div>
    </div>
  )
}
