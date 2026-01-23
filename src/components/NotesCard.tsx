import { useState } from 'react'
import type { DayState } from '../store/db'

interface NotesCardProps {
  dayState: DayState
  onUpdateNotes: (notes: string[]) => Promise<void>
}

const MAX_NOTES = 3
const NOTE_ICONS = ['📝', '💡', '🛒']

export function NotesCard({ dayState, onUpdateNotes }: NotesCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  // Ensure we always have 3 note slots
  const notes = [...(dayState.notes || []), '', '', ''].slice(0, MAX_NOTES)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(notes[index])
  }

  const handleSave = async (index: number) => {
    const newNotes = [...notes]
    newNotes[index] = editValue
    await onUpdateNotes(newNotes)
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

  const handleClear = async (index: number) => {
    const newNotes = [...notes]
    newNotes[index] = ''
    await onUpdateNotes(newNotes)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="text-xl">📌</span>
        퀵 메모
      </h2>

      <div className="space-y-2">
        {notes.map((note, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50"
          >
            <span className="text-lg flex-shrink-0">{NOTE_ICONS[index]}</span>

            {editingIndex === index ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSave(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus
                className="flex-1 bg-white dark:bg-gray-600 px-3 py-2 rounded-lg text-gray-900 dark:text-white outline-none ring-2 ring-emerald-500 text-sm"
                placeholder="메모 입력..."
              />
            ) : (
              <button
                onClick={() => handleEdit(index)}
                className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm touch-target text-gray-700 dark:text-gray-200"
              >
                {note || (
                  <span className="text-gray-400 dark:text-gray-500">
                    메모 입력...
                  </span>
                )}
              </button>
            )}

            {note && editingIndex !== index && (
              <button
                onClick={() => handleClear(index)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="메모 삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
