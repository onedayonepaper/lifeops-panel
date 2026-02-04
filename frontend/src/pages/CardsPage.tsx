import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface Card {
  id: string
  company: string
  name: string
  type: '신용' | '체크'
  lastFourDigits: string
  paymentDay: number
  annualFee: number
  benefits: string[]
  monthlySpent: number
  monthlyLimit?: number
  color: string
}

export default function CardsPage() {
  const [cards] = useState<Card[]>([
    {
      id: '1',
      company: '삼성카드',
      name: 'taptap O',
      type: '신용',
      lastFourDigits: '1234',
      paymentDay: 15,
      annualFee: 15000,
      benefits: ['스타벅스 50% 할인', '교통 10% 적립', 'CGV 50% 할인'],
      monthlySpent: 450000,
      monthlyLimit: 3000000,
      color: 'from-blue-600 to-blue-800',
    },
    {
      id: '2',
      company: '카카오뱅크',
      name: '카카오뱅크 체크카드',
      type: '체크',
      lastFourDigits: '5678',
      paymentDay: 0,
      annualFee: 0,
      benefits: ['전가맹점 0.2% 적립', '교통 5% 적립', 'ATM 수수료 면제'],
      monthlySpent: 280000,
      color: 'from-yellow-500 to-yellow-700',
    },
  ])

  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const totalMonthlySpent = cards.reduce((sum, card) => sum + card.monthlySpent, 0)
  const totalAnnualFee = cards.reduce((sum, card) => sum + card.annualFee, 0)

  return (
    <div>
      <PageHeader icon="💳" title="카드 관리" />

      {/* 요약 */}
      <div className="bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">보유 카드</div>
            <div className="text-white font-bold text-xl">{cards.length}장</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">이번 달 사용</div>
            <div className="text-pink-400 font-bold">{formatMoney(totalMonthlySpent)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">연회비 합계</div>
            <div className="text-white font-bold">{formatMoney(totalAnnualFee)}</div>
          </div>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="space-y-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className="w-full text-left"
          >
            {/* 카드 디자인 */}
            <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 relative overflow-hidden`}>
              {/* 카드 무늬 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-white/70 text-sm">{card.company}</div>
                    <div className="text-white font-bold text-lg">{card.name}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    card.type === '신용' ? 'bg-white/20 text-white' : 'bg-black/20 text-white'
                  }`}>
                    {card.type}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-white/80 font-mono text-lg tracking-wider">
                    •••• •••• •••• {card.lastFourDigits}
                  </div>
                  {card.type === '신용' && (
                    <div className="text-right">
                      <div className="text-white/60 text-xs">결제일</div>
                      <div className="text-white font-medium">{card.paymentDay}일</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 카드 정보 */}
            <div className="bg-gray-800 rounded-b-2xl -mt-2 pt-4 px-4 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs">이번 달 사용</div>
                  <div className="text-white font-bold">{formatMoney(card.monthlySpent)}</div>
                </div>
                {card.monthlyLimit && (
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">한도</div>
                    <div className="text-gray-300">{formatMoney(card.monthlyLimit)}</div>
                  </div>
                )}
              </div>

              {card.monthlyLimit && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        card.monthlySpent / card.monthlyLimit > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((card.monthlySpent / card.monthlyLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {Math.round((card.monthlySpent / card.monthlyLimit) * 100)}% 사용
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-400">등록된 카드가 없습니다</p>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedCard(null)}>
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
                <p className="text-gray-400 text-sm">{selectedCard.company}</p>
              </div>
              <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">카드 종류</div>
                  <div className="text-white font-bold">{selectedCard.type}카드</div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">연회비</div>
                  <div className="text-white font-bold">{formatMoney(selectedCard.annualFee)}</div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">주요 혜택</h4>
                <ul className="space-y-2">
                  {selectedCard.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white text-sm bg-gray-700/30 rounded-lg p-2">
                      <span className="text-emerald-400">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCard.type === '신용' && (
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-2">이용 현황</div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">이번 달 사용</span>
                    <span className="text-white font-bold">{formatMoney(selectedCard.monthlySpent)}</span>
                  </div>
                  {selectedCard.monthlyLimit && (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">이용 한도</span>
                        <span className="text-gray-300">{formatMoney(selectedCard.monthlyLimit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">잔여 한도</span>
                        <span className="text-emerald-400">{formatMoney(selectedCard.monthlyLimit - selectedCard.monthlySpent)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
