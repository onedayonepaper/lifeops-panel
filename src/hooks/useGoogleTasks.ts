import { useState, useEffect, useCallback } from 'react'

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

export function useGoogleTasks(accessToken: string | null): GoogleTasksState & {
  refresh: () => void
  addTask: (title: string, notes?: string, due?: string) => Promise<boolean>
  toggleTask: (taskId: string, completed: boolean) => Promise<boolean>
  deleteTask: (taskId: string) => Promise<boolean>
  updateTask: (taskId: string, title: string, notes?: string, due?: string) => Promise<boolean>
  selectList: (listId: string) => void
} {
  const [state, setState] = useState<GoogleTasksState>({
    tasks: [],
    taskLists: [],
    selectedListId: null,
    isLoading: false,
    error: null
  })

  // Fetch task lists
  const fetchTaskLists = useCallback(async (token: string) => {
    try {
      const response = await fetch(
        'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          tasks: [],
          taskLists: []
        }))
        return null
      }

      if (!response.ok) {
        throw new Error('할일 목록을 가져올 수 없습니다')
      }

      const data = await response.json()
      const lists: TaskList[] = (data.items || []).map((list: any) => ({
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
  const fetchTasks = useCallback(async (token: string, listId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          tasks: []
        }))
        return
      }

      if (!response.ok) {
        throw new Error('할일을 가져올 수 없습니다')
      }

      const data = await response.json()
      const tasks = (data.items || [])
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
    if (!accessToken) {
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
      const lists = await fetchTaskLists(accessToken)

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

        await fetchTasks(accessToken, selectedList)
      } else {
        setState(prev => ({
          ...prev,
          taskLists: lists || [],
          isLoading: false
        }))
      }
    }

    init()
  }, [accessToken, fetchTaskLists, fetchTasks])

  // Refresh tasks
  const refresh = useCallback(() => {
    if (accessToken && state.selectedListId) {
      fetchTasks(accessToken, state.selectedListId)
    }
  }, [accessToken, state.selectedListId, fetchTasks])

  // Select a different task list
  const selectList = useCallback((listId: string) => {
    localStorage.setItem('google_tasks_selected_list', listId)
    setState(prev => ({ ...prev, selectedListId: listId }))
    if (accessToken) {
      fetchTasks(accessToken, listId)
    }
  }, [accessToken, fetchTasks])

  // Add a new task
  const addTask = useCallback(async (title: string, notes?: string, due?: string): Promise<boolean> => {
    if (!accessToken || !state.selectedListId) return false

    try {
      const task: any = { title }
      if (notes) task.notes = notes
      if (due) task.due = new Date(due).toISOString()

      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${state.selectedListId}/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        }
      )

      if (!response.ok) return false

      await fetchTasks(accessToken, state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to add task:', error)
      return false
    }
  }, [accessToken, state.selectedListId, fetchTasks])

  // Toggle task completion
  const toggleTask = useCallback(async (taskId: string, completed: boolean): Promise<boolean> => {
    if (!accessToken || !state.selectedListId) return false

    try {
      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${state.selectedListId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: completed ? 'completed' : 'needsAction',
            completed: completed ? new Date().toISOString() : null
          })
        }
      )

      if (!response.ok) return false

      await fetchTasks(accessToken, state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to toggle task:', error)
      return false
    }
  }, [accessToken, state.selectedListId, fetchTasks])

  // Delete a task
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!accessToken || !state.selectedListId) return false

    try {
      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${state.selectedListId}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok && response.status !== 204) return false

      await fetchTasks(accessToken, state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to delete task:', error)
      return false
    }
  }, [accessToken, state.selectedListId, fetchTasks])

  // Update a task
  const updateTask = useCallback(async (taskId: string, title: string, notes?: string, due?: string): Promise<boolean> => {
    if (!accessToken || !state.selectedListId) return false

    try {
      const task: any = { title }
      if (notes !== undefined) task.notes = notes
      if (due) task.due = new Date(due).toISOString()

      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${state.selectedListId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        }
      )

      if (!response.ok) return false

      await fetchTasks(accessToken, state.selectedListId)
      return true
    } catch (error) {
      console.error('Failed to update task:', error)
      return false
    }
  }, [accessToken, state.selectedListId, fetchTasks])

  return {
    ...state,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    selectList
  }
}
