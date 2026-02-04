import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface FixedExpense {
  id: string
  name: string
  category: '주거' | '통신' | '교통' | '공과금' | '교육' | '기타'
  amount: number
  paymentDay: number
  paymentMethod: string
  autoPayment: boolean
  note?: string
}

export default function FixedExpensesPage() {
  const [expenses] = useState<FixedExpense[]>([
    {
      id: '1',
      name: '월세',
      category: '주거',
      amount: 450000,
      paymentDay: 25,
      paymentMethod: '계좌이체',
      autoPayment: true,
    },
    {
      id: '2',
      name: '관리비',
      category: '주거',
      amount: 80000,
      paymentDay: 25,
      paymentMethod: '계좌이체',
      autoPayment: true,
      note: '여름/겨울 변동',
    },
    {
      id: '3',
      name: '휴대폰',
      category: '통신',
      amount: 55000,
      paymentDay: 10,
      paymentMethod: '카드자동결제',
      autoPayment: true,
      note: 'KT 5G',
    },
    {
      id: '4',
      name: '인터넷',
      category: '통신',
      amount: 33000,
      paymentDay: 15,
      paymentMethod: '카드자동결제',
      autoPayment: true,
      note: 'KT 기가인터넷',
    },
    {
      id: '5',
      name: '전기세',
      category: '공과금',
      amount: 30000,
      paymentDay: 20,
      paymentMethod: '자동이체',
      autoPayment: true,
      note: '평균 금액',
    },
    {
      id: '6',
      name: '가스비',
      category: '공과금',
      amount: 15000,
      paymentDay: 20,
      paymentMethod: '자동이체',
      autoPayment: true,
      note: '평균 금액',
    },
    {
      id: '7',
      name: '수도세',
      category: '공과금',
      amount: 10000,
      paymentDay: 25,
      paymentMethod: '자동이체',
      autoPayment: true,
      note: '2개월 단위',
    },
    {
      id: '8',
      name: '교통카드 충전',
      category: '교통',
      amount: 50000,
      paymentDay: 1,
      paymentMethod: '카드',
      autoPayment: false,
      note: '월 평균',
    },
  ])

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getCategoryIcon = (category: FixedExpense['category']) => {
    const icons = {
      '주거': '🏠',
      '통신': '📡',
      '교통': '🚌',
      '공과금': '💡',
      '교육': '📚',
      '기타': '📦',
    }
    return icons[category]
  }

  const getCategoryColor = (category: FixedExpense['category']) => {
    const colors = {
      '주거': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      '통신': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      '교통': 'bg-green-500/20 text-green-400 border-green-500/30',
      '공과금': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      '교육': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      '기타': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[category]
  }

  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // 카테고리별 합계
  const categoryTotals = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = 0
    }
    acc[exp.category] += exp.amount
    return acc
  }, {} as Record<string, number>)

  // 카테고리별 그룹화
  const groupedByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = []
    }
    acc[exp.category].push(exp)
    return acc
  }, {} as Record<string, FixedExpense[]>)

  return (
    <div>
      <PageHeader icon="📋" title="고정 지출" />

      {/* 요약 */}
      <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-4 mb-4">
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-1">월 고정 지출</div>
          <div className="text-3xl font-bold text-white">{formatMoney(totalMonthly)}</div>
        </div>

        {/* 카테고리별 비율 바 */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div
              key={category}
              className={`h-full ${getCategoryColor(category as FixedExpense['category']).split(' ')[0]}`}
              style={{ width: `${(amount / totalMonthly) * 100}%` }}
              title={`${category}: ${formatMoney(amount)}`}
            />
          ))}
        </div>

        {/* 카테고리별 범례 */}
        <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <div key={category} className="flex items-center gap-1">
              <span>{getCategoryIcon(category as FixedExpense['category'])}</span>
              <span className="text-gray-400">{category}</span>
              <span className="text-white font-medium">{formatMoney(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리별 목록 */}
      {Object.entries(groupedByCategory).map(([category, exps]) => (
        <div key={category} className="mb-4">
          <h3 className="text-white font-bold mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{getCategoryIcon(category as FixedExpense['category'])}</span>
              {category}
            </div>
            <span className="text-gray-400 text-sm font-normal">
              {formatMoney(categoryTotals[category])}
            </span>
          </h3>
          <div className="space-y-2">
            {exps.map((expense) => (
              <div
                key={expense.id}
                className={`bg-gray-800 rounded-xl p-4 border ${getCategoryColor(expense.category).split(' ')[2]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium flex items-center gap-2">
                      {expense.name}
                      {expense.autoPayment && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                          자동
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      매월 {expense.paymentDay}일 · {expense.paymentMethod}
                      {expense.note && <span className="ml-2 text-gray-500">({expense.note})</span>}
                    </div>
                  </div>
                  <div className="text-white font-bold">
                    {formatMoney(expense.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {expenses.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-400">등록된 고정 지출이 없습니다</p>
        </div>
      )}
    </div>
  )
}
