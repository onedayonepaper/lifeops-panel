import { useState, useCallback, useEffect } from 'react'

// localStorage 키
const STORAGE_KEYS = {
  ROOT_FOLDER: 'lifeops_root_folder_id',
  SUBFOLDERS: 'lifeops_subfolders',
  DOCUMENTS: 'lifeops_documents',
  RESUME_DATA: 'lifeops_resume_data',
} as const

// 폴더 구조
const FOLDER_STRUCTURE = {
  ROOT: '취업서류',
  SUBFOLDERS: {
    resume: '이력서',
    career: '경력기술서',
    project: '프로젝트',
  },
} as const

export type DocumentType = 'resume' | 'career' | 'project'

// 인터페이스 정의
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

export interface DocumentMeta {
  id: string
  title: string
  type: DocumentType
  createdAt: string
  modifiedAt?: string
  folderId: string
}

export interface ProjectDocData {
  title: string
  content: string
}

interface SubfolderIds {
  resume: string | null
  career: string | null
  project: string | null
}

interface GoogleDocsState {
  isLoading: boolean
  error: string | null
  documents: DocumentMeta[]
  rootFolderId: string | null
  subfolderIds: SubfolderIds
}

// 호환성을 위한 ResumeMeta 타입 (기존 코드와 호환)
export interface ResumeMeta {
  id: string
  title: string
  createdAt: string
  type: DocumentType | 'portfolio'
  linkedId?: string
  portfolioUrl?: string
}

export interface PortfolioItem {
  id: string
  type: 'project' | 'achievement'
  title: string
  description: string
  url: string
  tags: string[]
  evidence?: string
}

export interface PortfolioData {
  items: PortfolioItem[]
}

export function useGoogleDocs(accessToken: string | null) {
  const [state, setState] = useState<GoogleDocsState>(() => {
    const documents = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
    const rootFolderId = localStorage.getItem(STORAGE_KEYS.ROOT_FOLDER)
    const subfolders = localStorage.getItem(STORAGE_KEYS.SUBFOLDERS)

    return {
      isLoading: false,
      error: null,
      documents: documents ? JSON.parse(documents) : [],
      rootFolderId,
      subfolderIds: subfolders ? JSON.parse(subfolders) : { resume: null, career: null, project: null },
    }
  })

  // Google Drive API: 폴더 검색 (모든 매칭 폴더 반환)
  const searchAllFolders = async (name: string, parentId?: string): Promise<{ id: string; name: string }[]> => {
    if (!accessToken) return []

    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    if (parentId) {
      query += ` and '${parentId}' in parents`
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (response.ok) {
      const data = await response.json()
      return data.files || []
    }
    return []
  }

  // 폴더 내 파일 이동
  const moveFilesToFolder = async (fromFolderId: string, toFolderId: string): Promise<void> => {
    if (!accessToken) return

    // 원본 폴더의 파일 목록 가져오기
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${fromFolderId}' in parents and trashed=false&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!response.ok) return

    const data = await response.json()
    const files = data.files || []

    // 각 파일을 새 폴더로 이동
    for (const file of files) {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?addParents=${toFolderId}&removeParents=${fromFolderId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }

  // 중복 폴더 정리
  const cleanupDuplicateFolders = async (name: string, parentId?: string): Promise<string | null> => {
    if (!accessToken) return null

    const folders = await searchAllFolders(name, parentId)

    if (folders.length <= 1) {
      return folders[0]?.id || null
    }

    console.log(`[Drive] 중복 폴더 발견: ${name} (${folders.length}개)`)

    // 첫 번째 폴더를 메인으로 유지
    const mainFolder = folders[0]
    const duplicates = folders.slice(1)

    // 중복 폴더의 파일들을 메인 폴더로 이동 후 삭제
    for (const dup of duplicates) {
      console.log(`[Drive] 중복 폴더 정리 중: ${dup.id}`)

      // 파일 이동
      await moveFilesToFolder(dup.id, mainFolder.id)

      // 빈 폴더 삭제 (휴지통으로)
      await fetch(`https://www.googleapis.com/drive/v3/files/${dup.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trashed: true }),
      })
    }

    console.log(`[Drive] 중복 폴더 정리 완료: ${name}`)
    return mainFolder.id
  }

  // Google Drive API: 폴더 생성
  const createFolder = async (name: string, parentId?: string): Promise<string | null> => {
    if (!accessToken) return null

    const body: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    }
    if (parentId) {
      body.parents = [parentId]
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    }
    return null
  }

  // 폴더 구조 초기화 (취업서류 > 이력서, 경력기술서, 프로젝트) + 중복 정리
  const initializeFolderStructure = useCallback(async (): Promise<{
    rootId: string | null
    subfolders: SubfolderIds
  }> => {
    if (!accessToken) return { rootId: null, subfolders: { resume: null, career: null, project: null } }

    try {
      // 1. 루트 폴더 찾기/정리 또는 생성
      let rootId = await cleanupDuplicateFolders(FOLDER_STRUCTURE.ROOT)
      if (!rootId) {
        rootId = await createFolder(FOLDER_STRUCTURE.ROOT)
      }

      if (!rootId) {
        throw new Error('루트 폴더를 생성할 수 없습니다')
      }

      // 2. 하위 폴더 찾기/정리 또는 생성
      const subfolders: SubfolderIds = { resume: null, career: null, project: null }

      for (const [type, name] of Object.entries(FOLDER_STRUCTURE.SUBFOLDERS)) {
        // 중복 폴더가 있으면 정리
        let folderId = await cleanupDuplicateFolders(name, rootId)
        if (!folderId) {
          folderId = await createFolder(name, rootId)
        }
        subfolders[type as DocumentType] = folderId
      }

      // localStorage에 저장
      localStorage.setItem(STORAGE_KEYS.ROOT_FOLDER, rootId)
      localStorage.setItem(STORAGE_KEYS.SUBFOLDERS, JSON.stringify(subfolders))

      setState(prev => ({ ...prev, rootFolderId: rootId, subfolderIds: subfolders }))

      return { rootId, subfolders }
    } catch (error) {
      console.error('폴더 구조 초기화 실패:', error)
      return { rootId: null, subfolders: { resume: null, career: null, project: null } }
    }
  }, [accessToken])

  // Google Drive에서 문서 목록 동기화
  const syncWithDrive = useCallback(async () => {
    if (!accessToken) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 폴더 구조 확인/생성
      const { rootId, subfolders } = await initializeFolderStructure()
      if (!rootId) {
        setState(prev => ({ ...prev, isLoading: false, error: '폴더 구조를 초기화할 수 없습니다' }))
        return
      }

      const allDocuments: DocumentMeta[] = []

      // 각 하위 폴더에서 문서 목록 가져오기
      for (const [type, folderId] of Object.entries(subfolders)) {
        if (!folderId) continue

        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false&fields=files(id,name,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        if (response.ok) {
          const data = await response.json()
          const files = data.files || []

          for (const file of files) {
            allDocuments.push({
              id: file.id,
              title: file.name,
              type: type as DocumentType,
              createdAt: file.createdTime,
              modifiedAt: file.modifiedTime,
              folderId: folderId,
            })
          }
        }
      }

      // localStorage 업데이트
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocuments))

      setState(prev => ({
        ...prev,
        isLoading: false,
        documents: allDocuments,
        rootFolderId: rootId,
        subfolderIds: subfolders,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '동기화 중 오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
    }
  }, [accessToken, initializeFolderStructure])

  // accessToken 변경 시 자동 동기화
  useEffect(() => {
    if (accessToken) {
      syncWithDrive()
    }
  }, [accessToken, syncWithDrive])

  // 문서 내용 생성 함수들
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
      lines.push('[경력사항]')
      data.experience.forEach(exp => {
        lines.push(`• ${exp.company} | ${exp.position} (${exp.startDate} ~ ${exp.endDate})`)
        if (exp.description) lines.push(`  ${exp.description}`)
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

  const generateCareerContent = (data: ResumeData): string => {
    const lines: string[] = []
    lines.push('=====================================')
    lines.push('          경 력 기 술 서')
    lines.push('=====================================')
    lines.push('')
    lines.push(`성명: ${data.personalInfo.name}`)
    lines.push(`연락처: ${data.personalInfo.phone} | ${data.personalInfo.email}`)
    lines.push('')

    if (data.experience.length > 0) {
      data.experience.forEach((exp, expIdx) => {
        lines.push('─────────────────────────────────────')
        lines.push(`${expIdx + 1}. ${exp.company}`)
        lines.push('─────────────────────────────────────')
        lines.push(`직책: ${exp.position}`)
        lines.push(`근무기간: ${exp.startDate} ~ ${exp.endDate}`)
        if (exp.description) lines.push(`담당업무: ${exp.description}`)
        lines.push('')

        if (exp.projects?.length > 0) {
          lines.push('【 프로젝트 상세 】')
          lines.push('')
          exp.projects.forEach((proj, projIdx) => {
            lines.push(`━━━ 프로젝트 ${projIdx + 1}: ${proj.name} ━━━`)
            lines.push('')
            if (proj.summary) {
              lines.push('[S] Situation (상황)')
              lines.push(`    ${proj.summary}`)
              lines.push('')
            }
            if (proj.role) {
              lines.push('[T] Task (과제)')
              lines.push(`    역할: ${proj.role}`)
              lines.push('')
            }
            if (proj.tasks?.length > 0) {
              lines.push('[A] Action (행동)')
              proj.tasks.forEach(task => lines.push(`    • ${task}`))
              lines.push('')
            }
            if (proj.result) {
              lines.push('[R] Result (결과)')
              lines.push(`    ${proj.result}`)
              lines.push('')
            }
            if (proj.techStack) {
              lines.push(`[기술/환경] ${proj.techStack}`)
              lines.push('')
            }
          })
        }
        lines.push('')
      })
    }

    return lines.join('\n')
  }

  const generateProjectContent = (data: ProjectDocData): string => {
    const lines: string[] = []
    lines.push('=====================================')
    lines.push(`    ${data.title}`)
    lines.push('=====================================')
    lines.push('')
    lines.push(data.content)
    return lines.join('\n')
  }

  // Google Docs 문서 생성
  const createDocument = async (title: string, content: string, folderId: string): Promise<string | null> => {
    if (!accessToken) return null

    // 1. 빈 문서 생성
    const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!createResponse.ok) return null

    const docData = await createResponse.json()
    const documentId = docData.documentId

    // 2. 폴더로 이동
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${documentId}?addParents=${folderId}&removeParents=root`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // 3. 내용 삽입
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ insertText: { location: { index: 1 }, text: content } }],
      }),
    })

    return documentId
  }

  // 문서 내용 업데이트
  const updateDocumentContent = async (documentId: string, content: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      // 현재 문서 길이 가져오기
      const getResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!getResponse.ok) return false

      const docData = await getResponse.json()
      const endIndex = docData.body?.content?.slice(-1)?.[0]?.endIndex || 1

      const requests: unknown[] = []

      // 기존 내용 삭제
      if (endIndex > 2) {
        requests.push({
          deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } },
        })
      }

      // 새 내용 삽입
      requests.push({
        insertText: { location: { index: 1 }, text: content },
      })

      const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      })

      return updateResponse.ok
    } catch {
      return false
    }
  }

  // 이력서 생성/수정
  const createOrUpdateResume = useCallback(async (data: ResumeData, title: string): Promise<string | null> => {
    if (!accessToken) {
      setState(prev => ({ ...prev, error: '로그인이 필요합니다' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { subfolders } = await initializeFolderStructure()
      const folderId = subfolders.resume
      if (!folderId) throw new Error('이력서 폴더를 찾을 수 없습니다')

      const content = generateResumeContent(data)
      const existingDoc = state.documents.find(d => d.type === 'resume')

      let documentId: string | null = null

      if (existingDoc) {
        const updated = await updateDocumentContent(existingDoc.id, content)
        documentId = updated ? existingDoc.id : await createDocument(title, content, folderId)
      } else {
        documentId = await createDocument(title, content, folderId)
      }

      if (!documentId) throw new Error('이력서 문서를 처리할 수 없습니다')

      // localStorage에 데이터 저장
      const resumeDataStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME_DATA) || '{}')
      resumeDataStore[documentId] = data
      localStorage.setItem(STORAGE_KEYS.RESUME_DATA, JSON.stringify(resumeDataStore))

      await syncWithDrive()
      return documentId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [accessToken, initializeFolderStructure, state.documents, syncWithDrive])

  // 경력기술서 생성/수정
  const createOrUpdateCareer = useCallback(async (data: ResumeData, title: string): Promise<string | null> => {
    if (!accessToken) {
      setState(prev => ({ ...prev, error: '로그인이 필요합니다' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { subfolders } = await initializeFolderStructure()
      const folderId = subfolders.career
      if (!folderId) throw new Error('경력기술서 폴더를 찾을 수 없습니다')

      const content = generateCareerContent(data)
      const existingDoc = state.documents.find(d => d.type === 'career')

      let documentId: string | null = null

      if (existingDoc) {
        const updated = await updateDocumentContent(existingDoc.id, content)
        documentId = updated ? existingDoc.id : await createDocument(title, content, folderId)
      } else {
        documentId = await createDocument(title, content, folderId)
      }

      if (!documentId) throw new Error('경력기술서 문서를 처리할 수 없습니다')

      // localStorage에 데이터 저장
      const resumeDataStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME_DATA) || '{}')
      resumeDataStore[documentId] = data
      localStorage.setItem(STORAGE_KEYS.RESUME_DATA, JSON.stringify(resumeDataStore))

      await syncWithDrive()
      return documentId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [accessToken, initializeFolderStructure, state.documents, syncWithDrive])

  // 이력서 + 경력기술서 동시 생성/수정
  const createResumeWithCareer = useCallback(async (
    data: ResumeData,
    baseTitle: string
  ): Promise<{ resumeId: string | null; careerId: string | null }> => {
    const resumeId = await createOrUpdateResume(data, `${baseTitle}_이력서`)
    const careerId = await createOrUpdateCareer(data, `${baseTitle}_경력기술서`)
    return { resumeId, careerId }
  }, [createOrUpdateResume, createOrUpdateCareer])

  // 프로젝트 생성 (여러 개 가능)
  const createProject = useCallback(async (data: ProjectDocData): Promise<string | null> => {
    if (!accessToken) {
      setState(prev => ({ ...prev, error: '로그인이 필요합니다' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { subfolders } = await initializeFolderStructure()
      const folderId = subfolders.project
      if (!folderId) throw new Error('프로젝트 폴더를 찾을 수 없습니다')

      const content = generateProjectContent(data)
      const documentId = await createDocument(data.title, content, folderId)

      if (!documentId) throw new Error('프로젝트 문서를 생성할 수 없습니다')

      await syncWithDrive()
      return documentId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return null
    }
  }, [accessToken, initializeFolderStructure, syncWithDrive])

  // 프로젝트 수정
  const updateProject = useCallback(async (documentId: string, data: ProjectDocData): Promise<boolean> => {
    if (!accessToken) return false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const content = generateProjectContent(data)
      const updated = await updateDocumentContent(documentId, content)

      if (updated) {
        // 제목도 업데이트
        await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: data.title }),
        })
      }

      await syncWithDrive()
      return updated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      return false
    }
  }, [accessToken, syncWithDrive])

  // 문서 삭제 (휴지통으로 이동)
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trashed: true }),
      })

      if (response.ok) {
        await syncWithDrive()
        return true
      }
      return false
    } catch {
      return false
    }
  }, [accessToken, syncWithDrive])

  // URL 생성 함수들
  const getDocumentUrl = useCallback((documentId: string): string => {
    return `https://docs.google.com/document/d/${documentId}/edit`
  }, [])

  const getFolderUrl = useCallback((type?: DocumentType): string => {
    if (type && state.subfolderIds[type]) {
      return `https://drive.google.com/drive/folders/${state.subfolderIds[type]}`
    }
    if (state.rootFolderId) {
      return `https://drive.google.com/drive/folders/${state.rootFolderId}`
    }
    return 'https://drive.google.com/drive/my-drive'
  }, [state.rootFolderId, state.subfolderIds])

  // 데이터 조회 함수들
  const getResumeData = useCallback((documentId: string): ResumeData | null => {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME_DATA) || '{}')
    return store[documentId] || null
  }, [])

  const getDocumentsByType = useCallback((type: DocumentType): DocumentMeta[] => {
    return state.documents.filter(d => d.type === type)
  }, [state.documents])

  // 새로고침
  const refresh = useCallback(() => {
    if (accessToken) {
      syncWithDrive()
    }
  }, [accessToken, syncWithDrive])

  // 호환성을 위한 resumes getter (기존 코드 지원)
  const resumes: ResumeMeta[] = state.documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
    type: doc.type,
  }))

  // 호환성 함수들
  const deleteResume = deleteDocument
  const getResumeMeta = useCallback((documentId: string): ResumeMeta | null => {
    const doc = state.documents.find(d => d.id === documentId)
    if (!doc) return null
    return {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt,
      type: doc.type,
    }
  }, [state.documents])

  const updateResumeData = useCallback((documentId: string, data: ResumeData) => {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME_DATA) || '{}')
    store[documentId] = data
    localStorage.setItem(STORAGE_KEYS.RESUME_DATA, JSON.stringify(store))
  }, [])

  // 프로젝트 데이터 (로컬 저장용 - 호환성)
  const getProjectData = useCallback((): ProjectDocData | null => {
    const data = localStorage.getItem('lifeops_project_data')
    return data ? JSON.parse(data) : null
  }, [])

  const updateProjectData = useCallback((data: ProjectDocData) => {
    localStorage.setItem('lifeops_project_data', JSON.stringify(data))
  }, [])

  // 포트폴리오 (호환성)
  const getPortfolioData = useCallback((): PortfolioData | null => {
    const data = localStorage.getItem('lifeops_portfolio_data')
    return data ? JSON.parse(data) : null
  }, [])

  const updatePortfolioData = useCallback((data: PortfolioData) => {
    localStorage.setItem('lifeops_portfolio_data', JSON.stringify(data))
  }, [])

  const createOrUpdatePortfolio = useCallback(async (): Promise<string | null> => {
    // 포트폴리오는 별도 처리 (필요시 구현)
    return null
  }, [])

  const createOrUpdateProject = useCallback(async (
    data: ProjectDocData,
    _baseTitle: string
  ): Promise<string | null> => {
    // 기존 프로젝트가 있으면 수정, 없으면 생성
    const existingProject = state.documents.find(d => d.type === 'project')
    if (existingProject) {
      const updated = await updateProject(existingProject.id, data)
      return updated ? existingProject.id : null
    }
    return createProject(data)
  }, [state.documents, updateProject, createProject])

  const createResume = useCallback(async (data: ResumeData, title: string): Promise<string | null> => {
    return createOrUpdateResume(data, title)
  }, [createOrUpdateResume])

  const getOrCreateFolder = useCallback(async (): Promise<string | null> => {
    const { rootId } = await initializeFolderStructure()
    return rootId
  }, [initializeFolderStructure])

  return {
    // 상태
    isLoading: state.isLoading,
    error: state.error,
    documents: state.documents,
    resumes, // 호환성
    folderId: state.rootFolderId, // 호환성
    rootFolderId: state.rootFolderId,
    subfolderIds: state.subfolderIds,

    // 핵심 함수
    syncWithDrive,
    refresh,
    createProject,
    updateProject,
    deleteDocument,
    getDocumentUrl,
    getFolderUrl,
    getDocumentsByType,

    // 호환성 함수
    createResume,
    createResumeWithCareer,
    createOrUpdateResume,
    createOrUpdateCareer,
    createOrUpdatePortfolio,
    createOrUpdateProject,
    deleteResume,
    getOrCreateFolder,
    getResumeData,
    getResumeMeta,
    getPortfolioData,
    getProjectData,
    updateResumeData,
    updatePortfolioData,
    updateProjectData,
  }
}
