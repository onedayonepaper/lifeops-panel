import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

// 재테크 대시보드 - 자산 현황 요약
export default function FinancePage() {
  // 임시 데이터 (나중에 Google Sheets 연동)
  const summary = {
    totalAssets: 15000000,
    totalDebt: 0,
    netWorth: 15000000,
    monthlySavings: 500000,
    monthlyExpenses: 1200000,
  }

  const quickLinks = [
    { path: '/savings', icon: '🏦', label: '적금', value: '2건', color: 'blue' },
    { path: '/insurance', icon: '🛡️', label: '보험', value: '3건', color: 'green' },
    { path: '/subscriptions', icon: '📱', label: '구독', value: '5건', color: 'purple' },
    { path: '/fixed-expenses', icon: '📋', label: '고정지출', value: '8건', color: 'orange' },
    { path: '/cards', icon: '💳', label: '카드', value: '2장', color: 'pink' },
  ]

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  return (
    <div>
      <PageHeader icon="📊" title="자산현황" />

      {/* 총 자산 카드 */}
      <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6 mb-4">
        <div className="text-gray-400 text-sm mb-1">순자산</div>
        <div className="text-4xl font-bold text-white mb-4">
          {formatMoney(summary.netWorth)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">총 자산</div>
            <div className="text-emerald-400 font-medium">{formatMoney(summary.totalAssets)}</div>
          </div>
          <div>
            <div className="text-gray-400">총 부채</div>
            <div className="text-red-400 font-medium">{formatMoney(summary.totalDebt)}</div>
          </div>
        </div>
      </div>

      {/* 월간 현금 흐름 */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>💸</span> 월간 현금 흐름
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">월 저축</div>
            <div className="text-emerald-400 font-bold text-lg">{formatMoney(summary.monthlySavings)}</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3">
            <div className="text-gray-400 text-xs mb-1">월 지출</div>
            <div className="text-orange-400 font-bold text-lg">{formatMoney(summary.monthlyExpenses)}</div>
          </div>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>📁</span> 관리 항목
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-gray-700/50 hover:bg-gray-700 rounded-xl p-4 transition-colors group"
            >
              <div className="text-2xl mb-2">{link.icon}</div>
              <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                {link.label}
              </div>
              <div className="text-gray-400 text-sm">{link.value}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        각 항목을 클릭하여 상세 관리하세요
      </div>
    </div>
  )
}
