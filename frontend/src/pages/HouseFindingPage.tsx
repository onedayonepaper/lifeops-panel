import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface HouseItem {
  id: string
  name: string
  address: string
  price: string
  deposit?: string
  size?: string
  floor?: string
  moveInDate?: string
  pros: string[]
  cons: string[]
  url?: string
  notes?: string
  status: 'interested' | 'visited' | 'applied' | 'rejected' | 'selected'
}

const STATUS_OPTIONS = [
  { value: 'interested', label: '관심', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'visited', label: '방문', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'applied', label: '신청', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'rejected', label: '탈락', color: 'bg-red-500/20 text-red-400' },
  { value: 'selected', label: '계약', color: 'bg-green-500/20 text-green-400' },
]

export default function HouseFindingPage() {
  const [houses, setHouses] = useState<HouseItem[]>(() => {
    const saved = localStorage.getItem('house-finding-items')
    return saved ? JSON.parse(saved) : []
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<HouseItem>>({
    status: 'interested',
    pros: [],
    cons: [],
  })

  const saveHouses = (newHouses: HouseItem[]) => {
    setHouses(newHouses)
    localStorage.setItem('house-finding-items', JSON.stringify(newHouses))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return

    if (editingId) {
      const updated = houses.map(h =>
        h.id === editingId ? { ...h, ...formData } as HouseItem : h
      )
      saveHouses(updated)
      setEditingId(null)
    } else {
      const newItem: HouseItem = {
        id: Date.now().toString(),
        name: formData.name || '',
        address: formData.address || '',
        price: formData.price || '',
        deposit: formData.deposit,
        size: formData.size,
        floor: formData.floor,
        moveInDate: formData.moveInDate,
        pros: formData.pros || [],
        cons: formData.cons || [],
        url: formData.url,
        notes: formData.notes,
        status: formData.status || 'interested',
      }
      saveHouses([...houses, newItem])
    }

    setFormData({ status: 'interested', pros: [], cons: [] })
    setShowAddForm(false)
  }

  const handleEdit = (house: HouseItem) => {
    setFormData(house)
    setEditingId(house.id)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('삭제할까요?')) {
      saveHouses(houses.filter(h => h.id !== id))
    }
  }

  const updateStatus = (id: string, status: HouseItem['status']) => {
    const updated = houses.map(h => h.id === id ? { ...h, status } : h)
    saveHouses(updated)
  }

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || ''
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || ''
  }

  return (
    <div>
      <PageHeader icon="🏠" title="방구하기">
        <button
          onClick={() => {
            setFormData({ status: 'interested', pros: [], cons: [] })
            setEditingId(null)
            setShowAddForm(true)
          }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="매물 추가"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4">
        {/* 추가/수정 폼 */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? '매물 수정' : '새 매물 추가'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="매물명 (예: 역삼동 오피스텔)"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="주소"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="월세 (예: 50만원)"
                value={formData.price || ''}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="보증금 (예: 1000만원)"
                value={formData.deposit || ''}
                onChange={e => setFormData({ ...formData, deposit: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="평수/크기"
                value={formData.size || ''}
                onChange={e => setFormData({ ...formData, size: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="층수"
                value={formData.floor || ''}
                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="입주 가능일"
                value={formData.moveInDate || ''}
                onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="링크 (직방, 다방 등)"
                value={formData.url || ''}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="장점 (쉼표로 구분)"
                value={formData.pros?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, pros: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <input
                type="text"
                placeholder="단점 (쉼표로 구분)"
                value={formData.cons?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, cons: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              />
              <select
                value={formData.status || 'interested'}
                onChange={e => setFormData({ ...formData, status: e.target.value as HouseItem['status'] })}
                className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="메모"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full mt-4 px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              rows={2}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData({ status: 'interested', pros: [], cons: [] })
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 매물 목록 */}
        {houses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🏠</div>
            <p>등록된 매물이 없습니다</p>
            <p className="text-sm mt-2">상단의 + 버튼으로 매물을 추가하세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {houses.map(house => (
              <div key={house.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{house.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(house.status)}`}>
                        {getStatusLabel(house.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{house.address}</p>
                  </div>
                  <div className="flex gap-1">
                    {house.url && (
                      <a
                        href={house.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                        title="링크 열기"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(house)}
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                      title="수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(house.id)}
                      className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                  {house.deposit && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">보증금:</span> {house.deposit}
                    </div>
                  )}
                  {house.price && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">월세:</span> {house.price}
                    </div>
                  )}
                  {house.size && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">크기:</span> {house.size}
                    </div>
                  )}
                  {house.floor && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">층:</span> {house.floor}
                    </div>
                  )}
                  {house.moveInDate && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">입주:</span> {house.moveInDate}
                    </div>
                  )}
                </div>

                {(house.pros.length > 0 || house.cons.length > 0) && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {house.pros.map((pro, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                        +{pro}
                      </span>
                    ))}
                    {house.cons.map((con, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                        -{con}
                      </span>
                    ))}
                  </div>
                )}

                {house.notes && (
                  <p className="text-sm text-gray-500">{house.notes}</p>
                )}

                {/* 상태 변경 버튼 */}
                <div className="flex gap-1 mt-3 pt-3 border-t border-gray-700">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateStatus(house.id, opt.value as HouseItem['status'])}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        house.status === opt.value
                          ? opt.color
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
