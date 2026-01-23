import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'

const EMOJI_OPTIONS = ['💧', '🧘', '📚', '🏃', '💪', '🥗', '😴', '✍️', '🎯', '🧹', '💊', '🌅']

function AddHabitModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, emoji: string) => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💧')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), emoji)
      setName('')
      setEmoji('💧')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">➕ 습관 추가</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 물 8잔"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">이모지</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-amber-500 scale-110'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  )
}

export function HabitTrackerCard() {
  const { habits, isLoading, toggleHabit, addHabit, removeHabit } = useHabits()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const completedCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg text-white">
        <div className="animate-pulse h-24 bg-white/20 rounded-xl" />
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">✨</span>
            오늘의 습관
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 rounded-xl transition-colors ${
                editMode ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white/70 mb-3">습관을 추가해보세요!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium"
            >
              + 습관 추가
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => editMode ? undefined : toggleHabit(habit.id!)}
                className={`relative p-3 rounded-xl transition-all ${
                  habit.completedToday
                    ? 'bg-white/30 scale-95'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeHabit(habit.id!)
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
                <div className={`text-2xl mb-1 ${habit.completedToday ? 'opacity-50' : ''}`}>
                  {habit.emoji}
                </div>
                <div className={`text-xs truncate ${habit.completedToday ? 'line-through opacity-50' : ''}`}>
                  {habit.name}
                </div>
                {habit.completedToday && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </button>
            ))}

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-1">+</div>
              <div className="text-xs">추가</div>
            </button>
          </div>
        )}
      </div>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addHabit}
      />
    </>
  )
}
