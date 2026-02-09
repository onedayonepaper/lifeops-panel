import { useState, useCallback, useMemo } from 'react'

// 매일 반복되는 고정 루틴 항목
const FIXED_ROUTINES = [
  { id: 'r-11', label: '(건강) 운동하기', detail: '유산소 or 근력 운동 30분 (산책/러닝/홈트)', category: '건강', order: 1 },
  { id: 'r-3', label: '(취업) 취업루틴', detail: '공고 검색 > 이력서 맞춤 수정 > 자소서 작성 > 포폴 정리', category: '취업', order: 2, actionUrl: '/employment', actionLabel: '취업관리' },
  { id: 'r-12', label: '(취업) 면접 준비', detail: '기술면접 질문 1개 답변 정리 + 인성면접 예상 질문 연습', category: '취업', order: 3 },
  { id: 'r-4', label: '(스펙) 일본어 실전 학습', detail: '평일: 인터넷 강의 30분 → Netflix 1편 (자막 학습 모드) / 주말: Netflix 2-3편 몰아보기 + 강의 복습', category: '스펙', order: 4 },
  { id: 'r-2', label: '(스펙) 토익스피킹 공부하기', detail: '평일(40분): 강의 20분(템플릿 학습) + 모의고사 1-2문제 풀고 녹음 20분 / 주말(1-2시간): 모의고사 1회 풀기', category: '스펙', order: 3 },
  { id: 'r-5', label: '(스펙) SQLD 공부하기', detail: 'SQLD 인터넷 강의 1시간 + SQLD 문제 풀이 40분', category: '스펙', order: 4 },
  { id: 'r-6', label: '(스펙) 코딩테스트 1문제 풀기', detail: '매일 1문제 풀기 (프로그래머스/백준)', category: '스펙', order: 5 },
  { id: 'r-8', label: '(스펙) CS 기초 공부', detail: 'OS, 네트워크, DB, 자료구조 중 1주제 30분 학습 (면접 + 코테 대비)', category: '스펙', order: 6 },
  { id: 'r-9', label: '(스펙) 한국사능력검정시험 준비', detail: '기출문제 풀이 or 강의 30분 (공공기관 전산직 필수)', category: '스펙', order: 7 },
  { id: 'r-7', label: '(스펙) 학습서 보기', detail: '일본어 학습서 + 토익스피킹 학습서 읽기', category: '스펙', order: 8 },
  { id: 'r-10', label: '(스펙) TOEIC 공부', detail: 'LC/RC 문제 풀이 30분 (공공기관 커트라인 대비)', category: '스펙', order: 11 },
]

export interface RoutineTemplate {
  id: string
  label: string
  detail?: string
  category?: string
  order: number
  actionUrl?: string
  actionLabel?: string
}

export interface RoutineLogItem {
  id: string
  routineId: string
  label: string
  detail?: string
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
      date: today,
      completed: checkedState[r.id] || false,
      completedAt: checkedState[r.id] ? new Date().toISOString() : undefined
    }))
  , [today, checkedState])

  const templates: RoutineTemplate[] = FIXED_ROUTINES

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
    addItem: async () => {},
    removeItem: async () => {},
    postponeItem: async () => {},
    resetToday,
    refresh: async () => {},
    stats,
    spreadsheetUrl: null
  }
}
