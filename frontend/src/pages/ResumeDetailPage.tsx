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
        <PageHeader icon="📄" title="취업서류" />
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
          <Link
            to={`/resume/${id}/edit`}
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
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
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
          {(data.personalInfo.blog || data.personalInfo.github || data.personalInfo.portfolio) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {data.personalInfo.blog && (
                <a href={data.personalInfo.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors">
                  📝 블로그
                </a>
              )}
              {data.personalInfo.github && (
                <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors">
                  💻 GitHub
                </a>
              )}
              {data.personalInfo.portfolio && (
                <a href={data.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors">
                  🎨 포트폴리오
                </a>
              )}
            </div>
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
