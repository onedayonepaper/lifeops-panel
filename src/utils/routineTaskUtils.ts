// 루틴 태스크 완료 상태 관리 유틸리티
// Google Tasks API를 통해 태스크 상태를 업데이트합니다

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1'
const TASK_LIST_TITLE = 'LifeOps 오늘 카드'

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// Task List ID 가져오기
async function getTaskListId(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${TASKS_API}/users/@me/lists`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!response.ok) return null

    const data = await response.json()
    const list = data.items?.find((l: { title: string; id: string }) => l.title === TASK_LIST_TITLE)
    return list?.id || null
  } catch {
    return null
  }
}

// 오늘 태스크 가져오기
async function getTodayTasks(accessToken: string, listId: string): Promise<Array<{ id: string; notes?: string; status: string }>> {
  try {
    const response = await fetch(
      `${TASKS_API}/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!response.ok) return []

    const data = await response.json()
    const todayKey = getTodayKey()
    return (data.items || []).filter((task: { notes?: string }) =>
      task.notes?.includes(`[date:${todayKey}]`)
    )
  } catch {
    return []
  }
}

// 태스크 상태 업데이트
async function updateTaskStatus(
  accessToken: string,
  listId: string,
  taskId: string,
  completed: boolean
): Promise<boolean> {
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
}

// 특정 태스크 완료로 마킹 (Google Tasks API 사용)
export async function markTaskComplete(itemId: string): Promise<boolean> {
  // GoogleAuthContext에서 저장한 토큰 사용
  const accessToken = localStorage.getItem('google_calendar_token')
  if (!accessToken) {
    console.error('Not signed in - cannot mark task complete')
    return false
  }

  try {
    const listId = await getTaskListId(accessToken)
    if (!listId) {
      console.error('Task list not found')
      return false
    }

    const tasks = await getTodayTasks(accessToken, listId)
    const task = tasks.find(t => t.notes?.includes(`[itemId:${itemId}]`))

    if (!task) {
      console.error('Task not found:', itemId)
      return false
    }

    const success = await updateTaskStatus(accessToken, listId, task.id, true)

    if (success) {
      // 커스텀 이벤트 발생 (DailyRoutineCard가 리스닝할 수 있도록)
      window.dispatchEvent(new CustomEvent('routineTaskUpdated', { detail: { itemId, checked: true } }))
    }

    return success
  } catch (err) {
    console.error('Failed to mark task complete:', err)
    return false
  }
}

// 특정 태스크 ID로 완료 상태 확인
export async function isTaskCompleted(itemId: string): Promise<boolean> {
  const accessToken = localStorage.getItem('google_calendar_token')
  if (!accessToken) return false

  try {
    const listId = await getTaskListId(accessToken)
    if (!listId) return false

    const tasks = await getTodayTasks(accessToken, listId)
    const task = tasks.find(t => t.notes?.includes(`[itemId:${itemId}]`))

    return task?.status === 'completed'
  } catch {
    return false
  }
}

// actionUrl로 태스크 ID 찾기
export function getTaskIdByUrl(url: string): string | null {
  const urlToTaskMap: Record<string, string> = {
    '/apply': 'r1-1',
    '/japanese': 'r1-2',
    '/japanese/hiragana': 'r1-2',
    '/portfolio': 'r1-3',
  }
  return urlToTaskMap[url] || null
}

// URL로 완료 상태 확인
export async function isTaskCompletedByUrl(url: string): Promise<boolean> {
  const taskId = getTaskIdByUrl(url)
  if (!taskId) return false
  return isTaskCompleted(taskId)
}

// URL로 태스크 완료 마킹
export async function markTaskCompleteByUrl(url: string): Promise<boolean> {
  const taskId = getTaskIdByUrl(url)
  if (!taskId) return false
  return markTaskComplete(taskId)
}
