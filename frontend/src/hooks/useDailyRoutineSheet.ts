import { useState, useCallback, useMemo } from 'react'

// 매일 반복되는 고정 루틴 항목
const FIXED_ROUTINES = [
  { id: 'r-15', label: '(건강) 러닝', detail: '워밍업 5분 → 러닝 30분 → 쿨다운 5분', category: '건강', order: 0, location: '집', time: '12:00~12:40' },
  { id: 'r-4', label: '(스펙) JLPT 공부하기', detail: '평일: 인터넷 강의 30분 + 단어/문법 복습 / 주말: Netflix 2-3편 몰아보기 (자막 학습 모드) + 강의 복습', category: '스펙', order: 1, location: '독서실', time: '07:00~08:00' },
  { id: 'r-2', label: '(스펙) 토익스피킹 공부하기', detail: '평일(40분): 강의 20분(템플릿 학습) + 모의고사 1-2문제 풀고 녹음 20분 / 주말(1-2시간): 모의고사 1회 풀기', category: '스펙', order: 3, location: '독서실', time: '08:00~08:40' },
  { id: 'r-5', label: '(스펙) SQLD 공부하기', detail: 'SQLD 인터넷 강의 1시간 + SQLD 문제 풀이 40분', category: '스펙', order: 4, location: '독서실', time: '08:40~10:20' },
  { id: 'r-6', label: '(스펙) 코딩테스트 1문제 풀기', detail: '매일 1문제 풀기 (프로그래머스/백준)', category: '스펙', order: 5, location: '독서실', time: '10:20~10:50' },
  { id: 'r-8', label: '(스펙) CS 기초 공부', detail: 'OS, 네트워크, DB, 자료구조 중 1주제 30분 학습 (면접 + 코테 대비)', category: '스펙', order: 6, location: '독서실', time: '10:50~11:20' },
  { id: 'r-9', label: '(스펙) 한국사능력검정시험 준비', detail: '기출문제 풀이 or 강의 30분 (공공기관 전산직 필수)', category: '스펙', order: 7, location: '독서실', time: '11:20~11:50' },
  { id: 'r-10', label: '(스펙) TOEIC 공부', detail: 'LC/RC 문제 풀이 30분 (공공기관 커트라인 대비)', category: '스펙', order: 8, location: '독서실', time: '11:50~12:20' },
  { id: 'r-7', label: '(스펙) 학습서 보기', detail: '일본어 학습서 + 토익스피킹 학습서 읽기', category: '스펙', order: 9, location: '집', time: '18:50~19:20' },
  { id: 'r-3', label: '(취업) 공고 검색 및 지원', detail: '사람인/잡코리아/워크넷 공고 탐색 → 조건 맞는 공고 1건 이상 지원', category: '취업', order: 10, location: '집', actionUrl: '/employment', actionLabel: '취업관리', time: '19:20~19:40' },
  { id: 'r-18', label: '(취업) 이력서/자소서 수정', detail: '지원 공고에 맞춰 이력서 키워드 수정 + 자소서 항목별 맞춤 작성', category: '취업', order: 11, location: '집', time: '19:40~20:00' },
  { id: 'r-19', label: '(취업) 포트폴리오 정리', detail: '프로젝트 README 보완, 기술 스택 업데이트, 배포 링크 점검', category: '취업', order: 12, location: '집', time: '20:00~20:10' },
  { id: 'r-12', label: '(취업) 기술면접 준비', detail: 'CS 기출 질문 1개 답변 정리 (Java/Spring/DB/네트워크)', category: '취업', order: 13, location: '집', time: '20:10~20:20' },
  { id: 'r-20', label: '(취업) 인성면접 준비', detail: '예상 질문 1개 답변 작성 (자기소개/지원동기/장단점/갈등경험)', category: '취업', order: 14, location: '집', time: '20:20~20:30' },
  { id: 'r-13', label: '(수익화) 아이디어/트렌드 리서치', detail: 'Product Hunt/인디해커스/Reddit 탐색, 수익화 가능한 아이디어 메모', category: '수익화', order: 12, location: '집', time: '15:00~15:15' },
  { id: 'r-21', label: '(수익화) 기능 구현/개선', detail: '사이드 프로젝트 기능 1개 구현 또는 기존 기능 개선 (코딩)', category: '수익화', order: 13, location: '집', time: '15:15~15:45' },
  { id: 'r-22', label: '(수익화) 커밋 & 배포', detail: '코드 커밋 → 빌드 확인 → 프로덕션 배포 → 동작 검증', category: '수익화', order: 14, location: '집', time: '15:45~15:55' },
  { id: 'r-23', label: '(수익화) 마케팅/피드백 확인', detail: '사용자 피드백 확인, 블로그 글 작성, SNS 홍보, 수익 현황 체크', category: '수익화', order: 15, location: '집', time: '15:55~16:00' },
  { id: 'r-14', label: '(스펙) RAG 공부', detail: 'RAG 아키텍처 이해 → 벡터DB/임베딩 실습 → LangChain/LlamaIndex 활용 → 미니 프로젝트 구현', category: '스펙', order: 13, location: '집', time: '17:00~18:00' },
  { id: 'r-17', label: '(건강) 천국의 계단', detail: '계단 오르기 20분 (유산소 + 하체 강화)', category: '건강', order: 15, location: '독서실', time: '12:20~12:40' },
  { id: 'r-16', label: '(건강) 헬스', detail: '근력운동 40분 (스쿼트/벤치프레스/데드리프트/로우) + 스트레칭 10분', category: '건강', order: 16, location: '집', time: '18:00~18:50' },
]

export interface RoutineTemplate {
  id: string
  label: string
  detail?: string
  category?: string
  order: number
  location?: '집' | '독서실'
  time?: string
  actionUrl?: string
  actionLabel?: string
}

export interface RoutineLogItem {
  id: string
  routineId: string
  label: string
  detail?: string
  location?: '집' | '독서실'
  time?: string
  date: string  // YYYY-MM-DD
  completed: boolean
  completedAt?: string  // ISO datetime
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

const STORAGE_KEY_PREFIX = 'routine_checks_'

function loadCheckedState(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${getTodayKey()}`)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveCheckedState(state: Record<string, boolean>) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${getTodayKey()}`, JSON.stringify(state))
}

export function useDailyRoutineSheet() {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(loadCheckedState)

  const today = getTodayKey()

  // 고정 루틴에서 오늘 로그 생성
  const todayLogs: RoutineLogItem[] = useMemo(() =>
    FIXED_ROUTINES.map(r => ({
      id: `log_${r.id}_${today}`,
      routineId: r.id,
      label: r.label,
      detail: r.detail,
      location: r.location as '집' | '독서실' | undefined,
      time: r.time,
      date: today,
      completed: checkedState[r.id] || false,
      completedAt: checkedState[r.id] ? new Date().toISOString() : undefined
    }))
  , [today, checkedState])

  const templates: RoutineTemplate[] = FIXED_ROUTINES.map(r => ({
    ...r,
    location: r.location as '집' | '독서실' | undefined
  }))

  // 항목 토글
  const toggleItem = useCallback((logId: string) => {
    const log = FIXED_ROUTINES.find(r => `log_${r.id}_${getTodayKey()}` === logId)
    if (!log) return

    setCheckedState(prev => {
      const newState = { ...prev, [log.id]: !prev[log.id] }
      saveCheckedState(newState)
      return newState
    })
  }, [])

  // 초기화
  const resetToday = useCallback(() => {
    if (!confirm('오늘 체크리스트를 초기화할까요?')) return
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${getTodayKey()}`)
    setCheckedState({})
  }, [])

  // 통계
  const stats = useMemo(() => {
    const total = todayLogs.length
    const completed = todayLogs.filter(l => l.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [todayLogs])

  return {
    templates,
    todayLogs,
    isLoading: false,
    isSaving: false,
    error: null,
    isSignedIn: true,
    signIn: () => {},
    toggleItem,
    addItem: async (_label?: string) => {},
    removeItem: async (_id?: string) => {},
    postponeItem: async (_id?: string) => {},
    resetToday,
    refresh: async () => {},
    stats,
    spreadsheetUrl: null
  }
}
