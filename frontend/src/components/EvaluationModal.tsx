interface EvaluationCategory {
  name: string
  score: number
  analysis: string
  suggestion: string
}

interface EvaluationResult {
  overallScore: number
  categories: EvaluationCategory[]
  strengths: string[]
  improvements: string[]
  actionItems: string[]
}

interface EvaluationModalProps {
  result: EvaluationResult | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onRetry: () => void
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '우수'
  if (score >= 80) return '양호'
  if (score >= 60) return '보통'
  if (score >= 40) return '개선 필요'
  return '위험'
}

export function EvaluationModal({ result, isLoading, error, onClose, onRetry }: EvaluationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 px-5 py-4 border-b border-gray-700 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">AI 평가 결과</h2>
          <div className="flex items-center gap-2">
            {result && !isLoading && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition-colors"
              >
                다시 평가
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400">AI가 현재 상태를 분석 중입니다...</p>
              <p className="text-gray-500 text-sm">약 10-20초 소요됩니다</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-8 text-center space-y-3">
              <div className="text-4xl">❌</div>
              <p className="text-red-400 font-medium">평가 실패</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="space-y-5">
              {/* Overall Score */}
              <div className="text-center py-4">
                <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  종합 점수 / 100 &middot;{' '}
                  <span className={getScoreColor(result.overallScore)}>
                    {getScoreLabel(result.overallScore)}
                  </span>
                </div>
              </div>

              {/* Category Cards */}
              <div className="space-y-3">
                {result.categories.map(cat => (
                  <div key={cat.name} className="bg-gray-900/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm">{cat.name}</span>
                      <span className={`font-bold ${getScoreColor(cat.score)}`}>{cat.score}</span>
                    </div>
                    {/* Score bar */}
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{cat.analysis}</p>
                    <p className="text-blue-400 text-xs">{cat.suggestion}</p>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-green-400 font-medium text-sm mb-2">💪 강점</h3>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <h3 className="text-orange-400 font-medium text-sm mb-2">📈 개선점</h3>
                  <ul className="space-y-1">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">!</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {result.actionItems.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-blue-400 font-medium text-sm mb-2">🎯 액션 아이템</h3>
                  <ul className="space-y-1">
                    {result.actionItems.map((s, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
