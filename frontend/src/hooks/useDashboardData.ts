export interface JobSearchSummary {
  totalApplied: number
  inProgress: number
  offers: number
  rejected: number
  waiting: number
}

export interface SpecSummary {
  passed: number
  registered: number
  studying: number
  notStarted: number
  items: { name: string; status: string }[]
}

export interface RoutineSummary {
  total: number
  completed: number
  percentage: number
  taskTotal: number
  taskCompleted: number
  taskIncomplete: number
}

export interface FinanceSummary {
  netAsset: string
  monthlySaving: string
  investmentRatio: string
}

export interface RoadmapMonth {
  month: string
  items: string[]
}

export interface GoalItem {
  category: string
  goal: string
  deadline: string
}

export interface DashboardSummary {
  jobSearch: JobSearchSummary
  spec: SpecSummary
  routine: RoutineSummary
  finance: FinanceSummary
  roadmap: RoadmapMonth[]
  goals: GoalItem[]
  generatedAt: string
}

// 스펙 하드코딩 데이터 (SpecSchedulePage INITIAL_DATA 기반)
const SPEC_ITEMS: { name: string; status: string }[] = [
  { name: '정보처리기사', status: 'passed' },
  { name: 'PC정비사 2급', status: 'passed' },
  { name: '네트워크 관리사 2급', status: 'passed' },
  { name: 'SQLD', status: 'registered' },
  { name: '한국사능력검정시험', status: 'not_started' },
  { name: 'TOEIC', status: 'not_started' },
  { name: 'TOEIC Speaking', status: 'not_started' },
  { name: 'OPIc', status: 'not_started' },
  { name: 'AWS Cloud Practitioner', status: 'not_started' },
  { name: 'AWS SAA', status: 'not_started' },
  { name: 'JLPT', status: 'not_started' },
  { name: 'JPT', status: 'not_started' },
]

// 재테크 하드코딩 데이터
const FINANCE_DATA: FinanceSummary = {
  netAsset: '약 8,000만원',
  monthlySaving: '0원',
  investmentRatio: '미국주식 87.5%',
}

// 월별 로드맵 (SpecSchedulePage 시험일정 기반)
const ROADMAP: RoadmapMonth[] = [
  { month: '2026년 2월', items: ['SQLD 시험 집중 준비', '취업 공고 탐색 및 지원 (주 2건 목표)', '일상 루틴 정착 (매일 3개 루틴 실행)'] },
  { month: '2026년 3월', items: ['SQLD 제60회 시험 (3/7)', 'TOEIC 접수 및 준비 시작', '취업 지원 지속 (월 5건 이상)'] },
  { month: '2026년 4월', items: ['국가직 9급 필기시험 (4/4)', '한국사능력검정 제78회 접수 (4/21~28)', 'TOEIC 공부 본격화'] },
  { month: '2026년 5월', items: ['한국사 제78회 시험 (5/23)', '국가직 필기 합격자 발표 (5/8)', 'SQLD 제61회 접수 (불합격 시)'] },
  { month: '2026년 6~7월', items: ['국가직 면접 준비 (합격 시)', 'TOEIC 목표 점수 달성 (700+)', 'OPIc/토익스피킹 준비 시작'] },
]

// 핵심 목표
const GOALS: GoalItem[] = [
  { category: '취업', goal: '공공기관/준정부기관 전산직 정규직 입사', deadline: '2026년 하반기' },
  { category: '자격증', goal: 'SQLD 취득', deadline: '2026년 3월' },
  { category: '자격증', goal: '한국사능력검정 2급 이상 취득', deadline: '2026년 상반기' },
  { category: '어학', goal: 'TOEIC 700점 이상', deadline: '2026년 6월' },
  { category: '습관', goal: '매일 루틴 80% 이상 달성 유지', deadline: '지속' },
]

interface BuildInputs {
  appliedCompanies: { status: string }[]
  routineStats: { total: number; completed: number; percentage: number }
  tasks: { completed: boolean }[]
}

export function buildDashboardSummary(inputs: BuildInputs): DashboardSummary {
  const { appliedCompanies, routineStats, tasks } = inputs

  const jobSearch: JobSearchSummary = {
    totalApplied: appliedCompanies.length,
    inProgress: appliedCompanies.filter(c =>
      ['document', 'interview1', 'interview2'].includes(c.status)
    ).length,
    offers: appliedCompanies.filter(c => c.status === 'offer').length,
    rejected: appliedCompanies.filter(c => c.status === 'rejected').length,
    waiting: appliedCompanies.filter(c => c.status === 'waiting').length,
  }

  const spec: SpecSummary = {
    passed: SPEC_ITEMS.filter(i => i.status === 'passed').length,
    registered: SPEC_ITEMS.filter(i => i.status === 'registered').length,
    studying: SPEC_ITEMS.filter(i => i.status === 'studying').length,
    notStarted: SPEC_ITEMS.filter(i => i.status === 'not_started').length,
    items: SPEC_ITEMS,
  }

  const taskCompleted = tasks.filter(t => t.completed).length
  const routine: RoutineSummary = {
    total: routineStats.total,
    completed: routineStats.completed,
    percentage: routineStats.percentage,
    taskTotal: tasks.length,
    taskCompleted,
    taskIncomplete: tasks.length - taskCompleted,
  }

  return {
    jobSearch,
    spec,
    routine,
    finance: FINANCE_DATA,
    roadmap: ROADMAP,
    goals: GOALS,
    generatedAt: new Date().toISOString(),
  }
}
