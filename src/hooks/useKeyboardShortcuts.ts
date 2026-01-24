import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  onToggleTimer?: () => void
  onResetTimer?: () => void
  onRefresh?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    // Space: Toggle timer
    if (e.code === 'Space' && handlers.onToggleTimer) {
      e.preventDefault()
      handlers.onToggleTimer()
    }

    // R: Reset timer
    if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey && handlers.onResetTimer) {
      e.preventDefault()
      handlers.onResetTimer()
    }

    // Ctrl/Cmd + R: Refresh (allow default browser refresh)
    // F5: Refresh
    if (e.code === 'F5' && handlers.onRefresh) {
      e.preventDefault()
      handlers.onRefresh()
    }
  }, [handlers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Keyboard shortcuts help text
export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: '타이머 시작/정지' },
  { key: 'R', description: '타이머 리셋' },
]
