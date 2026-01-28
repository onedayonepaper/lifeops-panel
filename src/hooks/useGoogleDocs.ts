import { useState, useCallback } from 'react'

const RESUME_IDS_KEY = 'lifeops_resume_ids'
const RESUME_META_KEY = 'lifeops_resume_meta'
const RESUME_DATA_KEY = 'lifeops_resume_data'
const RESUME_FOLDER_KEY = 'lifeops_resume_folder_id'
const RESUME_FOLDER_NAME = '이력서'

export interface PersonalInfo {
  name: string
  birthDate: string
  phone: string
  email: string
  address: string
  blog?: string
  github?: string
  portfolio?: string
}

export interface Education {
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
}

export interface Project {
  name: string
  summary: string
  role: string
  tasks: string[]
  techStack: string
  result: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  projects: Project[]
}

export interface Certification {
  name: string
  issuer: string
  date: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  certifications: Certification[]
  skills: string[]
  selfIntroduction: string
}

export interface ResumeMeta {
  id: string
  title: string
  createdAt: string
}

interface GoogleDocsState {
  isLoading: boolean
  error: string | null
  resumes: ResumeMeta[]
  folderId: string | null
}

export function useGoogleDocs(accessToken: string | null) {
  const [state, setState] = useState<GoogleDocsState>(() => {
    const meta = localStorage.getItem(RESUME_META_KEY)
    const folderId = localStorage.getItem(RESUME_FOLDER_KEY)
    return {
      isLoading: false,
      error: null,
      resumes: meta ? JSON.parse(meta) : [],
      folderId
    }
  })

  // Get or create the "이력서" folder in Google Drive
  const getOrCreateFolder = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null

    // Check if we already have a folder ID stored
    const storedFolderId = localStorage.getItem(RESUME_FOLDER_KEY)
    if (storedFolderId) {
      // Verify the folder still exists
      try {
        const checkResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${storedFolderId}?fields=id,trashed`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        )
        if (checkResponse.ok) {
          const data = await checkResponse.json()
          if (!data.trashed) {
            return storedFolderId
          }
        }
      } catch {
        // Folder might not exist, continue to create
      }
    }

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${RESUME_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      if (searchData.files && searchData.files.length > 0) {
        const folderId = searchData.files[0].id
        localStorage.setItem(RESUME_FOLDER_KEY, folderId)
        setState(prev => ({ ...prev, folderId }))
        return folderId
      }
    }

    // Create new folder
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: RESUME_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      }
    )

    if (createResponse.ok) {
      const folderData = await createResponse.json()
      const folderId = folderData.id
      localStorage.setItem(RESUME_FOLDER_KEY, folderId)
      setState(prev => ({ ...prev, folderId }))
      return folderId
    }

    return null
  }, [accessToken])

  // Generate resume content as plain text
  const generateResumeContent = (data: ResumeData): string => {
    const lines: string[] = []

    lines.push('=====================================')
    lines.push('            이 력 서')
    lines.push('=====================================')
    lines.push('')
    lines.push('[인적사항]')
    lines.push(`이름: ${data.personalInfo.name}`)
    lines.push(`생년월일: ${data.personalInfo.birthDate}`)
    lines.push(`연락처: ${data.personalInfo.phone}`)
    lines.push(`이메일: ${data.personalInfo.email}`)
    lines.push(`주소: ${data.personalInfo.address}`)
    if (data.personalInfo.blog) lines.push(`블로그: ${data.personalInfo.blog}`)
    if (data.personalInfo.github) lines.push(`GitHub: ${data.personalInfo.github}`)
    if (data.personalInfo.portfolio) lines.push(`포트폴리오: ${data.personalInfo.portfolio}`)
    lines.push('')

    if (data.education.length > 0) {
      lines.push('[학력]')
      data.education.forEach(edu => {
        lines.push(`${edu.startDate} ~ ${edu.endDate} | ${edu.school} | ${edu.major} | ${edu.degree}`)
      })
      lines.push('')
    }

    if (data.experience.length > 0) {
      lines.push('[경력]')
      data.experience.forEach(exp => {
        lines.push('')
        lines.push(`■ ${exp.company} | ${exp.position}`)
        lines.push(`  ${exp.startDate} ~ ${exp.endDate}`)
        if (exp.description) {
          lines.push(`  ${exp.description}`)
        }
        if (exp.projects && exp.projects.length > 0) {
          exp.projects.forEach((proj, idx) => {
            lines.push('')
            lines.push(`  [프로젝트 ${idx + 1}] ${proj.name}`)
            if (proj.summary) lines.push(`  • 개요: ${proj.summary}`)
            if (proj.role) lines.push(`  • 역할: ${proj.role}`)
            if (proj.tasks && proj.tasks.length > 0) {
              lines.push(`  • 주요 작업:`)
              proj.tasks.forEach(task => {
                lines.push(`    - ${task}`)
              })
            }
            if (proj.techStack) lines.push(`  • 기술/환경: ${proj.techStack}`)
            if (proj.result) lines.push(`  • 결과: ${proj.result}`)
          })
        }
      })
      lines.push('')
    }

    if (data.certifications.length > 0) {
      lines.push('[자격증]')
      data.certifications.forEach(cert => {
        lines.push(`${cert.date} | ${cert.name} | ${cert.issuer}`)
      })
      lines.push('')
    }

    if (data.skills.length > 0) {
      lines.push('[기술 스택]')
      lines.push(data.skills.join(', '))
      lines.push('')
    }

    if (data.selfIntroduction) {
      lines.push('[자기소개]')
      lines.push(data.selfIntroduction)
    }

    return lines.join('\n')
  }

  // Create a new resume document in the "이력서" folder
  const createResume = useCallback(async (data: ResumeData, title: string): Promise<string | null> => {
    if (!accessToken) {
      setState(prev => ({ ...prev, error: '로그인이 필요합니다' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Step 1: Get or create the folder
      const folderId = await getOrCreateFolder()

      // Step 2: Create an empty document
      const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title || `이력서_${new Date().toISOString().slice(0, 10)}`
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error?.message || '문서를 생성할 수 없습니다')
      }

      const docData = await createResponse.json()
      const documentId = docData.documentId

      // Step 3: Move document to folder
      if (folderId) {
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${documentId}?addParents=${folderId}&removeParents=root`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      }

      // Step 4: Insert content using batchUpdate
      const content = generateResumeContent(data)

      const updateResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  location: { index: 1 },
                  text: content
                }
              }
            ]
          })
        }
      )

      if (!updateResponse.ok) {
        throw new Error('문서 내용을 작성할 수 없습니다')
      }

      // Save to localStorage
      const newResume: ResumeMeta = {
        id: documentId,
        title: title || `이력서_${new Date().toISOString().slice(0, 10)}`,
        createdAt: new Date().toISOString()
      }

      const existingIds = JSON.parse(localStorage.getItem(RESUME_IDS_KEY) || '[]')
      const existingMeta: ResumeMeta[] = JSON.parse(localStorage.getItem(RESUME_META_KEY) || '[]')
      const existingData: Record<string, ResumeData> = JSON.parse(localStorage.getItem(RESUME_DATA_KEY) || '{}')

      localStorage.setItem(RESUME_IDS_KEY, JSON.stringify([...existingIds, documentId]))
      localStorage.setItem(RESUME_META_KEY, JSON.stringify([...existingMeta, newResume]))
      localStorage.setItem(RESUME_DATA_KEY, JSON.stringify({ ...existingData, [documentId]: data }))

      setState(prev => ({
        ...prev,
        isLoading: false,
        resumes: [...prev.resumes, newResume]
      }))

      return documentId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [accessToken, getOrCreateFolder])

  // Delete resume from localStorage (doesn't delete from Google Docs)
  const deleteResume = useCallback((documentId: string) => {
    const existingIds: string[] = JSON.parse(localStorage.getItem(RESUME_IDS_KEY) || '[]')
    const existingMeta: ResumeMeta[] = JSON.parse(localStorage.getItem(RESUME_META_KEY) || '[]')
    const existingData: Record<string, ResumeData> = JSON.parse(localStorage.getItem(RESUME_DATA_KEY) || '{}')

    const newIds = existingIds.filter(id => id !== documentId)
    const newMeta = existingMeta.filter(meta => meta.id !== documentId)
    delete existingData[documentId]

    localStorage.setItem(RESUME_IDS_KEY, JSON.stringify(newIds))
    localStorage.setItem(RESUME_META_KEY, JSON.stringify(newMeta))
    localStorage.setItem(RESUME_DATA_KEY, JSON.stringify(existingData))

    setState(prev => ({
      ...prev,
      resumes: prev.resumes.filter(r => r.id !== documentId)
    }))
  }, [])

  // Get resume data by ID
  const getResumeData = useCallback((documentId: string): ResumeData | null => {
    const existingData: Record<string, ResumeData> = JSON.parse(localStorage.getItem(RESUME_DATA_KEY) || '{}')
    return existingData[documentId] || null
  }, [])

  // Get resume meta by ID
  const getResumeMeta = useCallback((documentId: string): ResumeMeta | null => {
    const existingMeta: ResumeMeta[] = JSON.parse(localStorage.getItem(RESUME_META_KEY) || '[]')
    return existingMeta.find(m => m.id === documentId) || null
  }, [])

  // Get Google Docs URL
  const getDocumentUrl = useCallback((documentId: string): string => {
    return `https://docs.google.com/document/d/${documentId}/edit`
  }, [])

  // Get Google Drive folder URL
  const getFolderUrl = useCallback((): string => {
    const folderId = state.folderId || localStorage.getItem(RESUME_FOLDER_KEY)
    if (folderId) {
      return `https://drive.google.com/drive/folders/${folderId}`
    }
    return 'https://drive.google.com/drive/my-drive'
  }, [state.folderId])

  // Refresh resumes from localStorage
  const refresh = useCallback(() => {
    const meta = localStorage.getItem(RESUME_META_KEY)
    setState(prev => ({
      ...prev,
      resumes: meta ? JSON.parse(meta) : []
    }))
  }, [])

  return {
    ...state,
    createResume,
    deleteResume,
    getDocumentUrl,
    getFolderUrl,
    getOrCreateFolder,
    getResumeData,
    getResumeMeta,
    refresh
  }
}
