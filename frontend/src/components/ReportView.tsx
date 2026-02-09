import { forwardRef } from 'react'
import type { DashboardSummary } from '../hooks/useDashboardData'

interface ReportViewProps {
  data: DashboardSummary
}

export const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(
  function ReportView({ data }, ref) {
    const date = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          padding: '36px 40px',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #1e40af', paddingBottom: '14px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 2px 0' }}>
            미래계획 보고서
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            최대열 | {date} 기준
          </p>
        </div>

        {/* 1. 목표 & 방향 */}
        <Section title="🎯 목표 및 방향">
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
              최종 목표: 공공기관/준정부기관 전산직 정규직 입사
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563' }}>
              광주/전남 소재 | 경력 1년 3개월 (Java/Spring Boot, React) | 정보처리기사 보유
            </div>
          </div>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ ...thStyle, width: '60px' }}>분야</th>
                <th style={thStyle}>세부 목표</th>
                <th style={{ ...thStyle, width: '100px' }}>목표 시점</th>
              </tr>
            </thead>
            <tbody>
              {data.goals.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#2563eb' }}>{g.category}</td>
                  <td style={tdStyle}>{g.goal}</td>
                  <td style={{ ...tdStyle, color: '#6b7280', textAlign: 'center' }}>{g.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 2. 현재 상태 요약 - 2x2 compact */}
        <Section title="📊 현재 진행 상황">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <CompactCard
              title="구직활동"
              stats={[
                { label: '지원', value: `${data.jobSearch.totalApplied}건`, color: '#2563eb' },
                { label: '진행', value: `${data.jobSearch.inProgress}건`, color: '#7c3aed' },
                { label: '합격', value: `${data.jobSearch.offers}건`, color: '#16a34a' },
              ]}
            />
            <CompactCard
              title="스펙/자격증"
              stats={[
                { label: '취득', value: `${data.spec.passed}개`, color: '#16a34a' },
                { label: '접수/준비', value: `${data.spec.registered + data.spec.studying}개`, color: '#2563eb' },
                { label: '미시작', value: `${data.spec.notStarted}개`, color: '#9ca3af' },
              ]}
            />
            <CompactCard
              title="일상 루틴"
              stats={[
                { label: '완료율', value: `${data.routine.percentage}%`, color: data.routine.percentage >= 80 ? '#16a34a' : data.routine.percentage >= 50 ? '#f59e0b' : '#dc2626' },
                { label: '할일', value: `${data.routine.taskCompleted}/${data.routine.taskTotal}`, color: '#374151' },
              ]}
            />
            <CompactCard
              title="재테크"
              stats={[
                { label: '순자산', value: data.finance.netAsset, color: '#374151' },
                { label: '월저축', value: data.finance.monthlySaving, color: '#2563eb' },
              ]}
            />
          </div>
          {/* 스펙 한줄 현황 */}
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280', lineHeight: '1.6', padding: '6px 8px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
            {data.spec.items.map(item => (
              <span key={item.name} style={{ marginRight: '6px' }}>
                {item.status === 'passed' ? '✅' : item.status === 'registered' ? '📝' : '⬜'} {item.name}
              </span>
            ))}
          </div>
        </Section>

        {/* 3. 월별 실행 로드맵 */}
        <Section title="📅 월별 실행 계획">
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ ...thStyle, width: '110px' }}>시기</th>
                <th style={thStyle}>실행 항목</th>
              </tr>
            </thead>
            <tbody>
              {data.roadmap.map((rm, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#1e40af', whiteSpace: 'nowrap' }}>{rm.month}</td>
                  <td style={tdStyle}>
                    {rm.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: j < rm.items.length - 1 ? '2px' : 0 }}>
                        <span style={{ color: '#2563eb', flexShrink: 0 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Footer */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          LifeOps Panel에서 자동 생성 | {date}
        </div>
      </div>
    )
  }
)

const thStyle: React.CSSProperties = {
  padding: '6px 8px',
  textAlign: 'left',
  fontSize: '10px',
  color: '#6b7280',
  fontWeight: '600',
}

const tdStyle: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: '11px',
  color: '#374151',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 8px 0' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function CompactCard({ title, stats }: { title: string; stats: { label: string; value: string; color: string }[] }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{title}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
