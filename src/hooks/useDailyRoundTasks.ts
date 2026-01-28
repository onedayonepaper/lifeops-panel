import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1'
const TASK_LIST_TITLE = 'LifeOps 오늘 카드'

interface GoogleTask {
  id: string
  title: string
  notes?: string
  status: 'needsAction' | 'completed'
}

interface TaskList {
  id: string
  title: string
}

export interface RoundItem {
  id: string
  label: string
  detail?: string
  checked: boolean
  actionUrl?: string
  actionLabel?: string
  taskId?: string
}

export interface Round {
  id: string
  title: string
  emoji: string
  description?: string
  items: RoundItem[]
  isSuccess?: boolean
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function getDefaultRounds(): Round[] {
  return [
    {
      id: 'round-0',
      title: '워밍업',
      emoji: '🌅',
      description: '1분',
      items: [
        { id: 'r0-1', label: '물 1컵', checked: false },
      ]
    },
    {
      id: 'round-1',
      title: '최소치 3종 세트',
      emoji: '🎯',
      description: '여기까지만 해도 오늘 성공!',
      isSuccess: true,
      items: [
        { id: 'r1-1', label: '(취업) 개발자 취업하기', detail: '공고 1개 찾기 → 링크 저장 + 요구사항 3줄', checked: false, actionUrl: '/apply', actionLabel: '지원관리' },
        { id: 'r1-2', label: '(일본어) JLPT N2 자격증 취득', detail: '히라가나 10개 읽고 1번 쓰기', checked: false, actionUrl: '/japanese/hiragana', actionLabel: '히라가나' },
        { id: 'r1-3', label: '(포폴) 실제 운영서비스 프로젝트', detail: '프로젝트 1개 4줄 (문제/한 일/기술/결과)', checked: false, actionUrl: '/portfolio', actionLabel: '포폴관리' },
      ]
    },
    {
      id: 'round-2',
      title: '선택 블록 (60~90분)',
      emoji: '🔥',
      description: '아래 중 1개만 하면 성공!',
      items: [
        { id: 'r2-1', label: 'A) 지원/제출 블록', detail: '이력서에 키워드 3개 반영 + 지원동기 5문장 + 제출(또는 직전 저장)', checked: false, actionUrl: '/apply', actionLabel: '지원관리' },
        { id: 'r2-2', label: 'B) JLPT N2 점수 블록', detail: '독해 1세트 + 오답 체크 + 맞은 개수/틀린 유형 3개 기록', checked: false, actionUrl: '/japanese', actionLabel: '일본어학습' },
        { id: 'r2-3', label: 'C) 면접/코테 대비 블록', detail: '알고리즘 1문제 + 풀이 설명 5줄 → 깃헙/노션에 정리', checked: false },
        { id: 'r2-4', label: 'D) 토익스피킹 블록', detail: '모의테스트 1세트 or 파트별 연습 3문제', checked: false },
      ]
    },
  ]
}

export function useDailyRoundTasks() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [rounds, setRounds] = useState<Round[]>(getDefaultRounds())
  const [taskListId, setTaskListId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)

  // Task List 찾기 또는 생성
  const getOrCreateTaskList = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null

    try {
      const listResponse = await fetch(`${TASKS_API}/users/@me/lists`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!listResponse.ok) throw new Error('태스크 리스트 조회 실패')

      const listData = await listResponse.json()
      const existingList = listData.items?.find((list: TaskList) => list.title === TASK_LIST_TITLE)

      if (existingList) {
        return existingList.id
      }

      const createResponse = await fetch(`${TASKS_API}/users/@me/lists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: TASK_LIST_TITLE })
      })

      if (!createResponse.ok) throw new Error('태스크 리스트 생성 실패')

      const newList = await createResponse.json()
      return newList.id
    } catch (err) {
      console.error('Task list error:', err)
      return null
    }
  }, [accessToken])

  // 오늘 태스크 가져오기
  const fetchTodayTasks = useCallback(async (listId: string): Promise<GoogleTask[]> => {
    if (!accessToken) return []

    try {
      const response = await fetch(
        `${TASKS_API}/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      const todayKey = getTodayKey()

      return (data.items || []).filter((task: GoogleTask) =>
        task.notes?.includes(`[date:${todayKey}]`)
      )
    } catch {
      return []
    }
  }, [accessToken])

  // 태스크 생성
  const createTask = useCallback(async (
    listId: string,
    item: RoundItem,
    roundTitle: string
  ): Promise<string | null> => {
    if (!accessToken) return null

    try {
      const todayKey = getTodayKey()
      const response = await fetch(`${TASKS_API}/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `[${roundTitle}] ${item.label}`,
          notes: `${item.detail || ''}\n[date:${todayKey}][itemId:${item.id}]`,
          status: item.checked ? 'completed' : 'needsAction'
        })
      })

      if (!response.ok) return null

      const task = await response.json()
      return task.id
    } catch {
      return null
    }
  }, [accessToken])

  // 태스크 상태 업데이트
  const updateTaskStatus = useCallback(async (
    listId: string,
    taskId: string,
    completed: boolean
  ): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(`${TASKS_API}/lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: completed ? 'completed' : 'needsAction'
        })
      })

      return response.ok
    } catch {
      return false
    }
  }, [accessToken])

  // Google Tasks와 동기화
  const syncWithGoogle = useCallback(async () => {
    if (!accessToken || !isSignedIn) return

    setIsSyncing(true)
    setError(null)

    try {
      const listId = await getOrCreateTaskList()
      if (!listId) {
        setError('태스크 리스트를 찾을 수 없습니다')
        setIsSyncing(false)
        return
      }
      setTaskListId(listId)

      const existingTasks = await fetchTodayTasks(listId)

      if (existingTasks.length > 0) {
        // Google Tasks에서 상태 가져오기
        const updatedRounds = rounds.map(round => ({
          ...round,
          items: round.items.map(item => {
            const matchingTask = existingTasks.find((task: GoogleTask) =>
              task.notes?.includes(`[itemId:${item.id}]`)
            )
            if (matchingTask) {
              return {
                ...item,
                checked: matchingTask.status === 'completed',
                taskId: matchingTask.id
              }
            }
            return item
          })
        }))
        setRounds(updatedRounds)
      } else {
        // 새 태스크 생성
        const updatedRounds: Round[] = []
        for (const round of rounds) {
          const updatedItems: RoundItem[] = []
          for (const item of round.items) {
            const taskId = await createTask(listId, item, round.title)
            updatedItems.push({ ...item, taskId: taskId || undefined })
          }
          updatedRounds.push({ ...round, items: updatedItems })
        }
        setRounds(updatedRounds)
      }

      setLastSynced(new Date())
    } catch (err) {
      console.error('Sync error:', err)
      setError('동기화 실패')
    }

    setIsSyncing(false)
    setIsLoading(false)
  }, [accessToken, isSignedIn, rounds, getOrCreateTaskList, fetchTodayTasks, createTask, updateTaskStatus])

  // 항목 토글
  const toggleItem = useCallback(async (roundId: string, itemId: string) => {
    if (!isSignedIn || !taskListId) {
      setError('로그인이 필요합니다')
      return
    }

    // 이미 토글 중인 항목이 있으면 무시
    if (togglingItemId) return

    const round = rounds.find(r => r.id === roundId)
    const item = round?.items.find(i => i.id === itemId)
    if (!item) return

    const newChecked = !item.checked
    setTogglingItemId(itemId)

    try {
      // Google Tasks 먼저 업데이트
      if (item.taskId) {
        const success = await updateTaskStatus(taskListId, item.taskId, newChecked)
        if (!success) {
          setError('태스크 업데이트 실패')
          setTogglingItemId(null)
          return
        }
      }

      // 상태 업데이트
      const updatedRounds = rounds.map(r => {
        if (r.id !== roundId) return r
        return {
          ...r,
          items: r.items.map(i => {
            if (i.id !== itemId) return i
            return { ...i, checked: newChecked }
          })
        }
      })
      setRounds(updatedRounds)

      // 커스텀 이벤트 발생 (다른 컴포넌트 동기화용)
      window.dispatchEvent(new CustomEvent('roundTaskUpdated', { detail: { itemId, checked: newChecked } }))
    } finally {
      setTogglingItemId(null)
    }
  }, [rounds, taskListId, isSignedIn, togglingItemId, updateTaskStatus])

  // 초기화
  const resetToday = useCallback(async () => {
    if (!isSignedIn || !taskListId || !accessToken) {
      setError('로그인이 필요합니다')
      return
    }

    if (!confirm('오늘 체크리스트를 초기화할까요?')) return

    const defaultRounds = getDefaultRounds()
    setIsSyncing(true)

    // 기존 태스크 삭제
    const existingTasks = await fetchTodayTasks(taskListId)
    for (const task of existingTasks) {
      try {
        await fetch(`${TASKS_API}/lists/${taskListId}/tasks/${task.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      } catch {
        // 무시
      }
    }

    // 새 태스크 생성
    const newRounds: Round[] = []
    for (const round of defaultRounds) {
      const updatedItems: RoundItem[] = []
      for (const item of round.items) {
        const taskId = await createTask(taskListId, item, round.title)
        updatedItems.push({ ...item, taskId: taskId || undefined })
      }
      newRounds.push({ ...round, items: updatedItems })
    }
    setRounds(newRounds)
    setIsSyncing(false)
  }, [taskListId, accessToken, isSignedIn, fetchTodayTasks, createTask])

  // 로그인 시 동기화
  useEffect(() => {
    if (isSignedIn && accessToken && !taskListId) {
      syncWithGoogle()
    } else if (!isSignedIn) {
      setIsLoading(false)
    }
  }, [isSignedIn, accessToken, taskListId, syncWithGoogle])

  return {
    rounds,
    isSyncing,
    isLoading,
    lastSynced,
    error,
    isSignedIn,
    signIn,
    toggleItem,
    resetToday,
    syncWithGoogle,
    togglingItemId
  }
}
