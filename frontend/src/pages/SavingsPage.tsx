import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface SavingsAccount {
  id: string
  bank: string
  name: string
  monthlyAmount: number
  interestRate: number
  startDate: string
  endDate: string
  totalDeposited: number
  expectedTotal: number
  autoTransfer: boolean
  transferDay: number
}

export default function SavingsPage() {
  const [accounts] = useState<SavingsAccount[]>([
    {
      id: '1',
      bank: '카카오뱅크',
      name: '26주 적금',
      monthlyAmount: 300000,
      interestRate: 4.5,
      startDate: '2025-07-01',
      endDate: '2026-06-30',
      totalDeposited: 2100000,
      expectedTotal: 3694500,
      autoTransfer: true,
      transferDay: 1,
    },
    {
      id: '2',
      bank: '토스뱅크',
      name: '목표 적금',
      monthlyAmount: 200000,
      interestRate: 4.0,
      startDate: '2025-10-01',
      endDate: '2026-09-30',
      totalDeposited: 800000,
      expectedTotal: 2448000,
      autoTransfer: true,
      transferDay: 5,
    },
  ])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getProgress = (account: SavingsAccount) => {
    const start = new Date(account.startDate)
    const end = new Date(account.endDate)
    const now = new Date()
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const passedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100)
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const totalMonthly = accounts.reduce((sum, acc) => sum + acc.monthlyAmount, 0)
  const totalDeposited = accounts.reduce((sum, acc) => sum + acc.totalDeposited, 0)
  const totalExpected = accounts.reduce((sum, acc) => sum + acc.expectedTotal, 0)

  return (
    <div>
      <PageHeader icon="🏦" title="적금 관리">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      {/* 요약 */}
      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">월 납입액</div>
            <div className="text-white font-bold">{formatMoney(totalMonthly)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">총 납입액</div>
            <div className="text-blue-400 font-bold">{formatMoney(totalDeposited)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">예상 수령액</div>
            <div className="text-emerald-400 font-bold">{formatMoney(totalExpected)}</div>
          </div>
        </div>
      </div>

      {/* 적금 목록 */}
      <div className="space-y-3">
        {accounts.map((account) => {
          const progress = getProgress(account)
          const daysLeft = getDaysLeft(account.endDate)

          return (
            <div
              key={account.id}
              className="bg-gray-800 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">{account.name}</span>
                    {account.autoTransfer && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        자동이체
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{account.bank}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{account.interestRate}%</div>
                  <div className="text-gray-500 text-xs">연이율</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">월 납입</div>
                  <div className="text-white">{formatMoney(account.monthlyAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">이체일</div>
                  <div className="text-white">매월 {account.transferDay}일</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">현재 납입</div>
                  <div className="text-blue-400">{formatMoney(account.totalDeposited)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">만기 예상</div>
                  <div className="text-emerald-400">{formatMoney(account.expectedTotal)}</div>
                </div>
              </div>

              {/* 진행률 */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>진행률</span>
                  <span>
                    {daysLeft > 0 ? `D-${daysLeft}` : '만기'}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{account.startDate}</span>
                  <span>{account.endDate}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🏦</div>
          <p className="text-gray-400 mb-2">등록된 적금이 없습니다</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-blue-400 hover:text-blue-300"
          >
            + 적금 추가하기
          </button>
        </div>
      )}

      {/* 추가 모달 (간단한 placeholder) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">적금 추가</h2>
            <p className="text-gray-400 text-sm mb-4">
              Google Sheets 연동 후 사용할 수 있습니다.
            </p>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
