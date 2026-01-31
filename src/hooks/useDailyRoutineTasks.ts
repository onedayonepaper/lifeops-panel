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

export interface RoutineItem {
  id: string
  label: string
  detail?: string
  checked: boolean
  actionUrl?: string
  actionLabel?: string
  taskId?: string
}

export interface Routine {
  id: string
  title: string
  emoji: string
  description?: string
  items: RoutineItem[]
  isSuccess?: boolean
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function getDefaultRoutines(): Routine[] {
  return [
    {
      id: 'round-0',
      title: '오늘의 루틴',
      emoji: '🌅',
      description: '하나씩 체크하며 오늘을 완성하자!',
      items: [
        { id: 'r0-2', label: '(스펙) 프로젝트 관리', detail: '프로젝트 문서 1개 정리', checked: false, actionUrl: '/portfolio', actionLabel: '프로젝트 관리' },
        { id: 'r0-3', label: '(스펙) 일본어 JLPT 공부', detail: 'JLPT 강의 1개 > JLPT 책 10분 > 단어/문법 10개 암기', checked: false, actionUrl: '/japanese', actionLabel: '일본어' },
        { id: 'r0-4', label: '(스펙) 토익스피킹 자격증 따기', detail: '토익스피킹 문제 풀이 or 모범답안 암기 or 실전 연습', checked: false },
        { id: 'r0-5', label: '(취업) 취업루틴', detail: '공고 1개 체크 > 이력서 1줄 수정 > 포폴 1개 정리', checked: false, actionUrl: '/employment', actionLabel: '취업관리' },
      ]
    },
  ]
}

export function useDailyRoutineTasks() {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [routines, setRoutines] = useState<Routine[]>(getDefaultRoutines())
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
    item: RoutineItem,
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
        const updatedRoutines = routines.map(routine => ({
          ...routine,
          items: routine.items.map(item => {
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
        setRoutines(updatedRoutines)
      } else {
        // 새 태스크 생성
        const updatedRoutines: Routine[] = []
        for (const routine of routines) {
          const updatedItems: RoutineItem[] = []
          for (const item of routine.items) {
            const taskId = await createTask(listId, item, routine.title)
            updatedItems.push({ ...item, taskId: taskId || undefined })
          }
          updatedRoutines.push({ ...routine, items: updatedItems })
        }
        setRoutines(updatedRoutines)
      }

      setLastSynced(new Date())
    } catch (err) {
      console.error('Sync error:', err)
      setError('동기화 실패')
    }

    setIsSyncing(false)
    setIsLoading(false)
  }, [accessToken, isSignedIn, routines, getOrCreateTaskList, fetchTodayTasks, createTask])

  // 항목 토글
  const toggleItem = useCallback(async (roundId: string, itemId: string) => {
    if (!isSignedIn || !taskListId) {
      setError('로그인이 필요합니다')
      return
    }

    // 이미 토글 중인 항목이 있으면 무시
    if (togglingItemId) return

    const routine = routines.find(r => r.id === roundId)
    const item = routine?.items.find(i => i.id === itemId)
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
      const updatedRoutines = routines.map(r => {
        if (r.id !== roundId) return r
        return {
          ...r,
          items: r.items.map(i => {
            if (i.id !== itemId) return i
            return { ...i, checked: newChecked }
          })
        }
      })
      setRoutines(updatedRoutines)

      // 커스텀 이벤트 발생 (다른 컴포넌트 동기화용)
      window.dispatchEvent(new CustomEvent('routineTaskUpdated', { detail: { itemId, checked: newChecked } }))
    } finally {
      setTogglingItemId(null)
    }
  }, [routines, taskListId, isSignedIn, togglingItemId, updateTaskStatus])

  // 초기화
  const resetToday = useCallback(async () => {
    if (!isSignedIn || !taskListId || !accessToken) {
      setError('로그인이 필요합니다')
      return
    }

    if (!confirm('오늘 체크리스트를 초기화할까요?')) return

    const defaultRoutines = getDefaultRoutines()
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
    const newRoutines: Routine[] = []
    for (const round of defaultRoutines) {
      const updatedItems: RoutineItem[] = []
      for (const item of round.items) {
        const taskId = await createTask(taskListId, item, round.title)
        updatedItems.push({ ...item, taskId: taskId || undefined })
      }
      newRoutines.push({ ...round, items: updatedItems })
    }
    setRoutines(newRoutines)
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
    routines,
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
