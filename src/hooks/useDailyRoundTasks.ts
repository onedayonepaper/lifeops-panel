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

const STORAGE_KEY = 'daily-round-card'

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function getStorageKey(): string {
  return `${STORAGE_KEY}-${getTodayKey()}`
}

function getDefaultRounds(): Round[] {
  return [
    {
      id: 'round-0',
      title: '워밍업',
      emoji: '🌅',
      description: '5분',
      items: [
        { id: 'r0-1', label: '물 1컵', checked: false },
        { id: 'r0-2', label: '세수/양치', checked: false },
        { id: 'r0-3', label: '노트북/노트 펼치기', checked: false },
      ]
    },
    {
      id: 'round-1',
      title: '최소치 3종 세트',
      emoji: '🎯',
      description: '여기까지만 해도 오늘 성공!',
      isSuccess: true,
      items: [
        { id: 'r1-1', label: '취업 15분', detail: '프로젝트 1개 4줄 (문제/한 일/기술/결과)', checked: false, actionUrl: '/apply', actionLabel: '지원관리' },
        { id: 'r1-2', label: '일본어 10분', detail: '히라가나 10개 읽고 1번 쓰기', checked: false, actionUrl: 'https://www.duolingo.com', actionLabel: 'Duolingo' },
        { id: 'r1-3', label: '포폴 15분', detail: 'README 2줄 추가하고 저장', checked: false, actionUrl: 'https://github.com/onedayonepaper', actionLabel: '내 GitHub' },
      ]
    },
    {
      id: 'round-2',
      title: '욕심 충족 확장',
      emoji: '🔥',
      description: '선택사항',
      items: [
        { id: 'r2-1', label: '취업 확장', detail: '"내가 한 일" 3개로 다듬기 + 숫자 붙이기', checked: false, actionUrl: '/apply', actionLabel: '지원관리' },
        { id: 'r2-2', label: '일본어 확장', detail: '히라가나 10개 추가 (총 20개)', checked: false, actionUrl: 'https://www.duolingo.com', actionLabel: 'Duolingo' },
        { id: 'r2-3', label: '포폴 확장', detail: '커밋 1번 또는 스크린샷 1장', checked: false, actionUrl: 'https://github.com/onedayonepaper', actionLabel: '내 GitHub' },
      ]
    },
  ]
}

export function useDailyRoundTasks() {
  const { accessToken, isSignedIn } = useGoogleAuth()
  const [rounds, setRounds] = useState<Round[]>(() => {
    const saved = localStorage.getItem(getStorageKey())
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return getDefaultRounds()
      }
    }
    return getDefaultRounds()
  })
  const [taskListId, setTaskListId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // localStorage에 저장
  const saveToLocal = useCallback((newRounds: Round[]) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(newRounds))
    setRounds(newRounds)
  }, [])

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
        // 기존 태스크 상태 동기화
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
        saveToLocal(updatedRounds)
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
        saveToLocal(updatedRounds)
      }

      setLastSynced(new Date())
    } catch (err) {
      console.error('Sync error:', err)
      setError('동기화 실패')
    }

    setIsSyncing(false)
  }, [accessToken, isSignedIn, rounds, getOrCreateTaskList, fetchTodayTasks, createTask, saveToLocal])

  // 항목 토글
  const toggleItem = useCallback(async (roundId: string, itemId: string) => {
    const round = rounds.find(r => r.id === roundId)
    const item = round?.items.find(i => i.id === itemId)
    if (!item) return

    const newChecked = !item.checked

    // 로컬 상태 먼저 업데이트
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
    saveToLocal(updatedRounds)

    // Google Tasks 동기화
    if (taskListId && item.taskId && accessToken) {
      await updateTaskStatus(taskListId, item.taskId, newChecked)
    }
  }, [rounds, taskListId, accessToken, updateTaskStatus, saveToLocal])

  // 초기화
  const resetToday = useCallback(async () => {
    if (!confirm('오늘 체크리스트를 초기화할까요?')) return

    const defaultRounds = getDefaultRounds()

    if (taskListId && accessToken) {
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
      saveToLocal(newRounds)
      setIsSyncing(false)
    } else {
      saveToLocal(defaultRounds)
    }
  }, [taskListId, accessToken, fetchTodayTasks, createTask, saveToLocal])

  // 로그인 시 동기화
  useEffect(() => {
    if (isSignedIn && accessToken && !taskListId) {
      syncWithGoogle()
    }
  }, [isSignedIn, accessToken, taskListId, syncWithGoogle])

  return {
    rounds,
    isSyncing,
    lastSynced,
    error,
    isSignedIn,
    toggleItem,
    resetToday,
    syncWithGoogle
  }
}
