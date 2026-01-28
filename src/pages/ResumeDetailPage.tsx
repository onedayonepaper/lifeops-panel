import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs } from '../hooks/useGoogleDocs'

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useGoogleAuth()
  const { getResumeData, getResumeMeta, getDocumentUrl, deleteResume } = useGoogleDocs(accessToken)

  const meta = id ? getResumeMeta(id) : null
  const data = id ? getResumeData(id) : null

  if (!id || !data || !meta) {
    return (
      <div>
        <PageHeader icon="📄" title="이력서" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-400 mb-4">이력서를 찾을 수 없습니다</p>
          <Link
            to="/resume"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('이 이력서를 삭제하시겠습니까?')) {
      deleteResume(id)
      navigate('/resume')
    }
  }

  return (
    <div>
      <PageHeader icon="📄" title={meta.title}>
        <div className="flex items-center gap-2">
          <Link
            to="/resume"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ← 목록
          </Link>
          <a
            href={getDocumentUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google Docs
          </a>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </PageHeader>

      {/* Resume Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">{data.personalInfo.name}</h1>
          <div className="flex flex-wrap gap-4 text-blue-100">
            {data.personalInfo.phone && (
              <span className="flex items-center gap-1">
                <span>📱</span> {data.personalInfo.phone}
              </span>
            )}
            {data.personalInfo.email && (
              <span className="flex items-center gap-1">
                <span>✉️</span> {data.personalInfo.email}
              </span>
            )}
            {data.personalInfo.birthDate && (
              <span className="flex items-center gap-1">
                <span>🎂</span> {data.personalInfo.birthDate}
              </span>
            )}
          </div>
          {data.personalInfo.address && (
            <p className="mt-2 text-blue-100">📍 {data.personalInfo.address}</p>
          )}
        </div>

        <div className="p-8 space-y-8 text-gray-800">
          {/* Self Introduction */}
          {data.selfIntroduction && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                자기소개
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {data.selfIntroduction}
              </p>
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                기술 스택
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                경력사항
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{exp.company}</h3>
                      <span className="text-sm text-gray-500">
                        {exp.startDate} ~ {exp.endDate}
                      </span>
                    </div>
                    <p className="text-blue-600 font-medium">{exp.position}</p>
                    {exp.description && (
                      <p className="text-gray-600 mt-2">{exp.description}</p>
                    )}

                    {/* Projects */}
                    {exp.projects && exp.projects.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {exp.projects.map((proj, pIdx) => (
                          <div key={pIdx} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-800 mb-2">
                              📌 {proj.name}
                            </h4>
                            {proj.summary && (
                              <p className="text-gray-600 text-sm mb-2">{proj.summary}</p>
                            )}
                            {proj.role && (
                              <p className="text-sm mb-2">
                                <span className="font-medium text-gray-700">역할:</span>{' '}
                                <span className="text-gray-600">{proj.role}</span>
                              </p>
                            )}
                            {proj.tasks && proj.tasks.length > 0 && (
                              <div className="mb-2">
                                <span className="font-medium text-gray-700 text-sm">주요 작업:</span>
                                <ul className="list-disc list-inside text-gray-600 text-sm mt-1 space-y-1">
                                  {proj.tasks.map((task, tIdx) => (
                                    <li key={tIdx}>{task}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {proj.techStack && (
                              <p className="text-sm">
                                <span className="font-medium text-gray-700">기술:</span>{' '}
                                <span className="text-blue-600">{proj.techStack}</span>
                              </p>
                            )}
                            {proj.result && (
                              <p className="text-sm mt-1">
                                <span className="font-medium text-gray-700">성과:</span>{' '}
                                <span className="text-green-600">{proj.result}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                학력
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900">{edu.school}</span>
                      <span className="text-gray-600 ml-2">{edu.major}</span>
                      {edu.degree && (
                        <span className="text-blue-600 ml-2">({edu.degree})</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {edu.startDate} ~ {edu.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                자격증
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.certifications.map((cert, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">{cert.name}</div>
                    <div className="text-sm text-gray-500">
                      {cert.issuer}
                      {cert.date && ` · ${cert.date}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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
