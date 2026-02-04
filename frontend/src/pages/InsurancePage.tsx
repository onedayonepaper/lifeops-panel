import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface Insurance {
  id: string
  company: string
  name: string
  type: '생명' | '손해' | '건강' | '자동차' | '실손'
  monthlyPremium: number
  paymentDay: number
  startDate: string
  endDate: string | null
  coverage: string[]
  beneficiary: string
  autoPayment: boolean
}

export default function InsurancePage() {
  const [insurances] = useState<Insurance[]>([
    {
      id: '1',
      company: '삼성생명',
      name: '무배당 건강보험',
      type: '건강',
      monthlyPremium: 45000,
      paymentDay: 15,
      startDate: '2023-03-01',
      endDate: null,
      coverage: ['암진단금 3천만원', '입원일당 5만원', '수술비 500만원'],
      beneficiary: '본인',
      autoPayment: true,
    },
    {
      id: '2',
      company: '현대해상',
      name: '실손의료보험',
      type: '실손',
      monthlyPremium: 25000,
      paymentDay: 10,
      startDate: '2022-06-01',
      endDate: null,
      coverage: ['입원의료비 90%', '통원의료비 90%', '약제비 90%'],
      beneficiary: '본인',
      autoPayment: true,
    },
    {
      id: '3',
      company: 'DB손해보험',
      name: '운전자보험',
      type: '손해',
      monthlyPremium: 15000,
      paymentDay: 20,
      startDate: '2024-01-01',
      endDate: '2034-01-01',
      coverage: ['교통사고 벌금', '변호사 선임비', '면허정지 위로금'],
      beneficiary: '본인',
      autoPayment: true,
    },
  ])

  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null)

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getTypeColor = (type: Insurance['type']) => {
    const colors = {
      '생명': 'bg-purple-500/20 text-purple-400',
      '손해': 'bg-orange-500/20 text-orange-400',
      '건강': 'bg-emerald-500/20 text-emerald-400',
      '자동차': 'bg-blue-500/20 text-blue-400',
      '실손': 'bg-cyan-500/20 text-cyan-400',
    }
    return colors[type]
  }

  const totalMonthlyPremium = insurances.reduce((sum, ins) => sum + ins.monthlyPremium, 0)
  const yearlyPremium = totalMonthlyPremium * 12

  return (
    <div>
      <PageHeader icon="🛡️" title="보험 관리" />

      {/* 요약 */}
      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs mb-1">가입 보험</div>
            <div className="text-white font-bold text-xl">{insurances.length}건</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">월 보험료</div>
            <div className="text-emerald-400 font-bold">{formatMoney(totalMonthlyPremium)}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">연 보험료</div>
            <div className="text-white font-bold">{formatMoney(yearlyPremium)}</div>
          </div>
        </div>
      </div>

      {/* 보험 목록 */}
      <div className="space-y-3">
        {insurances.map((insurance) => (
          <button
            key={insurance.id}
            onClick={() => setSelectedInsurance(insurance)}
            className="w-full bg-gray-800 rounded-2xl p-4 text-left hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold">{insurance.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(insurance.type)}`}>
                    {insurance.type}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">{insurance.company}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{formatMoney(insurance.monthlyPremium)}</div>
                <div className="text-gray-500 text-xs">월 보험료</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>📅 매월 {insurance.paymentDay}일</span>
              {insurance.autoPayment && <span className="text-emerald-400">✓ 자동이체</span>}
              <span>👤 {insurance.beneficiary}</span>
            </div>
          </button>
        ))}
      </div>

      {insurances.length === 0 && (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="text-gray-400">등록된 보험이 없습니다</p>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedInsurance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedInsurance(null)}>
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedInsurance.name}</h2>
                <p className="text-gray-400 text-sm">{selectedInsurance.company}</p>
              </div>
              <button onClick={() => setSelectedInsurance(null)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">월 보험료</div>
                  <div className="text-white font-bold">{formatMoney(selectedInsurance.monthlyPremium)}</div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">납입일</div>
                  <div className="text-white font-bold">매월 {selectedInsurance.paymentDay}일</div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">보장 내용</h4>
                <ul className="space-y-2">
                  {selectedInsurance.coverage.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white text-sm">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">가입일</div>
                  <div className="text-white">{selectedInsurance.startDate}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">만기일</div>
                  <div className="text-white">{selectedInsurance.endDate || '종신'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
