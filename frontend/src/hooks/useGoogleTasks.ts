import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { api } from '../lib/api'

export interface Task {
  id: string
  title: string
  notes?: string
  due?: Date
  completed: boolean
  position: string
}

export interface TaskList {
  id: string
  title: string
}

interface GoogleTasksState {
  tasks: Task[]
  taskLists: TaskList[]
  selectedListId: string | null
  isLoading: boolean
  error: string | null
}

// Parse Google Tasks task
function parseTask(task: any): Task {
  return {
    id: task.id,
    title: task.title || '',
    notes: task.notes,
    due: task.due ? new Date(task.due) : undefined,
    completed: task.status === 'completed',
    position: task.position
  }
}

export function useGoogleTasks(): GoogleTasksState & {
  refresh: () => void
  addTask: (title: string, notes?: string, due?: string) => Promise<boolean>
  toggleTask: (taskId: string, completed: boolean) => Promise<boolean>
  deleteTask: (taskId: string) => Promise<boolean>
  updateTask: (taskId: string, title: string, notes?: string, due?: string) => Promise<boolean>
  postponeTask: (taskId: string) => Promise<boolean>
  selectList: (listId: string) => void
} {
  const { isSignedIn } = useGoogleAuth()

  const [state, setState] = useState<GoogleTasksState>({
    tasks: [],
    taskLists: [],
    selectedListId: null,
    isLoading: false,
    error: null
  })

  // Fetch task lists
  const fetchTaskLists = useCallback(async () => {
    try {
      const items = await api.getTaskLists()
      const lists: TaskList[] = items.map((list: any) => ({
        id: list.id,
        title: list.title
      }))
      return lists
    } catch (error) {
      console.error('Failed to fetch task lists:', error)
      return null
    }
  }, [])

  // Fetch tasks from a specific list
  const fetchTasks = useCallback(async (listId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const items = await api.getTasks(listId)
      const tasks = items
        .filter((task: any) => task.title) // Filter out empty tasks
        .map(parseTask)
        .sort((a: Task, b: Task) => {
          // Incomplete tasks first, then by position
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
          }
          return a.position.localeCompare(b.position)
        })

      setState(prev => ({
        ...prev,
        tasks,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '오류가 발생했습니다'
      }))
    }
  }, [])

  // Initialize - fetch task lists and select the first one
  useEffect(() => {
    if (!isSignedIn) {
      setState(prev => ({
        ...prev,
        tasks: [],
        taskLists: [],
        selectedListId: null,
        isLoading: false
      }))
      return
    }

    const init = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      const lists = await fetchTaskLists()

      if (lists && lists.length > 0) {
        const savedListId = localStorage.getItem('google_tasks_selected_list')
        const selectedList = savedListId && lists.find(l => l.id === savedListId)
          ? savedListId
          : lists[0].id

        setState(prev => ({
          ...prev,
          taskLists: lists,
          selectedListId: selectedList
        }))

        await fetchTasks(selectedList)
      } else {
        setState(prev => ({
          ...prev,
          taskLists: lists || [],
          isLoading: false
        }))
      }
    }

    init()
  }, [isSignedIn, fetchTaskLists, fetchTasks])

  // Refresh tasks
  const refresh = useCallback(() => {
    if (isSignedIn && state.selectedListId) {
      fetchTasks(state.selectedListId)
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  // Select a different task list
  const selectList = useCallback((listId: string) => {
    localStorage.setItem('google_tasks_selected_list', listId)
    setState(prev => ({ ...prev, selectedListId: listId }))
    if (isSignedIn) {
      fetchTasks(listId)
    }
  }, [isSignedIn, fetchTasks])

  // Add a new task
  const addTask = useCallback(async (title: string, notes?: string, due?: string): Promise<boolean> => {
    if (!isSignedIn || !state.selectedListId) return false

    try {
      const task: any = { title }
      if (notes) task.notes = notes
      if (due) task.due = new Date(due).toISOString()

      await api.createTask(state.selectedListId, task)
      await fetchTasks(state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to add task:', error)
      return false
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  // Toggle task completion
  const toggleTask = useCallback(async (taskId: string, completed: boolean): Promise<boolean> => {
    if (!isSignedIn || !state.selectedListId) return false

    try {
      await api.updateTask(state.selectedListId, taskId, {
        status: completed ? 'completed' : 'needsAction',
        completed: completed ? new Date().toISOString() : undefined
      })
      await fetchTasks(state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to toggle task:', error)
      return false
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  // Delete a task
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!isSignedIn || !state.selectedListId) return false

    try {
      await api.deleteTask(state.selectedListId, taskId)
      await fetchTasks(state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to delete task:', error)
      return false
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  // Update a task
  const updateTask = useCallback(async (taskId: string, title: string, notes?: string, due?: string): Promise<boolean> => {
    if (!isSignedIn || !state.selectedListId) return false

    try {
      const task: any = { title }
      if (notes !== undefined) task.notes = notes
      if (due) task.due = new Date(due).toISOString()

      await api.updateTask(state.selectedListId, taskId, task)
      await fetchTasks(state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to update task:', error)
      return false
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  // Postpone task to tomorrow
  const postponeTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!isSignedIn || !state.selectedListId) return false

    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      await api.updateTask(state.selectedListId, taskId, {
        due: tomorrow.toISOString()
      })
      await fetchTasks(state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to postpone task:', error)
      return false
    }
  }, [isSignedIn, state.selectedListId, fetchTasks])

  return {
    ...state,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    postponeTask,
    selectList
  }
}
