import { useMemo, useCallback, useEffect, useRef } from 'react'
import { useLifeOpsSheets } from './useLifeOpsSheets'

// 오늘 할일 시트 설정 추가
const TODAY_TASKS_CONFIG = {
  sheetName: '오늘 할일',
  headers: ['id', 'title', 'completed', 'due', 'createdAt'] as const
}

// 기본 할일 템플릿 (매일 자동 생성)
const DEFAULT_DAILY_TASKS = [
  { title: '아침 스트레칭 10분', category: '건강' },
  { title: '물 2L 마시기', category: '건강' },
  { title: '오늘 감사한 일 3가지 적기', category: '마음' },
  { title: '취업 공고 1개 확인하기', category: '취업' },
  { title: '코딩 1시간', category: '개발' },
]

export interface TodayTask {
  id: string
  title: string
  completed: boolean
  due?: string  // YYYY-MM-DD format
  createdAt: string
}

// Row to Object 변환
function rowToTask(row: string[]): TodayTask {
  return {
    id: row[0] || '',
    title: row[1] || '',
    completed: row[2] === 'true',
    due: row[3] || undefined,
    createdAt: row[4] || ''
  }
}

// Object to Row 변환
function taskToRow(task: TodayTask): string[] {
  return [
    task.id,
    task.title,
    String(task.completed),
    task.due || '',
    task.createdAt
  ]
}

export function useTodayTasksSheet() {
  const {
    data,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    refresh,
    addItem,
    updateItem,
    deleteItem,
    spreadsheetUrl
  } = useLifeOpsSheets<TodayTask>(
    TODAY_TASKS_CONFIG,
    rowToTask,
    taskToRow
  )

  const hasInitialized = useRef(false)

  // 오늘 날짜
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  // 오늘 할일이 없으면 기본 템플릿으로 자동 생성 (매일)
  useEffect(() => {
    const createDefaultTasks = async () => {
      if (hasInitialized.current || isLoading || !isSignedIn) return

      // 오늘 날짜의 미완료 할일이 있는지 확인
      const todayIncompleteTasks = data.filter(task => {
        if (task.completed) return false
        if (!task.due) return true // 마감일 없는 것도 포함
        return task.due === todayStr
      })

      hasInitialized.current = true

      // 오늘 미완료 할일이 없으면 기본 템플릿 생성
      if (todayIncompleteTasks.length === 0) {
        for (const defaultTask of DEFAULT_DAILY_TASKS) {
          const newTask: TodayTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: defaultTask.title,
            completed: false,
            due: todayStr,
            createdAt: new Date().toISOString()
          }
          await addItem(newTask)
          // 약간의 딜레이로 ID 충돌 방지
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    }

    createDefaultTasks()
  }, [data, isLoading, isSignedIn, todayStr, addItem])

  // 오늘 마감이거나 마감일이 없는 미완료 할일 + 완료된 할일
  const todayTasks = useMemo(() => {
    return data.filter(task => {
      if (task.due) {
        const dueDate = new Date(task.due)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate <= today // 오늘 또는 지난 마감일
      }
      return true // 마감일 없는 할일도 표시
    }).sort((a, b) => {
      // Incomplete tasks first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // Then by createdAt (newest first)
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [data, today])

  const incompleteTasks = useMemo(() =>
    todayTasks.filter(t => !t.completed), [todayTasks])

  const completedTasks = useMemo(() =>
    todayTasks.filter(t => t.completed), [todayTasks])

  // 할일 추가
  const addTask = useCallback(async (title: string, due?: string): Promise<boolean> => {
    const newTask: TodayTask = {
      id: `task_${Date.now()}`,
      title,
      completed: false,
      due: due || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
    return addItem(newTask)
  }, [addItem])

  // 할일 완료 토글
  const toggleTask = useCallback(async (taskId: string, completed: boolean): Promise<boolean> => {
    const task = data.find(t => t.id === taskId)
    if (!task) return false

    return updateItem(taskId, { ...task, completed })
  }, [data, updateItem])

  // 할일 삭제
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    return deleteItem(taskId)
  }, [deleteItem])

  // 내일로 미루기
  const postponeTask = useCallback(async (taskId: string): Promise<boolean> => {
    const task = data.find(t => t.id === taskId)
    if (!task) return false

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    return updateItem(taskId, { ...task, due: tomorrowStr })
  }, [data, updateItem])

  return {
    tasks: todayTasks,
    incompleteTasks,
    completedTasks,
    isLoading,
    isSaving,
    error,
    isSignedIn,
    signIn,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
    postponeTask,
    spreadsheetUrl
  }
}
