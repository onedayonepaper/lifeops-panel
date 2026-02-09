import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

/**
 * [Claude 자동 접수용 데이터 구조]
 * schedules 필드 형식 (파이프 구분, 줄바꿈 구분):
 *   회차|접수시작(YYYY-MM-DD)|접수마감(YYYY-MM-DD)|시험일(YYYY-MM-DD)|결과발표(YYYY-MM-DD)
 *
 * 자동 접수 조건:
 *   1. status가 'studying' 이상
 *   2. 현재 날짜가 접수시작 ~ 접수마감 사이
 *   3. url로 접수 페이지 이동
 */

interface SpecItem {
  id: string
  name: string
  category: 'cert' | 'lang'
  status: 'not_started' | 'studying' | 'registered' | 'passed'
  priority: 'high' | 'medium' | 'low'
  url: string
  fee: string
  frequency: string
  target: string
  notes: string
  schedules: string
}

type StatusKey = SpecItem['status']
type PriorityKey = SpecItem['priority']
type CategoryKey = SpecItem['category']

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bgColor: string }> = {
  not_started: { label: '미시작', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  studying: { label: '준비 중', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  registered: { label: '접수 완료', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  passed: { label: '취득', color: 'text-green-400', bgColor: 'bg-green-500/20' },
}

const PRIORITY_CONFIG: Record<PriorityKey, { label: string; color: string }> = {
  high: { label: '높음', color: 'text-red-400' },
  medium: { label: '보통', color: 'text-yellow-400' },
  low: { label: '낮음', color: 'text-gray-400' },
}

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; icon: string }> = {
  cert: { label: '자격증', icon: '📜' },
  lang: { label: '어학', icon: '🌐' },
}

const INITIAL_DATA: SpecItem[] = [
  {
    id: 'pc-repair',
    name: 'PC정비사 2급',
    category: 'cert',
    status: 'passed',
    priority: 'low',
    url: '',
    fee: '',
    frequency: '',
    target: '취득 완료',
    notes: 'PC 하드웨어/소프트웨어 정비 자격증',
    schedules: ''
  },
  {
    id: 'network-admin',
    name: '네트워크 관리사 2급',
    category: 'cert',
    status: 'passed',
    priority: 'low',
    url: '',
    fee: '',
    frequency: '',
    target: '취득 완료',
    notes: '네트워크 설계/구축/운영 관리 자격증',
    schedules: ''
  },
  {
    id: 'sqld',
    name: 'SQLD (SQL 개발자)',
    category: 'cert',
    status: 'registered',
    priority: 'high',
    url: 'https://www.dataq.or.kr/www/accept/schedule.do',
    fee: '50,000원',
    frequency: '연 4회',
    target: '합격',
    notes: 'DB 자격증. 공공기관/대기업 우대',
    schedules: [
      '제60회|2026-02-02|2026-02-06|2026-03-07|2026-03-27',
      '제61회|2026-04-27|2026-05-01|2026-05-31|2026-06-19',
      '제62회|2026-07-20|2026-07-24|2026-08-22|2026-09-11',
      '제63회|2026-10-12|2026-10-16|2026-11-14|2026-12-04',
    ].join('\n')
  },
  {
    id: 'historyexam',
    name: '한국사능력검정시험',
    category: 'cert',
    status: 'not_started',
    priority: 'high',
    url: 'https://www.historyexam.go.kr',
    fee: '18,000원 (심화)',
    frequency: '연 5회',
    target: '심화 2급 이상 (공무원 가산점)',
    notes: '국가직 9급 가산점 대상. 선착순 마감 빠름',
    schedules: [
      '제77회|2026-01-06|2026-01-13|2026-02-07|2026-02-21',
      '제78회|2026-04-21|2026-04-28|2026-05-23|2026-06-06',
      '제79회|2026-07-07|2026-07-14|2026-08-09|2026-08-23',
      '제80회|2026-09-15|2026-09-22|2026-10-17|2026-10-31',
      '제81회|2026-10-27|2026-11-03|2026-11-28|2026-12-12',
    ].join('\n')
  },
  {
    id: 'toeic',
    name: 'TOEIC',
    category: 'lang',
    status: 'not_started',
    priority: 'high',
    url: 'https://exam.toeic.co.kr',
    fee: '52,500원',
    frequency: '매월 2~3회 (연 26회)',
    target: '700점 이상 (공공기관 기준)',
    notes: '접수: 시험 약 2주 전 오전 10시 오픈',
    schedules: [
      '3월|2026-02-09|2026-02-13|2026-03-08|2026-03-27',
      '4월|2026-03-09|2026-03-13|2026-04-12|2026-04-30',
      '5월|2026-04-13|2026-04-17|2026-05-10|2026-05-28',
      '6월|2026-05-11|2026-05-15|2026-06-14|2026-07-02',
    ].join('\n')
  },
  {
    id: 'toeic-speaking',
    name: 'TOEIC Speaking',
    category: 'lang',
    status: 'not_started',
    priority: 'medium',
    url: 'https://www.toeicswt.co.kr',
    fee: '84,000원',
    frequency: '매월',
    target: 'Level 6 (130점) 이상',
    notes: '일부 공공기관/대기업 필수',
    schedules: ''
  },
  {
    id: 'opic',
    name: 'OPIc',
    category: 'lang',
    status: 'not_started',
    priority: 'medium',
    url: 'https://www.opic.or.kr',
    fee: '78,100원',
    frequency: '상시 (공휴일 제외)',
    target: 'IH (Intermediate High) 이상',
    notes: '대기업 필수. 원하는 날짜에 접수 가능. 최소 2주 전 예약 권장',
    schedules: ''
  },
  {
    id: 'aws-clf',
    name: 'AWS Cloud Practitioner',
    category: 'cert',
    status: 'not_started',
    priority: 'medium',
    url: 'https://www.pearsonvue.com/aws',
    fee: '$100 (약 14만원)',
    frequency: '상시 (Pearson VUE)',
    target: '합격 (700/1000 이상)',
    notes: 'AWS 기초 자격증. 클라우드 입문용. 90분, 65문항. 온라인/오프라인 응시 가능',
    schedules: ''
  },
  {
    id: 'aws-saa',
    name: 'AWS Solutions Architect Associate',
    category: 'cert',
    status: 'not_started',
    priority: 'low',
    url: 'https://www.pearsonvue.com/aws',
    fee: '$150 (약 21만원)',
    frequency: '상시 (Pearson VUE)',
    target: '합격 (720/1000 이상)',
    notes: 'AWS 핵심 자격증. 130분, 65문항. Cloud Practitioner 취득 후 도전 권장',
    schedules: ''
  },
  {
    id: 'jlpt',
    name: 'JLPT (일본어)',
    category: 'lang',
    status: 'not_started',
    priority: 'low',
    url: 'https://www.jlpt.or.kr',
    fee: '50,000원',
    frequency: '연 2회 (7월, 12월)',
    target: 'N2 이상',
    notes: '일본 취업/이직 시 필수',
    schedules: [
      '1차|2026-03-16|2026-04-10|2026-07-05|2026-08-24',
      '2차|2026-08-17|2026-09-11|2026-12-06|2027-01-25',
    ].join('\n')
  },
]

function parseSchedules(raw: string) {
  if (!raw.trim()) return []
  return raw.split('\n').filter(l => l.trim()).map(line => {
    const [round, regStart, regEnd, examDate, resultDate] = line.split('|')
    return { round, regStart, regEnd, examDate, resultDate }
  })
}

function getScheduleStatus(regStart: string, regEnd: string, examDate: string): {
  label: string; color: string; bgColor: string
} {
  const today = new Date().toISOString().split('T')[0]
  if (today >= regStart && today <= regEnd) {
    return { label: '접수 중', color: 'text-green-400', bgColor: 'bg-green-500/20' }
  }
  if (today < regStart) {
    const daysUntil = Math.ceil((new Date(regStart).getTime() - Date.now()) / 86400000)
    if (daysUntil <= 14) {
      return { label: `접수 D-${daysUntil}`, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    }
    return { label: '예정', color: 'text-gray-500', bgColor: 'bg-gray-500/20' }
  }
  if (today <= examDate) {
    return { label: '시험 대기', color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
  }
  return { label: '종료', color: 'text-gray-600', bgColor: 'bg-gray-600/20' }
}

export default function SpecSchedulePage() {
  const [items] = useState<SpecItem[]>(INITIAL_DATA)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'cert' | 'lang'>('all')

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  // 접수 중인 시험 찾기
  const today = new Date().toISOString().split('T')[0]
  const urgentItems: { item: SpecItem; schedule: ReturnType<typeof parseSchedules>[0] }[] = []
  items.forEach(item => {
    parseSchedules(item.schedules).forEach(s => {
      if (today >= s.regStart && today <= s.regEnd) {
        urgentItems.push({ item, schedule: s })
      }
    })
  })

  // 다가오는 접수 (2주 이내)
  const upcomingItems: { item: SpecItem; schedule: ReturnType<typeof parseSchedules>[0]; daysUntil: number }[] = []
  items.forEach(item => {
    parseSchedules(item.schedules).forEach(s => {
      const daysUntil = Math.ceil((new Date(s.regStart).getTime() - Date.now()) / 86400000)
      if (today < s.regStart && daysUntil <= 30 && daysUntil > 0) {
        upcomingItems.push({ item, schedule: s, daysUntil })
      }
    })
  })
  upcomingItems.sort((a, b) => a.daysUntil - b.daysUntil)

  return (
    <div>
      <PageHeader icon="🎓" title="스펙 일정" />

      {/* 긴급 알림 - 접수 중 */}
      {urgentItems.length > 0 && (
        <div className="mb-3 space-y-2">
          {urgentItems.map(({ item, schedule }) => (
            <a
              key={`${item.id}-${schedule.round}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold text-sm animate-pulse">접수 중</span>
                <span className="text-white font-medium text-sm">{item.name}</span>
                <span className="text-gray-400 text-xs">{schedule.round}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                접수: {schedule.regStart} ~ {schedule.regEnd} | 시험: {schedule.examDate} | 비용: {item.fee}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* 다가오는 접수 */}
      {upcomingItems.length > 0 && (
        <div className="mb-3 p-3 bg-gray-800 rounded-xl">
          <div className="text-xs text-gray-400 mb-2">다가오는 접수 (30일 이내)</div>
          <div className="space-y-1">
            {upcomingItems.slice(0, 5).map(({ item, schedule, daysUntil }) => (
              <div key={`${item.id}-${schedule.round}`} className="flex items-center gap-2 text-sm">
                <span className={`font-mono text-xs ${daysUntil <= 7 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  D-{daysUntil}
                </span>
                <span className="text-gray-300">{item.name}</span>
                <span className="text-gray-500 text-xs">{schedule.round}</span>
                <span className="text-gray-600 text-xs">접수 {schedule.regStart}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex gap-2 mb-3">
        {(['all', 'cert', 'lang'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === key
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {key === 'all' ? '전체' : CATEGORY_CONFIG[key].icon + ' ' + CATEGORY_CONFIG[key].label}
          </button>
        ))}
      </div>

      {/* 시험 목록 */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-700">
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const statusConfig = STATUS_CONFIG[item.status]
            const priorityConfig = PRIORITY_CONFIG[item.priority]
            const schedules = parseSchedules(item.schedules)

            return (
              <div key={item.id}>
                {/* Main row */}
                <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700/50 transition-colors">
                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                  >
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_CONFIG[item.category].icon}</span>
                      <span className="font-medium text-white text-sm">{item.name}</span>
                      <span className={`text-xs ${priorityConfig.color}`}>{priorityConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{item.frequency}</span>
                      <span>|</span>
                      <span>{item.fee}</span>
                      <span>|</span>
                      <span className="text-gray-400">{item.target}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>

                  {/* Link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-white flex-shrink-0"
                    title="접수 사이트"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-700/50">
                    <div className="space-y-3 pl-6">
                      {/* Notes */}
                      {item.notes && (
                        <div className="text-sm text-gray-400">{item.notes}</div>
                      )}

                      {/* Schedule timeline */}
                      {schedules.length > 0 ? (
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-2">📅 시험 일정</div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-gray-500">
                                  <th className="text-left py-1 pr-3 font-normal">회차</th>
                                  <th className="text-left py-1 pr-3 font-normal">접수 기간</th>
                                  <th className="text-left py-1 pr-3 font-normal">시험일</th>
                                  <th className="text-left py-1 pr-3 font-normal">발표</th>
                                  <th className="text-left py-1 font-normal">상태</th>
                                </tr>
                              </thead>
                              <tbody>
                                {schedules.map((s, i) => {
                                  const sStatus = getScheduleStatus(s.regStart, s.regEnd, s.examDate)
                                  return (
                                    <tr key={i} className="border-t border-gray-800">
                                      <td className="py-1.5 pr-3 text-gray-300">{s.round}</td>
                                      <td className="py-1.5 pr-3 text-gray-400 font-mono text-xs">
                                        {s.regStart} ~ {s.regEnd}
                                      </td>
                                      <td className="py-1.5 pr-3 text-white font-mono text-xs">{s.examDate}</td>
                                      <td className="py-1.5 pr-3 text-gray-500 font-mono text-xs">{s.resultDate}</td>
                                      <td className="py-1.5">
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${sStatus.bgColor} ${sStatus.color}`}>
                                          {sStatus.label}
                                        </span>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {item.frequency.includes('상시')
                            ? '상시 접수 가능 - 원하는 날짜에 직접 접수'
                            : '상세 일정은 공식 사이트에서 확인'}
                        </div>
                      )}

                      {/* Quick action */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        접수 사이트 열기
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 bg-gray-800 rounded-xl p-3">
        <div className="text-xs text-gray-500 mb-2">접수 상태</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-green-400">● 접수 중</span>
          <span className="text-yellow-400">● D-14 이내</span>
          <span className="text-gray-500">● 예정</span>
          <span className="text-blue-400">● 시험 대기</span>
          <span className="text-gray-600">● 종료</span>
        </div>
      </div>
    </div>
  )
}
