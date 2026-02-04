import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface Subscription {
  id: string
  name: string
  category: '영상' | '음악' | '클라우드' | '생산성' | '게임' | '기타'
  price: number
  billingCycle: '월' | '년'
  nextBillingDate: string
  autoRenewal: boolean
  sharedWith?: string[]
  note?: string
}

export default function SubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      name: 'Netflix',
      category: '영상',
      price: 17000,
      billingCycle: '월',
      nextBillingDate: '2026-02-15',
      autoRenewal: true,
      sharedWith: ['가족'],
    },
    {
      id: '2',
      name: 'YouTube Premium',
      category: '영상',
      price: 14900,
      billingCycle: '월',
      nextBillingDate: '2026-02-10',
      autoRenewal: true,
    },
    {
      id: '3',
      name: 'Spotify',
      category: '음악',
      price: 10900,
      billingCycle: '월',
      nextBillingDate: '2026-02-20',
      autoRenewal: true,
    },
    {
      id: '4',
      name: 'iCloud+',
      category: '클라우드',
      price: 1100,
      billingCycle: '월',
      nextBillingDate: '2026-02-05',
      autoRenewal: true,
      note: '50GB',
    },
    {
      id: '5',
      name: 'ChatGPT Plus',
      category: '생산성',
      price: 20,
      billingCycle: '월',
      nextBillingDate: '2026-02-08',
      autoRenewal: true,
      note: 'USD',
    },
  ])

  const formatMoney = (amount: number, note?: string) => {
    if (note === 'USD') {
      return `$${amount}`
    }
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getCategoryIcon = (category: Subscription['category']) => {
    const icons = {
      '영상': '🎬',
      '음악': '🎵',
      '클라우드': '☁️',
      '생산성': '⚡',
      '게임': '🎮',
      '기타': '📦',
    }
    return icons[category]
  }

  const getCategoryColor = (category: Subscription['category']) => {
    const colors = {
      '영상': 'bg-red-500/20 text-red-400',
      '음악': 'bg-green-500/20 text-green-400',
      '클라우드': 'bg-blue-500/20 text-blue-400',
      '생산성': 'bg-yellow-500/20 text-yellow-400',
      '게임': 'bg-purple-500/20 text-purple-400',
      '기타': 'bg-gray-500/20 text-gray-400',
    }
    return colors[category]
  }

  const getDaysUntilBilling = (date: string) => {
    const billing = new Date(date)
    const now = new Date()
    const days = Math.ceil((billing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  // 월 환산 금액 계산 (USD는 1400원 기준)
  const getMonthlyAmount = (sub: Subscription) => {
    let amount = sub.price
    if (sub.note === 'USD') {
      amount = sub.price * 1400
    }
    if (sub.billingCycle === '년') {
      amount = amount / 12
    }
    return amount
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0)
  const totalYearly = totalMonthly * 12

  // 카테고리별 그룹화
  const groupedByCategory = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = []
    }
    acc[sub.category].push(sub)
    return acc
  }, {} as Record<string, Subscription[]>)

  return (
    <div>
      <PageHeader icon="📱" title="구독 서비스" />

      {/* 요약 */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">구독 수</div>
            <div className="text-white font-bold text-xl">{subscriptions.length}개</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">월 구독료</div>
            <div className="text-purple-400 font-bold">≈ {new Intl.NumberFormat('ko-KR').format(Math.round(totalMonthly))}원</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">연 구독료</div>
            <div className="text-white font-bold">≈ {new Intl.NumberFormat('ko-KR').format(Math.round(totalYearly))}원</div>
          </div>
        </div>
      </div>

      {/* 카테고리별 목록 */}
      {Object.entries(groupedByCategory).map(([category, subs]) => (
        <div key={category} className="mb-4">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <span>{getCategoryIcon(category as Subscription['category'])}</span>
            {category}
            <span className="text-gray-500 text-sm font-normal">({subs.length})</span>
          </h3>
          <div className="space-y-2">
            {subs.map((sub) => {
              const daysUntil = getDaysUntilBilling(sub.nextBillingDate)
              return (
                <div
                  key={sub.id}
                  className="bg-gray-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getCategoryColor(sub.category)} flex items-center justify-center text-lg`}>
                      {getCategoryIcon(sub.category)}
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {sub.name}
                        {sub.sharedWith && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            공유
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {daysUntil <= 3 ? (
                          <span className="text-orange-400">D-{daysUntil} 결제</span>
                        ) : (
                          <span>D-{daysUntil} 결제</span>
                        )}
                        {sub.note && sub.note !== 'USD' && <span className="ml-2">· {sub.note}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {formatMoney(sub.price, sub.note)}
                    </div>
                    <div className="text-gray-500 text-xs">/{sub.billingCycle}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {subscriptions.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">📱</div>
          <p className="text-gray-400">등록된 구독이 없습니다</p>
        </div>
      )}
    </div>
  )
}
