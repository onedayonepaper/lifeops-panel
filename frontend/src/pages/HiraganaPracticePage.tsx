import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { markTaskComplete } from '../utils/routineTaskUtils'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

interface JapaneseRecord {
  id: string
  date: string
  characters: string
  practiceCount: number
  note?: string
}

// 히라가나 기본표
const HIRAGANA_TABLE = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', 'を', '', 'ん'],
]

const ROMAJI_TABLE = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', '', 'yu', '', 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', '', 'wo', '', 'n'],
]

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// Row <-> Object 변환 함수
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

export default function HiraganaPracticePage() {
  const navigate = useNavigate()
  const {
    data: records,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    addItem,
    updateItem,
    deleteItem,
    spreadsheetUrl
  } = useLifeOpsSheets<JapaneseRecord>(
    SHEET_CONFIGS.japanese,
    rowToRecord,
    recordToRow
  )

  const [selectedChars, setSelectedChars] = useState<string[]>([])
  const [practiceCount, setPracticeCount] = useState(1)
  const [note, setNote] = useState('')
  const [showTable, setShowTable] = useState(true)

  const todayKey = getTodayKey()
  const todayRecord = records.find(r => r.date === todayKey)
  const isCompleted = todayRecord !== undefined

  // 오늘 기록이 있으면 폼에 불러오기
  useEffect(() => {
    if (todayRecord) {
      setSelectedChars(todayRecord.characters.split(''))
      setPracticeCount(todayRecord.practiceCount)
      setNote(todayRecord.note || '')
    }
  }, [todayRecord])

  const toggleChar = useCallback((char: string) => {
    if (!char) return
    setSelectedChars(prev =>
      prev.includes(char)
        ? prev.filter(c => c !== char)
        : [...prev, char]
    )
  }, [])

  const handleSave = useCallback(async (shouldGoBack = false) => {
    if (selectedChars.length === 0) {
      alert('학습한 히라가나를 선택해주세요!')
      return
    }

    const newRecord: JapaneseRecord = {
      id: todayRecord?.id || crypto.randomUUID(),
      date: todayKey,
      characters: selectedChars.join(''),
      practiceCount,
      note: note.trim() || undefined
    }

    let success: boolean
    if (todayRecord) {
      success = await updateItem(todayRecord.id, newRecord)
    } else {
      success = await addItem(newRecord)
    }

    if (success) {
      // 라운드 태스크 완료 처리
      await markTaskComplete('r1-2')

      if (shouldGoBack) {
        navigate('/japanese')
      }
    }
  }, [selectedChars, practiceCount, note, todayKey, todayRecord, addItem, updateItem, navigate])

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              あ 히라가나 연습
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              히라가나 10개 읽고 1번 쓰기
            </p>
          </div>
          <Link
            to="/japanese"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 일본어 학습
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
              あ 히라가나 연습
            </h1>
          </div>
          <Link to="/japanese" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← 일본어 학습
          </Link>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const totalCharsLearned = records.reduce((sum, r) => sum + r.characters.length, 0)
  const totalPractice = records.reduce((sum, r) => sum + r.practiceCount, 0)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            あ 히라가나 연습
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            히라가나 10개 읽고 1번 쓰기
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
            to="/japanese"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 일본어 학습
          </Link>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 오늘의 미션 */}
      <div className={`p-4 rounded-xl border-2 ${
        isCompleted
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{isCompleted ? '✅' : '🎯'}</span>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            오늘의 미션: 히라가나 10개 읽고 1번 쓰기
          </h2>
        </div>

        {/* 히라가나 표 */}
        <div className="mb-4">
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
          >
            {showTable ? '▼ 히라가나 표 접기' : '▶ 히라가나 표 펼치기'}
          </button>

          {showTable && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {HIRAGANA_TABLE.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((char, colIdx) => (
                        <td
                          key={colIdx}
                          onClick={() => toggleChar(char)}
                          className={`
                            border border-gray-200 dark:border-gray-700 p-2 text-center cursor-pointer
                            transition-colors min-w-[50px]
                            ${!char ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            ${selectedChars.includes(char)
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-blue-100 dark:hover:bg-blue-900/30'}
                          `}
                        >
                          {char && (
                            <div>
                              <div className="text-2xl font-bold">{char}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {ROMAJI_TABLE[rowIdx][colIdx]}
                              </div>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 선택된 문자 표시 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            선택한 히라가나 ({selectedChars.length}개)
          </label>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[60px]">
            {selectedChars.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedChars.map((char, idx) => (
                  <span
                    key={idx}
                    className="text-2xl bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded"
                  >
                    {char}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">위 표에서 학습한 히라가나를 클릭하세요</span>
            )}
          </div>
        </div>

        {/* 쓰기 연습 횟수 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            쓰기 연습 횟수
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPracticeCount(Math.max(1, practiceCount - 1))}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              -
            </button>
            <span className="text-xl font-bold w-12 text-center">{practiceCount}</span>
            <button
              onClick={() => setPracticeCount(practiceCount + 1)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              +
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">회</span>
          </div>
        </div>

        {/* 메모 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            메모 (선택)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="오늘 학습 소감..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={selectedChars.length === 0 || isSaving}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              selectedChars.length === 0 || isSaving
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={selectedChars.length === 0 || isSaving}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              selectedChars.length === 0 || isSaving
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            ✅ 완료
          </button>
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

      {/* 학습 기록 */}
      {records.length > 0 && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            📚 학습 기록 ({records.length}일)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {records.map(record => (
              <div
                key={record.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {record.date === todayKey && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded mr-2">
                        오늘
                      </span>
                    )}
                    {record.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {record.characters.length}개 × {record.practiceCount}회
                    </span>
                    <button
                      onClick={async () => {
                        if (confirm('이 기록을 삭제할까요?')) {
                          await deleteItem(record.id)
                        }
                      }}
                      className="text-xs px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {record.characters.split('').map((char, idx) => (
                    <span
                      key={idx}
                      className="text-lg bg-blue-100 dark:bg-blue-900/30 px-1.5 rounded"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                {record.note && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    💬 {record.note}
                  </div>
                )}
              </div>
            ))}
          </div>
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
