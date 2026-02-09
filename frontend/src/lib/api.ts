const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface AuthStatus {
  authenticated: boolean
  email?: string
  expiry?: string
  access_token?: string
}

interface LoginResponse {
  auth_url: string
}

// Calendar types
interface CalendarEventCreate {
  summary: string
  start: { date?: string; dateTime?: string; timeZone?: string }
  end: { date?: string; dateTime?: string; timeZone?: string }
}

interface CalendarEventUpdate {
  summary?: string
  start?: { date?: string; dateTime?: string; timeZone?: string }
  end?: { date?: string; dateTime?: string; timeZone?: string }
}

// Task types
interface TaskCreate {
  title: string
  notes?: string
  due?: string
}

interface TaskUpdate {
  title?: string
  notes?: string
  due?: string
  status?: 'needsAction' | 'completed'
  completed?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `API error: ${response.status}`)
  }
  return response.json()
}

export const api = {
  // ============ Auth ============
  async getAuthStatus(): Promise<AuthStatus> {
    const response = await fetch(`${API_URL}/auth/status`, {
      credentials: 'include',
    })
    return response.json()
  },

  async getLoginUrl(): Promise<string> {
    const response = await fetch(`${API_URL}/auth/login`, {
      credentials: 'include',
    })
    const data: LoginResponse = await response.json()
    return data.auth_url
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  },

  // ============ Calendar ============
  async getCalendarEvents(params?: {
    calendarId?: string
    timeMin?: string
    timeMax?: string
    maxResults?: number
  }): Promise<any[]> {
    const searchParams = new URLSearchParams()
    if (params?.calendarId) searchParams.set('calendar_id', params.calendarId)
    if (params?.timeMin) searchParams.set('time_min', params.timeMin)
    if (params?.timeMax) searchParams.set('time_max', params.timeMax)
    if (params?.maxResults) searchParams.set('max_results', params.maxResults.toString())

    const url = `${API_URL}/api/calendar/events${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, { credentials: 'include' })
    return handleResponse(response)
  },

  async createCalendarEvent(event: CalendarEventCreate, calendarId = 'primary'): Promise<any> {
    const searchParams = new URLSearchParams()
    if (calendarId !== 'primary') searchParams.set('calendar_id', calendarId)

    const url = `${API_URL}/api/calendar/events${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    return handleResponse(response)
  },

  async updateCalendarEvent(eventId: string, event: CalendarEventUpdate, calendarId = 'primary'): Promise<any> {
    const searchParams = new URLSearchParams()
    if (calendarId !== 'primary') searchParams.set('calendar_id', calendarId)

    const url = `${API_URL}/api/calendar/events/${eventId}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
    return handleResponse(response)
  },

  async deleteCalendarEvent(eventId: string, calendarId = 'primary'): Promise<void> {
    const searchParams = new URLSearchParams()
    if (calendarId !== 'primary') searchParams.set('calendar_id', calendarId)

    const url = `${API_URL}/api/calendar/events/${eventId}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    })
    await handleResponse(response)
  },

  // ============ Tasks ============
  async getTaskLists(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/tasks/lists`, {
      credentials: 'include',
    })
    return handleResponse(response)
  },

  async getTasks(tasklistId: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/tasks/${tasklistId}`, {
      credentials: 'include',
    })
    return handleResponse(response)
  },

  async createTask(tasklistId: string, task: TaskCreate): Promise<any> {
    const response = await fetch(`${API_URL}/api/tasks/${tasklistId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    return handleResponse(response)
  },

  async updateTask(tasklistId: string, taskId: string, task: TaskUpdate): Promise<any> {
    const response = await fetch(`${API_URL}/api/tasks/${tasklistId}/${taskId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    return handleResponse(response)
  },

  async deleteTask(tasklistId: string, taskId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/tasks/${tasklistId}/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await handleResponse(response)
  },

  // ============ Sheets ============
  async getSpreadsheet(spreadsheetId: string, fields = 'sheets.properties.title'): Promise<any> {
    const response = await fetch(
      `${API_URL}/api/sheets/${spreadsheetId}?fields=${encodeURIComponent(fields)}`,
      { credentials: 'include' }
    )
    return handleResponse(response)
  },

  async createSpreadsheet(body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/sheets`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async getSheetValues(spreadsheetId: string, range: string): Promise<any> {
    const response = await fetch(
      `${API_URL}/api/sheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { credentials: 'include' }
    )
    return handleResponse(response)
  },

  async updateSheetValues(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption = 'RAW'
  ): Promise<any> {
    const response = await fetch(
      `${API_URL}/api/sheets/${spreadsheetId}/values/${encodeURIComponent(range)}?value_input_option=${valueInputOption}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      }
    )
    return handleResponse(response)
  },

  async appendSheetValues(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption = 'RAW',
    insertDataOption = 'INSERT_ROWS'
  ): Promise<any> {
    const response = await fetch(
      `${API_URL}/api/sheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?value_input_option=${valueInputOption}&insert_data_option=${insertDataOption}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      }
    )
    return handleResponse(response)
  },

  // ============ Drive ============
  async listDriveFiles(params?: {
    q?: string
    pageSize?: number
    orderBy?: string
    fields?: string
  }): Promise<any[]> {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.set('q', params.q)
    if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString())
    if (params?.orderBy) searchParams.set('order_by', params.orderBy)
    if (params?.fields) searchParams.set('fields', params.fields)

    const url = `${API_URL}/api/drive/files${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, { credentials: 'include' })
    return handleResponse(response)
  },

  async getDriveFile(fileId: string, fields?: string): Promise<any> {
    const searchParams = new URLSearchParams()
    if (fields) searchParams.set('fields', fields)

    const url = `${API_URL}/api/drive/files/${fileId}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, { credentials: 'include' })
    return handleResponse(response)
  },

  async createDriveFile(body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/drive/files`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async updateDriveFile(fileId: string, body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/drive/files/${fileId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async deleteDriveFile(fileId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/drive/files/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await handleResponse(response)
  },

  // ============ Docs ============
  async getDocument(documentId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/docs/${documentId}`, {
      credentials: 'include',
    })
    return handleResponse(response)
  },

  async createDocument(body: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/docs`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async batchUpdateDocument(documentId: string, requests: any[]): Promise<any> {
    const response = await fetch(`${API_URL}/api/docs/${documentId}/batchUpdate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    })
    return handleResponse(response)
  },

  // ============ Report PDF ============
  async downloadReportPdf(summary: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${API_URL}/api/report/prepare`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    })
    if (!res.ok) throw new Error(`PDF 준비 실패: ${res.status}`)
    const { token } = await res.json()
    // 숨겨진 iframe으로 다운로드 (Chrome 다운로드 기록 + 파인더 위치 추적)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `${API_URL}/api/report/pdf/${token}`
    document.body.appendChild(iframe)
    setTimeout(() => document.body.removeChild(iframe), 30000)
  },

  // ============ AI Evaluation ============
  async evaluateStatus(summary: Record<string, unknown>): Promise<any> {
    const response = await fetch(`${API_URL}/api/evaluate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    })
    return handleResponse(response)
  },
}
