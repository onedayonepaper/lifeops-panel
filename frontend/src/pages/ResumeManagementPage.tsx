import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ProfileContent } from './ProfilePage'
import { SelfIntroductionContent } from './SelfIntroductionPage'
import { ResumeSummaryContent } from './ResumeSummaryPage'
import { CareerDescriptionContent } from './CareerDescriptionPage'
import { ResumeContent } from './ResumePage'
import { PortfolioContent } from './PortfolioPage'

const TABS = [
  { id: 'profile', label: '프로필', icon: '🧠' },
  { id: 'resume-summary', label: '이력서', icon: '📃' },
  { id: 'career-description', label: '경력기술서', icon: '📋' },
  { id: 'self-introduction', label: '자기소개서', icon: '✍️' },
  { id: 'portfolio', label: '포트폴리오', icon: '💼' },
  { id: 'job-document', label: '취업서류', icon: '📄' },
] as const

type TabId = typeof TABS[number]['id']

export default function ResumeManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div>
      <PageHeader icon="📝" title="이력관리" />

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 mb-4 bg-gray-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'profile' && <ProfileContent />}
      {activeTab === 'resume-summary' && <ResumeSummaryContent />}
      {activeTab === 'career-description' && <CareerDescriptionContent />}
      {activeTab === 'self-introduction' && <SelfIntroductionContent />}
      {activeTab === 'job-document' && <ResumeContent />}
      {activeTab === 'portfolio' && <PortfolioContent />}
    </div>
  )
}
