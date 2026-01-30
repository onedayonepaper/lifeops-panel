import { useState, useEffect, useCallback } from 'react'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  webContentLink?: string
  iconLink?: string
  thumbnailLink?: string
  createdTime?: string
  modifiedTime?: string
  size?: string
}

export interface DriveFolder {
  id: string
  name: string
  parentId?: string
}

export function useGoogleDrive(folderName: string) {
  const { accessToken, isSignedIn, signIn } = useGoogleAuth()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [rootFolder, setRootFolder] = useState<DriveFolder | null>(null)
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | null>(null)
  const [folderPath, setFolderPath] = useState<DriveFolder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Find folder by name
  const findFolder = useCallback(async (token: string, name: string): Promise<DriveFolder | null> => {
    try {
      const query = encodeURIComponent(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        if (response.status === 401) return null
        throw new Error('폴더를 찾을 수 없습니다')
      }

      const data = await response.json()
      if (data.files && data.files.length > 0) {
        return { id: data.files[0].id, name: data.files[0].name }
      }
      return null
    } catch (err) {
      console.error('Find folder error:', err)
      return null
    }
  }, [])

  // Create folder (optionally within a parent folder)
  const createFolder = useCallback(async (token: string, name: string, parentId?: string): Promise<DriveFolder | null> => {
    try {
      const body: { name: string; mimeType: string; parents?: string[] } = {
        name,
        mimeType: 'application/vnd.google-apps.folder'
      }
      if (parentId) {
        body.parents = [parentId]
      }

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        throw new Error('폴더 생성에 실패했습니다')
      }

      const data = await response.json()
      return { id: data.id, name: data.name, parentId }
    } catch (err) {
      console.error('Create folder error:', err)
      return null
    }
  }, [])

  // List files in folder
  const listFiles = useCallback(async (token: string, folderId: string) => {
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`)
      const fields = 'files(id,name,mimeType,webViewLink,webContentLink,iconLink,thumbnailLink,createdTime,modifiedTime,size)'
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime desc`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error('파일 목록을 가져올 수 없습니다')
      }

      const data = await response.json()
      return data.files || []
    } catch (err) {
      console.error('List files error:', err)
      return []
    }
  }, [])

  // Initialize - find or create folder, then list files
  const initialize = useCallback(async () => {
    if (!accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      // Find existing folder
      let existingFolder = await findFolder(accessToken, folderName)

      // Create if not found
      if (!existingFolder) {
        existingFolder = await createFolder(accessToken, folderName)
      }

      if (existingFolder) {
        setRootFolder(existingFolder)
        setCurrentFolder(existingFolder)
        setFolderPath([existingFolder])
        const fileList = await listFiles(accessToken, existingFolder.id)
        setFiles(fileList)
      } else {
        setError('폴더를 찾거나 생성할 수 없습니다')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, folderName, findFolder, createFolder, listFiles])

  // Refresh files
  const refresh = useCallback(async () => {
    if (!accessToken || !currentFolder) return

    setIsLoading(true)
    try {
      const fileList = await listFiles(accessToken, currentFolder.id)
      setFiles(fileList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, currentFolder, listFiles])

  // Navigate into a folder
  const navigateToFolder = useCallback(async (folder: DriveFolder) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const fileList = await listFiles(accessToken, folder.id)
      setCurrentFolder(folder)
      setFolderPath(prev => [...prev, folder])
      setFiles(fileList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, listFiles])

  // Navigate back to parent folder
  const navigateBack = useCallback(async () => {
    if (!accessToken || folderPath.length <= 1) return

    setIsLoading(true)
    try {
      const newPath = folderPath.slice(0, -1)
      const parentFolder = newPath[newPath.length - 1]
      const fileList = await listFiles(accessToken, parentFolder.id)
      setCurrentFolder(parentFolder)
      setFolderPath(newPath)
      setFiles(fileList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, folderPath, listFiles])

  // Navigate to specific path index
  const navigateToPathIndex = useCallback(async (index: number) => {
    if (!accessToken || index < 0 || index >= folderPath.length) return

    setIsLoading(true)
    try {
      const newPath = folderPath.slice(0, index + 1)
      const targetFolder = newPath[newPath.length - 1]
      const fileList = await listFiles(accessToken, targetFolder.id)
      setCurrentFolder(targetFolder)
      setFolderPath(newPath)
      setFiles(fileList)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, folderPath, listFiles])

  // Upload file
  const uploadFile = useCallback(async (file: File): Promise<boolean> => {
    if (!accessToken || !currentFolder) return false

    try {
      const metadata = {
        name: file.name,
        parents: [currentFolder.id]
      }

      const formData = new FormData()
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      formData.append('file', file)

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다')
      }

      await refresh()
      return true
    } catch (err) {
      console.error('Upload error:', err)
      return false
    }
  }, [accessToken, currentFolder, refresh])

  // Delete file
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok && response.status !== 204) {
        throw new Error('파일 삭제에 실패했습니다')
      }

      await refresh()
      return true
    } catch (err) {
      console.error('Delete error:', err)
      return false
    }
  }, [accessToken, refresh])

  // Create Google Doc
  const createGoogleDoc = useCallback(async (name: string): Promise<DriveFile | null> => {
    if (!accessToken || !currentFolder) return null

    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.document',
            parents: [currentFolder.id]
          })
        }
      )

      if (!response.ok) {
        throw new Error('문서 생성에 실패했습니다')
      }

      const data = await response.json()
      await refresh()
      return data
    } catch (err) {
      console.error('Create doc error:', err)
      return null
    }
  }, [accessToken, currentFolder, refresh])

  // Create Google Sheet
  const createGoogleSheet = useCallback(async (name: string): Promise<DriveFile | null> => {
    if (!accessToken || !currentFolder) return null

    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [currentFolder.id]
          })
        }
      )

      if (!response.ok) {
        throw new Error('스프레드시트 생성에 실패했습니다')
      }

      const data = await response.json()
      await refresh()
      return data
    } catch (err) {
      console.error('Create sheet error:', err)
      return null
    }
  }, [accessToken, currentFolder, refresh])

  // Create subfolder in current folder
  const createSubFolder = useCallback(async (name: string): Promise<DriveFolder | null> => {
    if (!accessToken || !currentFolder) return null

    try {
      const newFolder = await createFolder(accessToken, name, currentFolder.id)
      if (newFolder) {
        await refresh()
      }
      return newFolder
    } catch (err) {
      console.error('Create subfolder error:', err)
      return null
    }
  }, [accessToken, currentFolder, createFolder, refresh])

  // Rename file or folder
  const renameFile = useCallback(async (fileId: string, newName: string): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newName })
        }
      )

      if (!response.ok) {
        throw new Error('이름 변경에 실패했습니다')
      }

      await refresh()
      return true
    } catch (err) {
      console.error('Rename error:', err)
      return false
    }
  }, [accessToken, refresh])

  // Initialize on mount
  useEffect(() => {
    if (isSignedIn && accessToken) {
      initialize()
    }
  }, [isSignedIn, accessToken, initialize])

  return {
    files,
    rootFolder,
    currentFolder,
    folderPath,
    isLoading,
    error,
    isSignedIn,
    signIn,
    refresh,
    uploadFile,
    deleteFile,
    renameFile,
    createGoogleDoc,
    createGoogleSheet,
    createSubFolder,
    navigateToFolder,
    navigateBack,
    navigateToPathIndex
  }
}
