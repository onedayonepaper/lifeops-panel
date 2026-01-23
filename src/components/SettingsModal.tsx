import { useState, useEffect, useRef } from 'react'
import type { Settings } from '../store/db'
import { exportAllData, importData, downloadBackup } from '../store/db'
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import { updateSettings } from '../store/settings'
import { useToast } from './Toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
}

export function SettingsModal({ isOpen, onClose, settings }: SettingsModalProps) {
  const [nightModeStart, setNightModeStart] = useState(settings.nightModeStart)
  const [nightModeEnd, setNightModeEnd] = useState(settings.nightModeEnd)
  const [resetTime, setResetTime] = useState(settings.resetTime)
  const [isSaving, setIsSaving] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    setNightModeStart(settings.nightModeStart)
    setNightModeEnd(settings.nightModeEnd)
    setResetTime(settings.resetTime)
  }, [settings])

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const data = await exportAllData()
      const filename = `lifeops-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadBackup(data, filename)
      showToast('백업 파일이 다운로드되었습니다', 'success')
    } catch (e) {
      showToast('백업에 실패했습니다', 'error')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = await importData(text)
      if (result.success) {
        showToast(result.message, 'success')
        window.location.reload()
      } else {
        showToast(result.message, 'error')
      }
    } catch {
      showToast('파일을 읽을 수 없습니다', 'error')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings({
        nightModeStart,
        nightModeEnd,
        resetTime
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">설정</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Night Mode Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              야간 모드 시간
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  시작
                </label>
                <input
                  type="time"
                  value={nightModeStart}
                  onChange={(e) => setNightModeStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  종료
                </label>
                <input
                  type="time"
                  value={nightModeEnd}
                  onChange={(e) => setNightModeEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Reset Time */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              일일 리셋 시간
            </h3>
            <input
              type="time"
              value={resetTime}
              onChange={(e) => setResetTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              이 시간 이후 새로운 하루가 시작됩니다
            </p>
          </div>

          {/* Backup/Restore */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              데이터 백업/복원
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-medium"
              >
                {isBackingUp ? '백업 중...' : '📥 백업'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium"
              >
                📤 복원
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              모든 데이터를 JSON 파일로 내보내거나 가져올 수 있습니다
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              키보드 단축키
            </h3>
            <div className="space-y-1.5 text-xs">
              {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-mono text-xs min-w-[40px] text-center">
                    {key}
                  </kbd>
                  <span className="text-gray-600 dark:text-gray-400">{description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-300">LifeOps Panel</p>
              <p className="mt-1">"한 화면에서 오늘을 끝낸다"</p>
              <p className="mt-2 text-xs">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold touch-target"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
