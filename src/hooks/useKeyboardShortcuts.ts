import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  onToggleTimer?: () => void
  onResetTimer?: () => void
  onToggleTop3?: (index: number) => void
  onToggleOneAction?: () => void
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

    // 1, 2, 3: Toggle Top3 items
    if (e.code === 'Digit1' && handlers.onToggleTop3) {
      e.preventDefault()
      handlers.onToggleTop3(0)
    }
    if (e.code === 'Digit2' && handlers.onToggleTop3) {
      e.preventDefault()
      handlers.onToggleTop3(1)
    }
    if (e.code === 'Digit3' && handlers.onToggleTop3) {
      e.preventDefault()
      handlers.onToggleTop3(2)
    }

    // 4: Toggle One Action
    if (e.code === 'Digit4' && handlers.onToggleOneAction) {
      e.preventDefault()
      handlers.onToggleOneAction()
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
  { key: '1', description: 'Top3 첫 번째 완료 토글' },
  { key: '2', description: 'Top3 두 번째 완료 토글' },
  { key: '3', description: 'Top3 세 번째 완료 토글' },
  { key: '4', description: 'One Action 완료 토글' },
]
