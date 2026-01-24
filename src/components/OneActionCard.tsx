import { useState } from 'react'
import type { DayState } from '../store/db'

interface OneActionCardProps {
  dayState: DayState
  onUpdateOneAction: (value: string) => Promise<void>
  onToggleOneActionDone: () => Promise<void>
}

export function OneActionCard({
  dayState,
  onUpdateOneAction,
  onToggleOneActionDone
}: OneActionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(dayState.oneAction)
  }

  const handleSave = async () => {
    await onUpdateOneAction(editValue)
    setIsEditing(false)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue('')
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-950 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg card-hover text-white">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-xl">🚀</span>
        미래를 위한 1 Action
      </h2>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur">
        <input
          type="checkbox"
          checked={dayState.oneActionDone}
          onChange={onToggleOneActionDone}
          disabled={!dayState.oneAction.trim()}
          className="touch-target flex-shrink-0"
        />

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-white/20 px-3 py-2 rounded-lg text-white placeholder-white/50 outline-none ring-2 ring-white/50"
            placeholder="오늘 미래를 위해 할 한 가지..."
          />
        ) : (
          <button
            onClick={handleEdit}
            className={`flex-1 text-left px-3 py-2 rounded-lg hover:bg-white/10 touch-target ${
              dayState.oneActionDone ? 'line-through opacity-60' : ''
            }`}
          >
            {dayState.oneAction || (
              <span className="opacity-60">
                미래를 위해 할 한 가지 입력...
              </span>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 text-sm opacity-80">
        {dayState.oneActionDone ? '오늘 미래에 한 걸음 다가갔어요!' : '작은 한 걸음이 큰 변화를 만들어요'}
      </div>
    </div>
  )
}
