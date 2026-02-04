import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs } from '../hooks/useGoogleDocs'

// 총 경력기간 계산 함수
function calculateTotalCareer(experiences: { startDate: string; endDate: string }[]): string {
  let totalMonths = 0

  experiences.forEach(exp => {
    const parseDate = (dateStr: string): Date => {
      if (dateStr === '현재' || dateStr === '') {
        return new Date()
      }
      const parts = dateStr.split('.')
      const year = parseInt(parts[0])
      const month = parseInt(parts[1] || '1') - 1
      const day = parseInt(parts[2] || '1')
      return new Date(year, month, day)
    }

    const startDate = parseDate(exp.startDate)
    const endDate = parseDate(exp.endDate)

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
      + (endDate.getMonth() - startDate.getMonth())

    if (months > 0) {
      totalMonths += months
    }
  })

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (years > 0 && months > 0) {
    return `${years}년 ${months}개월`
  } else if (years > 0) {
    return `${years}년`
  } else {
    return `${months}개월`
  }
}

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useGoogleAuth()
  const { getResumeData, getResumeMeta, getDocumentUrl, deleteResume } = useGoogleDocs(accessToken)

  const meta = id ? getResumeMeta(id) : null
  const data = id ? getResumeData(id) : null

  if (!id || !data || !meta) {
    return (
      <div>
        <PageHeader icon="📋" title="경력기술서" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-400 mb-4">경력기술서를 찾을 수 없습니다</p>
          <Link
            to="/job-document"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('이 경력기술서를 삭제하시겠습니까?')) {
      deleteResume(id)
      navigate('/job-document')
    }
  }

  // 연결된 이력서 찾기
  const linkedResume = meta.linkedId ? getResumeMeta(meta.linkedId) : null

  return (
    <div>
      <PageHeader icon="📋" title={meta.title}>
        <div className="flex items-center gap-2">
          <Link
            to="/job-document"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ← 목록
          </Link>
          {linkedResume && (
            <Link
              to={`/job-document/${linkedResume.id}`}
              className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-sm rounded-lg transition-colors"
            >
              📄 이력서 보기
            </Link>
          )}
          <Link
            to={`/career/${id}/edit`}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정하기
          </Link>
          <a
            href={getDocumentUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google 문서로 보기
          </a>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </PageHeader>

      {/* Career Description Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">경력기술서</h1>
          <div className="text-green-100">
            <p className="text-xl font-medium">{data.personalInfo.name}</p>
            {data.experience.length > 0 && (
              <p className="text-lg mt-1">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  총 경력: {calculateTotalCareer(data.experience)}
                </span>
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {data.personalInfo.phone && (
                <span>📱 {data.personalInfo.phone}</span>
              )}
              {data.personalInfo.email && (
                <span>✉️ {data.personalInfo.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 text-gray-800">
          {/* Experience with STAR Format */}
          {data.experience.length > 0 && data.experience.map((exp, expIdx) => (
            <section key={expIdx} className="border-b border-gray-200 pb-8 last:border-b-0">
              {/* Company Header */}
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {expIdx + 1}. {exp.company}
                  </h2>
                  <span className="text-sm text-gray-500 font-medium">
                    {exp.startDate} ~ {exp.endDate}
                  </span>
                </div>
                <p className="text-green-600 font-medium mt-1">{exp.position}</p>
                {exp.description && (
                  <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                )}
              </div>

              {/* Projects with STAR Format */}
              {exp.projects && exp.projects.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-green-600">📂</span> 프로젝트 상세
                  </h3>

                  {exp.projects.map((proj, projIdx) => (
                    <div key={projIdx} className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-5 border border-green-100">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {projIdx + 1}
                        </span>
                        {proj.name}
                      </h4>

                      {/* STAR Format */}
                      <div className="space-y-4">
                        {/* Situation */}
                        {proj.summary && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <span className="inline-block w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                S
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                                Situation (상황)
                              </p>
                              <p className="text-gray-700">{proj.summary}</p>
                            </div>
                          </div>
                        )}

                        {/* Task */}
                        {proj.role && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <span className="inline-block w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                T
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">
                                Task (과제)
                              </p>
                              <p className="text-gray-700">역할: {proj.role}</p>
                            </div>
                          </div>
                        )}

                        {/* Action */}
                        {proj.tasks && proj.tasks.length > 0 && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <span className="inline-block w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                A
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                                Action (행동)
                              </p>
                              <ul className="space-y-1">
                                {proj.tasks.map((task, tIdx) => (
                                  <li key={tIdx} className="text-gray-700 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Result */}
                        {proj.result && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <span className="inline-block w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                R
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                                Result (결과)
                              </p>
                              <p className="text-gray-700 font-medium">{proj.result}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tech Stack */}
                      {proj.techStack && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">🛠️ 기술/환경:</span>{' '}
                            <span className="text-green-700">{proj.techStack}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No projects case */}
              {(!exp.projects || exp.projects.length === 0) && exp.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">{exp.description}</p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-4 text-center text-gray-500 text-sm">
          생성일: {new Date(meta.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}
