import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface Section {
  id: string
  title: string
  content: string
  tag?: string
}

const SELF_INTRO_SECTIONS: Section[] = [
  {
    id: '1',
    title: '지원동기',
    tag: '직무/회사 공통형',
    content: `저는 "서비스를 멈추지 않게 만드는 개발자"로 일해왔습니다. 현업 사용자가 매일 쓰는 업무 시스템을 운영하며, 작은 오류 하나가 업무 전체를 지연시키는 상황을 수차례 마주했습니다. 그 과정에서 기능 개발뿐 아니라 장애 대응, 성능 저하 원인 분석, 운영 효율화처럼 "안정적인 서비스 제공"이 곧 고객가치라는 것을 체감했습니다.

저의 강점은 현업 요구를 빠르게 구조화하고, 데이터/로그 기반으로 원인을 좁혀 해결하는 실행력입니다. Java(PJT/서버사이드)와 PHP(레거시/운영) 환경에서 기능 개선과 운영 이슈를 함께 다루며, SQL 튜닝과 화면/업무 흐름 개선까지 폭넓게 경험했습니다. 이제는 이러한 경험을 더 큰 트래픽과 더 높은 품질 기준이 요구되는 환경에서 확장해, 서비스의 안정성과 사용자 만족을 동시에 끌어올리는 개발자가 되고자 지원했습니다.`,
  },
  {
    id: '2',
    title: '직무역량',
    tag: '기술 + 업무 방식',
    content: `저는 운영 개발에서 가장 중요한 역량을 "문제를 재현하고, 원인을 분해하며, 재발을 막는 것"이라고 생각합니다.

• 백엔드/웹 개발 경험: Java 기반 업무 시스템 운영 및 기능 개선, PHP/JSP 기반 레거시 유지보수 경험이 있습니다.

• 데이터 중심 문제 해결: Oracle SQL을 기반으로 조회/리포트 등 병목이 되는 구간을 찾아 개선해왔고, 인덱스/쿼리 구조 개선 관점에서 접근해 성능과 안정성을 높였습니다.

• 현업 커뮤니케이션: 사용자의 요구를 "화면/업무규칙/데이터"로 정리하고, 영향 범위를 명확히 한 뒤 릴리즈하는 방식으로 리스크를 줄였습니다.

• 운영 관점의 품질 습관: 임시 처방보다 "왜 발생했는지"를 남기고, 재발을 줄이는 개선(가이드/로그/검증 강화)을 우선합니다.`,
  },
  {
    id: '3',
    title: '경험사례 1',
    tag: 'STAR - 조회/리포트 성능 개선',
    content: `운영 중인 업무 시스템에서 특정 기간에 조회/리포트 기능이 느려져 사용자 민원이 반복되었습니다. 저는 우선 문제 화면과 조건을 고정해 재현 환경을 만들고, 느려지는 패턴을 기준으로 SQL 실행 경로와 데이터 분포를 점검했습니다. 그 결과 불필요한 조인 구조와 범위 조건 처리 방식이 병목이 되는 것을 확인했습니다.

이후 쿼리 구조를 단순화하고 조건 순서를 정리했으며, 데이터 접근 방식 개선과 함께 필요한 부분에는 인덱스를 검토해 적용했습니다. 그 결과 체감 속도가 개선되어 민원이 감소했고, 같은 유형의 조회 화면에서도 동일한 방식으로 점검할 수 있도록 기준을 정리해 운영 효율을 높였습니다. 무엇보다 "한 번 해결"에 그치지 않고, 유사 화면을 함께 점검해 재발 가능성을 낮춘 것이 성과였습니다.`,
  },
  {
    id: '4',
    title: '경험사례 2',
    tag: 'STAR - 현업 요구 반영 + 안정적 배포',
    content: `현업에서 업무 규정 변경으로 기능 수정이 급하게 필요했던 적이 있습니다. 단순히 화면만 바꾸면 되는 요청처럼 보였지만, 실제로는 데이터 입력 규칙과 기존 데이터 호환성 문제가 숨어 있었습니다. 저는 먼저 요구사항을 "입력/검증/저장/조회/권한"으로 쪼개 영향 범위를 정리했고, 기존 사용자들이 혼란 없이 전환할 수 있도록 변경 전후 규칙을 문서화했습니다.

개발 단계에서는 케이스를 최소/예외로 나눠 테스트했고, 운영 반영 시에는 사용자 영향이 적은 시간대를 택해 배포했습니다. 결과적으로 현업 변경 요구를 일정 내에 반영하면서도 장애 없이 안정적으로 적용했고, 이후 유사한 변경 요청이 들어올 때도 같은 방식으로 빠르게 대응할 수 있는 틀이 만들어졌습니다.`,
  },
  {
    id: '5',
    title: '입사 후 포부',
    content: `입사 후에는 "운영 안정성과 개발 생산성"을 동시에 높이는 방향으로 기여하겠습니다.

1. 장애/성능 이슈 대응 표준화: 재현 → 원인분석 → 해결 → 재발방지까지의 흐름을 문서/체크리스트로 정리해 대응 품질을 끌어올리겠습니다.

2. 데이터/쿼리 품질 강화: 자주 쓰는 핵심 조회/리포트에 대해 병목을 선제적으로 점검하고, SQL 구조·인덱스·데이터 설계를 함께 개선하겠습니다.

3. 현업 중심의 기능 개선: 사용자 경험을 떨어뜨리는 반복 업무를 찾아 작은 개선을 지속적으로 쌓아, "일이 빨라지는 시스템"을 만들겠습니다.

저는 기능을 만드는 개발자에 그치지 않고, 서비스가 안정적으로 돌아가며 사용자 업무가 실제로 빨라지게 만드는 개발자로 성장하고 싶습니다.`,
  },
]

const SUMMARY_TEXT = `운영·유지보수 환경에서 Java/PHP 기반 업무 시스템을 담당하며, 현업 요구 반영과 장애 대응, 성능 개선을 수행해왔습니다. 특히 Oracle SQL 기반 조회/리포트 성능 이슈를 재현–분석–개선하는 방식으로 해결하며 서비스 안정성을 높였습니다. 입사 후에는 운영 품질 표준화와 선제적 성능 점검을 통해 "멈추지 않는 서비스"를 만드는 데 기여하겠습니다.`

export default function SelfIntroductionPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    SELF_INTRO_SECTIONS.map(s => s.id)
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const copySection = async (section: Section) => {
    const text = `[${section.title}${section.tag ? ` - ${section.tag}` : ''}]\n\n${section.content}`
    await navigator.clipboard.writeText(text)
    setCopiedId(section.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = async () => {
    const text = SELF_INTRO_SECTIONS.map(s =>
      `## ${s.title}${s.tag ? ` (${s.tag})` : ''}\n\n${s.content}`
    ).join('\n\n---\n\n')
    const full = `${text}\n\n---\n\n## 200~300자 요약문\n\n${SUMMARY_TEXT}`
    await navigator.clipboard.writeText(full)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const getCharCount = (text: string) => text.replace(/\s/g, '').length

  return (
    <div>
      <PageHeader icon="📝" title="자기소개서" />

      {/* 타겟 정보 */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-white font-bold text-lg">대기업/공공기관 IT</div>
            <div className="text-gray-400 text-sm">웹/백엔드 · 전산운영</div>
          </div>
          <button
            onClick={copyAll}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              copiedAll
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {copiedAll ? '복사됨!' : '전체 복사'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Java', 'PHP', 'JSP', 'Oracle SQL', '운영/유지보수', '장애대응', '성능개선'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-lg">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 200~300자 요약 */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚡</span>
            <span className="text-white font-bold text-sm">200~300자 요약문</span>
            <span className="text-gray-500 text-xs">{getCharCount(SUMMARY_TEXT)}자 (공백 제외)</span>
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(SUMMARY_TEXT)
              setCopiedId('summary')
              setTimeout(() => setCopiedId(null), 2000)
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              copiedId === 'summary' ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="복사"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copiedId === 'summary' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{SUMMARY_TEXT}</p>
      </div>

      {/* 본문 섹션들 */}
      <div className="space-y-3">
        {SELF_INTRO_SECTIONS.map((section, index) => {
          const isExpanded = expandedSections.includes(section.id)
          return (
            <div key={section.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-white font-bold">{section.title}</div>
                    {section.tag && (
                      <div className="text-gray-500 text-xs">{section.tag}</div>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs">{getCharCount(section.content)}자</span>
                  <button
                    onClick={() => copySection(section)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      copiedId === section.id ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title="복사"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {copiedId === section.id ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 섹션 본문 */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    {section.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className={`text-gray-300 text-sm leading-relaxed ${pIdx > 0 ? 'mt-3' : ''}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
