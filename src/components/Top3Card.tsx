import { useState } from 'react'
import type { DayState } from '../store/db'

interface Top3CardProps {
  dayState: DayState
  onUpdateTop3: (index: number, value: string) => Promise<void>
  onToggleTop3Done: (index: number) => Promise<void>
  onCopyFromYesterday: () => Promise<void>
}

export function Top3Card({
  dayState,
  onUpdateTop3,
  onToggleTop3Done,
  onCopyFromYesterday
}: Top3CardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(dayState.top3[index])
  }

  const handleSave = async (index: number) => {
    await onUpdateTop3(index, editValue)
    setEditingIndex(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleSave(index)
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditValue('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg card-hover">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🎯</span>
          오늘의 Top 3
        </h2>
        <button
          onClick={onCopyFromYesterday}
          className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          어제 복사
        </button>
      </div>

      <div className="space-y-2">
        {dayState.top3.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50"
          >
            <input
              type="checkbox"
              checked={dayState.top3Done[index]}
              onChange={() => onToggleTop3Done(index)}
              disabled={!item.trim()}
              className="touch-target flex-shrink-0"
            />

            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSave(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus
                className="flex-1 bg-white dark:bg-gray-600 px-3 py-2 rounded-lg text-gray-900 dark:text-white outline-none ring-2 ring-emerald-500"
                placeholder={`할 일 ${index + 1}`}
              />
            ) : (
              <button
                onClick={() => handleEdit(index)}
                className={`flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 touch-target ${
                  dayState.top3Done[index]
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {item || (
                  <span className="text-gray-400 dark:text-gray-500">
                    할 일 {index + 1} 입력...
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-right text-sm text-gray-500 dark:text-gray-400">
        {dayState.top3Done.filter((d, i) => d && dayState.top3[i]).length} / {dayState.top3.filter(t => t.trim()).length || 3} 완료
      </div>
    </div>
  )
}
